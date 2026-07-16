# spec-032 Phase A-1 verification: run the v2 proximity model over the full 282.
#
# Mechanism is unchanged from scripts/proximity_pilot.py (v2):
#   IDF weighting / role-tagged same-role-only ingredient matching / pool split /
#   mains<->rice-noodle damping
# New in this run: role 'とじ' (owner ruling 2026-07-17); `steps` axis removed.
#
# Outputs docs/proximity-282-report.md with:
#   1. regression pairs   (v2 good pairs must hold)
#   2. suppression pairs  (v1 違和感 pairs must stay down)
#   3. scale bets         (things v2 bet would resolve at 282 — a failed bet must SHOW)
#   4. ALL 282 top-1 neighbours  <- catches OVER-connection, which no named-pair check can

import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data', 'vocab')
DOCS = os.path.join(HERE, '..', 'docs')

# 2026-07-17: `steps` dropped from the score (advisor call, verified).
# It was a baseline that accrued between dishes sharing no technique at all:
# ハンバーグ↔とんかつ scored 0.04 purely on step-count proximity, and went to
# exactly 0.00 (rank 162 -> 208) once removed. It also never explained
# "なぜ作れそうか", which is what the reason chip has to say.
# Weights keep the pilot's relative split (45:30:15) and are renormalized to
# sum to 1.00 — the old set summed to 0.95, so no score could reach 1.0 and a
# raw-score display threshold would have been miscalibrated from the start.
# The split itself is NOT validated at 282 and is still open (spec-032 Q2).
W_SEAS, W_ING, W_METH = 0.45 / 0.90, 0.30 / 0.90, 0.15 / 0.90
CROSS_DAMP = 0.75

# とじ: same weight class as coat — a functional, dish-defining role (not a filler).
ROLE_W = {'main': 1.5, 'sub': 0.7, 'coat': 1.0, 'bind': 0.6,
          'thicken': 0.5, 'base': 0.4, 'とじ': 1.0}


def load(p, d=DATA):
    with open(os.path.join(d, p), encoding='utf-8') as f:
        return json.load(f)


def pool_of(name, box, methods):
    if box in ('主菜(肉)', '主菜(魚介)'):
        return 'A'
    if box == '主菜(卵・豆腐)+汁もの':
        if '汁に仕立てる' in methods or any(k in name for k in ('汁', 'スープ')):
            return 'D'
        return 'A'
    if box == 'ごはんもの+麺類':
        return 'B'
    if box == '副菜・おとも':
        return 'C'
    raise SystemExit('unmapped box: %r (%s)' % (box, name))


def build():
    dishes = load('dish-v4-282.json')
    cat = {r['name']: r for r in load('catalog-282.json', DOCS)}
    fill = load('boxes-missing.json')['boxes']
    for d in dishes:
        box = cat[d['name']]['box'] or fill.get(d['name'])
        if not box:
            raise SystemExit('no box for ' + d['name'])
        d['box'] = box
        d['pool'] = pool_of(d['name'], box, d['methods'])
    return dishes


def idf(dishes):
    N = len(dishes)
    sd, idd = {}, {}
    for d in dishes:
        for s in set(d['seasonings']):
            sd[s] = sd.get(s, 0) + 1
        for n in {g['name'] for g in d['ingredients']}:
            idd[n] = idd.get(n, 0) + 1
    return ({k: math.log((N + 1) / v) for k, v in sd.items()},
            {k: math.log((N + 1) / v) for k, v in idd.items()})


def wdice(a, b):
    if not a or not b:
        return 0.0
    inter = sum(min(a[k], b[k]) for k in a.keys() & b.keys())
    return 2 * inter / (sum(a.values()) + sum(b.values()))


