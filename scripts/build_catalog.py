# Build the confirmed 282-dish catalog from the 07-15 judgment sheet + 07-16/07-17 rulings.
# Source of truth for exclusions: docs/catalog-judgment-final-2026-07-16.md
# Output: docs/catalog-282.json (id-less; names + box + tier + origin section)
#
# Rule recap:
#   blank judgment = OK (owner ruling 07-16)
#   owner-x 31 / cleanup-x / dup-lock 2 / pending-5 -> excluded
#   07-17 owner ruling: pending-5 all excluded; アマトリチャーナ + あんかけチャーハン revived
#
# Count note (2026-07-17): the final doc's "282" double-counted the dup-lock pair
# (かぼちゃの煮物 / 里芋の煮っころがし) in both A2 and C. True pre-revival total is
# 280 = A71 + A2 4 + B175 + C30 (★13 + cleanup-survivors 17). With the 2 revivals: 282.
# The doc also declared 73 cleanup-x names while enumerating only 68; the missing
# names are added explicitly below.

import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', 'docs')
SHEET = os.path.join(DOCS, 'catalog-rebuild-2026-07-15-lists.md')

BOX_MAP = {
    '主菜（肉）': '主菜(肉)',
    '主菜（魚・魚介）': '主菜(魚介)',
    '主菜（卵・豆腐）＋汁もの': '主菜(卵・豆腐)+汁もの',
    '副菜・おとも': '副菜・おとも',
    'ごはんもの＋麺類': 'ごはんもの+麺類',
}

OWNER_X = """あんかけスパ うどんすき うな丼風たれ卵かけご飯 みそラーメン風スープ カレーソースハンバーグ
カレーパン風揚げパン カレー南蛮うどん カレー焼きそば カレー風味豚汁 カレー風味野菜炒め
サーモンチャーハン シンガポールヌードル スープカレー ペペロン炒飯風ライス マーボーカレー
ミニハンバーグ弁当 根菜たっぷり筑前煮風豚汁 炊き込みチャーハン風 焼きそばオムレツ 焼きそばパン
焼きカレー 目玉焼きのせ焼きそば 豚汁カレーうどん 豚肉と長ねぎの塩炒め 豚肉と青梗菜のオイスター炒め
豚肉の野菜巻き生姜焼き 里芋と鶏の豚汁風みそ汁 鉄板ナポリタン 餃子の具の野菜炒め 高菜チャーハン
麻婆鍋""".split()

CLEANUP_X = """かつお節香る和風野菜炒め しょうがだれ茹で鶏うどん ごまマヨ焼きそば もやしそば炒め
オイスターソース野菜炒め キャベツのペペロンチーノ風炒め ナポリタンオムレツ ナポリタンピザトースト
チキンライスドリア ハンバーグドリア エビのガーリックパスタ ベーコンエッグパスタ レモンクリームパスタ
パッタイ風米麺炒め 水炊き風親子鍋 牛肉のみそ汁仕立て 鶏団子の豚汁風みそ汁 生姜焼きおにぎらず
親子ひつまぶし風丼 親子丼風雑炊 野菜あんかけ炒め 野菜炒めチャンプルー 野菜炒め風酢豚
豚バラ焼肉だれ炒め 明太バターうどん炒め アラビアータ風トマトパスタ
きのこソースハンバーグ チーズハンバーグ テリヤキハンバーグ デミグラスハンバーグ パイ包みハンバーグ
和風おろしハンバーグ カレーオムライス デミグラスオムライス エビチャーハン キムチチャーハン
レタスチャーハン カレーコロッケ 肉じゃがコロッケ カレードリア カレーリゾット
ツナトマトパスタ シーフードトマトパスタ ミートボールパスタ エビとベーコンのピラフ チキンカツ丼
肉玉うどん 親子うどん 豚キムチうどん あんかけうどん 明太子焼きそば 四川風麻婆豆腐
豚バラの生姜角煮 ポテトグラタン もやしニラ炒め そぼろ三色弁当 スパイスカレー じゃがいもニョッキ
エッグベネディクト
みそ煮込みうどん ジェノベーゼパスタ たらこクリームパスタ ボロネーゼ うどん屋のカレーうどん
中華風あんかけ炒麺 簡単パエリア風 鶏そぼろ丼""".split()

# The final doc declares 73 cleanup-x names but only enumerates 68 (26+34+8).
# These were named in its prose paragraph only, and confirmed × by the owner 2026-07-17.
CLEANUP_X += ['カチョエペペ', 'プッタネスカ', 'アンチョビパスタ']
# Not in any list in the final doc. Name-merge oversight: A already has 豚キムチ
# (existing name 豚キムチ炒め). Flagged to owner 2026-07-17.
CLEANUP_X += ['豚キムチ野菜炒め']

# 07-17 owner ruling: revived from CLEANUP_X
REVIVED = ['アマトリチャーナ', 'あんかけチャーハン']
# 07-17 owner ruling: all pending -> excluded
PENDING_X = ['焼肉', 'ジンギスカン', 'ハムカツ', 'チキンナゲット', 'イカ焼き（屋台の味）']
# counted in A2, not in C
DUP_LOCK = ['かぼちゃの煮物', '里芋の煮っころがし']


def parse_sheet():
    rows = []
    section = box = None
    with open(SHEET, encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n')
            m = re.match(r'^## ([AB]2?|C)\.', line)
            if m:
                section, box = m.group(1), None
                continue
            m = re.match(r'^### (.+?)（\d+件）', line)
            if m:
                box = BOX_MAP.get(m.group(1), m.group(1))
                continue
            if not line.startswith('|') or section is None:
                continue
            cells = [c.strip() for c in line.strip('|').split('|')]
            if len(cells) < 2:
                continue
            # A/A2/B tables are 判定|料理名|ティア(|既存名); C is 判定|料理名 only
            judgment, name = cells[0], cells[1]
            tier = cells[2] if len(cells) > 2 else None
            # header row / separator row. NOTE: blank judgment == OK (owner ruling),
            # so never treat an empty first cell as a separator.
            if name in ('料理名', '') or set(name) <= {'-'}:
                continue
            name = name.lstrip('★').strip()  # C marks revival candidates with ★
            rows.append(dict(section=section, box=box, judgment=judgment,
                             name=name, tier=tier))
    return rows


def base_name(name):
    """Strip parenthetical aliases: 回鍋肉（ホイコーロー） -> 回鍋肉"""
    return re.sub(r'（.*?）', '', name).strip()


def main():
    rows = parse_sheet()
    excluded = set(OWNER_X) | set(CLEANUP_X) | set(PENDING_X)
    excluded -= set(REVIVED)

    kept, dropped, unmatched = [], [], []
    for r in rows:
        n, b = r['name'], base_name(r['name'])
        # dup-lock pair is counted in A2 only, dropped from C
        if r['section'] == 'C' and (n in DUP_LOCK or b in DUP_LOCK):
            dropped.append(r)
        elif n in excluded or b in excluded:
            dropped.append(r)
        elif r['judgment'] in ('×', '△'):
            dropped.append(r)
        else:
            kept.append(r)

    # exclusion names that matched nothing in the sheet -> stale list
    sheet_names = {r['name'] for r in rows} | {base_name(r['name']) for r in rows}
    unmatched = sorted(n for n in excluded if n not in sheet_names)

    by_section = {}
    for r in kept:
        by_section[r['section']] = by_section.get(r['section'], 0) + 1

    print('sheet rows       :', len(rows))
    print('kept             :', len(kept), '(target 282: A71+A2 4+B175+C32)')
    print('dropped          :', len(dropped))
    print('by section       :', by_section)
    print('unmatched excl.  :', len(unmatched))
    for n in unmatched:
        print('   NOT IN SHEET :', n)

    out = os.path.join(DOCS, 'catalog-282.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(kept, f, ensure_ascii=False, indent=1)
    print('wrote            :', out)


if __name__ == '__main__':
    main()