def evidence(a, b):
    """Why is B within reach from A? Returns the list of transferable-skill grounds.

    Separate from the score on purpose. The score says how much the two dishes
    overlap; this says whether that overlap is a reason a cook could carry their
    hands from one to the other. They come apart: ロールキャベツ{コンソメ} and
    かぼちゃのポタージュ{コンソメ} score a perfect 1.00 on the seasoning axis
    because Dice is a ratio and the IDF cancels — one shared stock cube buys a
    top-1 neighbour. No skill transfers, so it must carry no evidence.

    Deliberately NOT evidence: step-count proximity, a single shared sub
    ingredient. Both accrue between dishes that share no technique at all.
    """
    ev = []
    main_a = {g['name'] for g in a['ingredients'] if g['role'] == 'main'}
    main_b = {g['name'] for g in b['ingredients'] if g['role'] == 'main'}
    if main_a & main_b:
        ev.append('main:' + '/'.join(sorted(main_a & main_b)))

    same_method = a['primary_method'] and a['primary_method'] == b['primary_method']
    if same_method:
        ev.append('method:' + a['primary_method'])

    # flavour x technique: the pattern, not the token. 塩焼き魚どうし share
    # 塩 x 焼く and genuinely transfer; コンソメ alone across 煮込む/煮る does not.
    shared_seas = set(a['seasonings']) & set(b['seasonings'])
    if same_method and shared_seas:
        ev.append('pattern:%s×%s' % ('/'.join(sorted(shared_seas)), a['primary_method']))
    return ev


MIN_EVIDENCE = 2  # a recommendation needs more than one ground

# The evidence gate is a floor to clear, not a licence to promote. Filtering
# alone let a 0.15 dish with two grounds take the slot of a 0.30 dish with none
# (豚骨ラーメン: 醤油ラーメン 0.30 -> キーマカレー 0.15), which is worse than
# showing nothing. Both conditions must hold, or the anchor recommends nothing.
# 0.30 measured: kills every sub-0.30 promotion (27 -> 0) while all 10 flagship
# bridges survive (lowest: さばの味噌煮↔肉じゃが 0.44). 45/282 dishes end with no
# recommendable neighbour — a real answer, not a failure to hide.
MIN_SCORE = 0.30


def recommendable(anchor, other, score_value):
    return score_value >= MIN_SCORE and len(evidence(anchor, other)) >= MIN_EVIDENCE


def main():
    dishes = build()
    SI, II = idf(dishes)

    def sw(d):
        return {s: SI[s] for s in d['seasonings']}

    def iw(d):
        # (name, role) key => same-role matching only; a dish may hold one
        # ingredient in two roles (酢豚: 片栗粉 coat+thicken), which is intended
        return {(g['name'], g['role']): II[g['name']] * ROLE_W[g['role']]
                for g in d['ingredients']}

    def comp(a, b):
        s = wdice(sw(a), sw(b))
        i = wdice(iw(a), iw(b))
        m = wdice({x: 1.0 for x in a['methods']}, {x: 1.0 for x in b['methods']})
        t = W_SEAS * s + W_ING * i + W_METH * m
        if {a['pool'], b['pool']} == {'A', 'B'}:
            t *= CROSS_DAMP
        return t, s, i, m

    by = {d['name']: d for d in dishes}

    def score(x, y):
        return comp(by[x], by[y])[0]

    def neighbours(name, k=5):
        d = by[name]
        cand = [e for e in dishes if e['name'] != name and
                (e['pool'] == d['pool'] if d['pool'] in ('C', 'D') else e['pool'] in ('A', 'B'))]
        r = [(comp(d, e)[0], e['name']) for e in cand]
        r.sort(reverse=True)
        return r[:k]

    L = []
    W = L.append
    W('# 近さスコア 282皿 全量検証 — 2026-07-17\n')
    W('spec-032 Phase A-1。機構はパイロットv2のまま、語彙を凍結し `とじ` 役割を追加して282皿で再実行。')
    W('再現: `python scripts/proximity_282.py`（入力 `data/vocab/dish-v4-282.json` + `aliases.json`）\n')

    W('## 0. オーナー裁定の検証: 親子丼 ↔ 他人丼\n')
    W('「親子丼と他人丼こそつながるべき」(2026-07-17) に対する実測。\n')
    t, s, i, m = comp(by['親子丼'], by['他人丼'])
    W('| ペア | score | 調味料 | 食材 | 調理法 |')
    W('|---|---|---|---|---|')
    W('| 親子丼 ↔ 他人丼 | **%.2f** | %.2f | %.2f | %.2f |' % (t, s, i, m))
    W('')
    W('親子丼の近傍TOP5:\n')
    W('| # | 料理 | score |')
    W('|---|---|---|')
    for n, (sc, nm) in enumerate(neighbours('親子丼'), 1):
        W('| %d | %s | %.2f |' % (n, nm, sc))
    W('')

    REG = [('唐揚げ', '竜田揚げ'), ('とんかつ', 'あじフライ'), ('親子丼', 'カツ丼'),
           ('豚汁', 'けんちん汁'), ('ハンバーグ', '煮込みハンバーグ'),
           ('生姜焼き', 'ぶりの照り焼き'), ('生姜焼き', '鮭の照り焼き'),
           ('さばの味噌煮', '肉じゃが'), ('カレーライス', 'キーマカレー')]
    W('## 1. 回帰: v2の良好ペアが282でも保たれるか\n')
    W('| ペア | v2(25皿) | 282 | 判定 |')
    W('|---|---|---|---|')
    v2 = {('唐揚げ', '竜田揚げ'): 0.72, ('とんかつ', 'あじフライ'): 0.83,
          ('親子丼', 'カツ丼'): 0.71, ('豚汁', 'けんちん汁'): 0.59,
          ('ハンバーグ', '煮込みハンバーグ'): 0.68, ('生姜焼き', 'ぶりの照り焼き'): 0.51,
          ('生姜焼き', '鮭の照り焼き'): 0.51, ('さばの味噌煮', '肉じゃが'): 0.45,
          ('カレーライス', 'キーマカレー'): 0.48}
    for a, b in REG:
        if a not in by or b not in by:
            W('| %s ↔ %s | — | **NOT IN CATALOG** | ? |' % (a, b))
            continue
        sc = score(a, b)
        W('| %s ↔ %s | %.2f | **%.2f** | %s |' % (a, b, v2[(a, b)], sc,
                                                  'ok' if sc >= 0.35 else 'CHECK'))
    W('')

    SUP = [('生姜焼き', 'カツ丼', 0.26), ('唐揚げ', '麻婆豆腐', 0.30),
           ('チャーハン', 'ニラ玉', 0.48), ('ハンバーグ', 'とんかつ', 0.41)]
    W('## 2. 抑制: v1の違和感ペアが沈んだままか\n')
    W('| ペア | v1 | v2(25皿) | 282 | 順位 |')
    W('|---|---|---|---|---|')
    v1 = {('生姜焼き', 'カツ丼'): 0.42, ('唐揚げ', '麻婆豆腐'): 0.47,
          ('チャーハン', 'ニラ玉'): 0.73, ('ハンバーグ', 'とんかつ'): 0.58}
    for a, b, prev in SUP:
        if a not in by or b not in by:
            W('| %s → %s | — | %.2f | **NOT IN CATALOG** | — |' % (a, b, prev))
            continue
        sc = score(a, b)
        rank = [nm for _, nm in neighbours(a, 999)].index(b) + 1
        W('| %s → %s | %.2f | %.2f | **%.2f** | %d位 |' % (a, b, v1[(a, b)], prev, sc, rank))
    W('')

    W('## 3. スケール解消の賭け（v2が「282皿で解ける」と踏んだ項目）\n')
    W('外れたら黙って通さず失敗として出す、と spec-032 で約束した分。\n')
    for anchor in ['チャーハン', 'ハンバーグ', 'ソース焼きそば', 'ナポリタン', '鮭の塩焼き']:
        if anchor not in by:
            W('- **%s**: NOT IN CATALOG' % anchor)
            continue
        nb = neighbours(anchor)
        W('- **%s** の近傍: %s' % (anchor, ' / '.join('%s %.2f' % (n, s) for s, n in nb)))
    W('')
    W('副菜プール（%d皿）と汁ものプール（%d皿）:\n' %
      (sum(1 for d in dishes if d['pool'] == 'C'), sum(1 for d in dishes if d['pool'] == 'D')))
    for anchor in ['きんぴらごぼう', 'ほうれん草のおひたし', '豚汁']:
        if anchor in by:
            nb = neighbours(anchor, 3)
            W('- **%s**: %s' % (anchor, ' / '.join('%s %.2f' % (n, s) for s, n in nb)))
    W('')

    W('## 4. 全282皿の最近傍TOP1（過剰接続の検出用・ゲート前）\n')
    W('既知ペアのチェックは「想定どおりか」しか見ない。語彙を畳みすぎたときに生まれる')
    W('**新しい違和感ペア**はどのリストにも載らないので、全量を出して目視で拾う。')
    W('これは地図（無向・探索）が見る素の近さで、ホーム推薦が見るものではない。\n')
    W('箱をまたぐ組み合わせに `*` を付けた。\n')
    W('| 料理 | 箱 | 最近傍 | score | |')
    W('|---|---|---|---|---|')
    rows = []
    for d in sorted(dishes, key=lambda x: x['name']):
        nb = neighbours(d['name'], 1)
        if not nb:
            continue
        sc, nm = nb[0]
        cross = '*' if by[nm]['box'] != d['box'] else ''
        rows.append((d['name'], d['box'], nm, sc, cross))
    for n, b, nm, sc, c in rows:
        W('| %s | %s | %s | %.2f | %s |' % (n, b, nm, sc, c))
    W('')
    W('## 5. ホーム推薦のゲート後 TOP1（score >= %.2f かつ 根拠 >= %d件）\n'
      % (MIN_SCORE, MIN_EVIDENCE))
    W('スコアは「どれだけ重なるか」、根拠は「腕が移る理由があるか」。両者は乖離する —')
    W('ロールキャベツ `{コンソメ}` と かぼちゃのポタージュ `{コンソメ}` は Dice が比率で')
    W('IDFが分子分母で相殺されるため調味料軸が満点1.00になるが、移る腕は無い（根拠0件）。\n')
    W('根拠の文字列はそのまま「なぜこの皿か」チップの素になる。\n')
    W('| 料理 | ゲート前TOP1 | ゲート後TOP1 | score | 根拠 |')
    W('|---|---|---|---|---|')
    keep = chg = none = 0
    for d in sorted(dishes, key=lambda x: x['name']):
        full = neighbours(d['name'], 999)
        if not full:
            continue
        pre = full[0][1]
        ok = [(s0, n0) for s0, n0 in full if recommendable(d, by[n0], s0)]
        if not ok:
            none += 1
            W('| %s | %s | **出さない** | — | — |' % (d['name'], pre))
            continue
        s0, n0 = ok[0]
        ev = ' / '.join(evidence(d, by[n0]))
        if n0 == pre:
            keep += 1
            W('| %s | %s | (同じ) | %.2f | %s |' % (d['name'], pre, s0, ev))
        else:
            chg += 1
            W('| %s | %s | **%s** | %.2f | %s |' % (d['name'], pre, n0, s0, ev))
    W('')
    W('TOP1が変わらない **%d** / 入れ替わる **%d** / 推薦を出さない **%d**\n' % (keep, chg, none))
    W('「出さない」%d皿は、根拠2件以上かつ%.2f以上の相手がカタログに一皿も無い。' % (none, MIN_SCORE))
    W('地図には出るが、ホームで「次はこれ」とは言えない皿。カタログの穴か、単独で完結する皿。\n')
    W('> **未検証**: 入れ替わり%d件は人手で見ていない。ナポリタン→オムライス、他人丼→親子丼、' % chg)
    W('> ぶり照り→鶏照り のように明らかに改善したものがある一方、全数の妥当性は未確認。')
    W('> spec-032のVerificationはtop-1目視までで、top-5の盲検レビューは未実施。')
    W('> このゲートはまだUIを駆動していない。\n')

    p = os.path.join(DOCS, 'proximity-282-report.md')
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(L))
    print('wrote', p)
    print('親子丼<->他人丼 = %.3f (seas %.2f / ing %.2f / meth %.2f)' % (t, s, i, m))
    print('gate: keep %d / changed %d / no-recommendation %d' % (keep, chg, none))


if __name__ == '__main__':
    main()
