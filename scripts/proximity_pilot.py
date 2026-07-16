# Proximity score pilot v2 — 2026-07-16
# v1 issues (owner eyeball): generic seasonings/methods scored like identity
# features (fried-rice<->niratama, hamburg<->tonkatsu), sides pooled with mains,
# tonkatsu->katsudon conflated derivation with similarity.
# v2 fixes:
#   1. IDF token weighting (rare feature match = strong evidence)
#   2. Ingredient role tags (main/sub/coat/bind/thicken/base) — match same-role only
#   3. Pools: sides & soups rank within own pool (main-pairing = 相性軸, separate
#      mechanism per spec-030); mains<->rice/noodle cross damped x0.75
#   4. Derivation edges (katsudon contains tonkatsu) split out of proximity
#   5. Finer method vocab (煮る/煮込む/さっと煮る/汁に仕立てる split)
#   6. cost tier added to schema (used by recommendation layer, NOT proximity)
#
# Output: pilot-proximity-tables-v2.md (UTF-8) next to this script.

import math
import os

W_SEAS, W_ING, W_METH, W_STEPS = 0.45, 0.30, 0.15, 0.05
STEP_RANGE = 6
CROSS_DAMP = 0.75  # mains <-> rice/noodle meals

ALIAS = {
    'カレールー': 'カレー', 'カレー粉': 'カレー',
    'ウスターソース': 'ソース', '中濃ソース': 'ソース',
    '鶏もも肉': '鶏肉', '豚ロース': '豚肉', '豚バラ': '豚肉', '豚こま': '豚肉',
    '合い挽き肉': 'ひき肉', '豚ひき肉': 'ひき肉', '牛こま': '牛肉',
}
ROLE_W = {'main': 1.5, 'sub': 0.7, 'coat': 1.0, 'bind': 0.6, 'thicken': 0.5, 'base': 0.4}
POOL = {'主菜(肉)': 'A', '主菜(魚介)': 'A', '主菜(卵・豆腐)': 'A',
        'ごはんもの': 'B', '麺類': 'B', '副菜・おとも': 'C', '汁もの': 'D'}

def D(id, name, box, tier, ing, seas, methods, steps, effort, cost, derived_from=()):
    return dict(id=id, name=name, box=box, tier=tier, ing=ing, seas=seas,
                methods=methods, steps=steps, effort=effort, cost=cost,
                derived_from=list(derived_from))

DISHES = [
    # 主菜(肉)
    D('karaage', '唐揚げ', '主菜(肉)', 'S',
      [('鶏もも肉', 'main'), ('片栗粉', 'coat')], ['醤油', '酒', '生姜', 'にんにく'], ['揚げる', '漬け込む'], 4, 2, 1),
    D('tatsuta-age', '竜田揚げ', '主菜(肉)', 'A',
      [('鶏もも肉', 'main'), ('片栗粉', 'coat')], ['醤油', 'みりん', '生姜'], ['揚げる', '漬け込む'], 4, 2, 1),
    D('shogayaki', '生姜焼き', '主菜(肉)', 'S',
      [('豚ロース', 'main'), ('玉ねぎ', 'sub')], ['醤油', 'みりん', '酒', '生姜'], ['焼く'], 3, 1, 1),
    D('nikujaga', '肉じゃが', '主菜(肉)', 'S',
      [('牛こま', 'main'), ('じゃがいも', 'main'), ('玉ねぎ', 'sub'), ('にんじん', 'sub'), ('しらたき', 'sub')],
      ['醤油', 'みりん', '砂糖', '酒', 'だし'], ['煮る'], 4, 2, 2),
    D('hamburg', 'ハンバーグ', '主菜(肉)', 'S',
      [('合い挽き肉', 'main'), ('玉ねぎ', 'sub'), ('卵', 'bind'), ('パン粉', 'bind')],
      ['塩', 'こしょう', 'ケチャップ', '中濃ソース'], ['焼く'], 5, 2, 1),
    D('nikomi-hamburg', '煮込みハンバーグ', '主菜(肉)', 'A',
      [('合い挽き肉', 'main'), ('玉ねぎ', 'sub'), ('卵', 'bind'), ('パン粉', 'bind'), ('きのこ', 'sub')],
      ['ケチャップ', '中濃ソース', '酒'], ['焼く', '煮込む'], 5, 2, 1),
    D('tonkatsu', 'とんかつ', '主菜(肉)', 'S',
      [('豚ロース', 'main'), ('卵', 'coat'), ('パン粉', 'coat'), ('小麦粉', 'coat')],
      ['塩', 'こしょう', '中濃ソース'], ['揚げる'], 4, 2, 2),
    # 主菜(魚介)
    D('buri-teriyaki', 'ぶりの照り焼き', '主菜(魚介)', 'S',
      [('ぶり', 'main')], ['醤油', 'みりん', '酒', '砂糖'], ['焼く'], 3, 1, 3),
    D('salmon-teriyaki', '鮭の照り焼き', '主菜(魚介)', 'A',
      [('鮭', 'main')], ['醤油', 'みりん', '酒', '砂糖'], ['焼く'], 3, 1, 2),
    D('saba-misoni', 'さばの味噌煮', '主菜(魚介)', 'S',
      [('さば', 'main')], ['味噌', '砂糖', '酒', 'みりん', '生姜'], ['煮る'], 3, 2, 2),
    D('salmon-shioyaki', '鮭の塩焼き', '主菜(魚介)', 'S',
      [('鮭', 'main')], ['塩'], ['焼く'], 2, 1, 2),
    D('aji-fry', 'あじフライ', '主菜(魚介)', 'S',
      [('あじ', 'main'), ('卵', 'coat'), ('パン粉', 'coat'), ('小麦粉', 'coat')],
      ['塩', 'こしょう', '中濃ソース'], ['揚げる'], 4, 2, 2),
    # 主菜(卵・豆腐)
    D('mapo-tofu', '麻婆豆腐', '主菜(卵・豆腐)', 'S',
      [('豆腐', 'main'), ('豚ひき肉', 'main'), ('長ねぎ', 'sub'), ('片栗粉', 'thicken')],
      ['豆板醤', '醤油', '味噌', 'にんにく', '生姜'], ['炒める', 'さっと煮る'], 4, 2, 1),
    D('niratama', 'ニラ玉', '主菜(卵・豆腐)', 'A',
      [('卵', 'main'), ('ニラ', 'main')], ['醤油', '塩', 'ごま油'], ['炒める'], 2, 1, 1),
    # 汁もの
    D('tonjiru', '豚汁', '汁もの', 'S',
      [('豚バラ', 'main'), ('大根', 'sub'), ('にんじん', 'sub'), ('ごぼう', 'sub'), ('こんにゃく', 'sub'), ('長ねぎ', 'sub')],
      ['味噌', 'だし'], ['汁に仕立てる'], 4, 2, 1),
    D('kenchinjiru', 'けんちん汁', '汁もの', 'A',
      [('豆腐', 'main'), ('大根', 'sub'), ('にんじん', 'sub'), ('ごぼう', 'sub'), ('こんにゃく', 'sub'), ('長ねぎ', 'sub')],
      ['醤油', 'だし', 'ごま油'], ['汁に仕立てる'], 4, 2, 1),
    # 副菜・おとも
    D('kinpira', 'きんぴらごぼう', '副菜・おとも', 'S',
      [('ごぼう', 'main'), ('にんじん', 'sub'), ('ごま', 'sub')],
      ['醤油', 'みりん', '砂糖', 'ごま油', '唐辛子'], ['炒める'], 3, 1, 1),
    D('ohitashi', 'ほうれん草のおひたし', '副菜・おとも', 'S',
      [('ほうれん草', 'main'), ('かつお節', 'sub')], ['醤油', 'だし'], ['茹でる', '和える'], 2, 1, 1),
    # ごはんもの
    D('curry-rice', 'カレーライス', 'ごはんもの', 'S',
      [('豚肉', 'main'), ('玉ねぎ', 'sub'), ('じゃがいも', 'sub'), ('にんじん', 'sub'), ('ご飯', 'base')],
      ['カレールー'], ['煮込む'], 4, 2, 1),
    D('keema-curry', 'キーマカレー', 'ごはんもの', 'B',
      [('合い挽き肉', 'main'), ('玉ねぎ', 'sub'), ('トマト', 'sub'), ('ご飯', 'base')],
      ['カレー粉', 'にんにく', '生姜'], ['炒める', '煮込む'], 4, 1, 1),
    D('oyakodon', '親子丼', 'ごはんもの', 'S',
      [('鶏もも肉', 'main'), ('卵', 'main'), ('玉ねぎ', 'sub'), ('ご飯', 'base')],
      ['醤油', 'みりん', 'だし', '砂糖'], ['さっと煮る'], 3, 1, 1),
    D('katsudon', 'カツ丼', 'ごはんもの', 'S',
      [('豚ロース', 'main'), ('卵', 'main'), ('玉ねぎ', 'sub'), ('ご飯', 'base'), ('パン粉', 'coat'), ('小麦粉', 'coat')],
      ['醤油', 'みりん', 'だし', '砂糖'], ['揚げる', 'さっと煮る'], 5, 2, 2, derived_from=['tonkatsu']),
    D('fried-rice', 'チャーハン', 'ごはんもの', 'S',
      [('ご飯', 'base'), ('卵', 'main'), ('長ねぎ', 'sub'), ('ハム', 'sub')],
      ['醤油', '塩', 'こしょう', 'ごま油'], ['炒める'], 3, 1, 1),
    # 麺類
    D('yakisoba', 'ソース焼きそば', '麺類', 'S',
      [('中華麺', 'base'), ('豚バラ', 'main'), ('キャベツ', 'sub'), ('もやし', 'sub')],
      ['ウスターソース'], ['炒める'], 3, 1, 1),
    D('napolitan', 'ナポリタン', '麺類', 'S',
      [('パスタ', 'base'), ('ウインナー', 'main'), ('ピーマン', 'sub'), ('玉ねぎ', 'sub')],
      ['ケチャップ', 'バター'], ['茹でる', '炒める'], 3, 1, 1),
]

N = len(DISHES)

def build_idf():
    seas_df, ing_df = {}, {}
    for d in DISHES:
        for s in {ALIAS.get(x, x) for x in d['seas']}:
            seas_df[s] = seas_df.get(s, 0) + 1
        for name, _ in d['ing']:
            n = ALIAS.get(name, name)
            ing_df[n] = ing_df.get(n, 0) + 1
    # +1 smoothing so a df=N token still gets a small positive weight
    return ({k: math.log((N + 1) / v) for k, v in seas_df.items()},
            {k: math.log((N + 1) / v) for k, v in ing_df.items()})

SEAS_IDF, ING_IDF = build_idf()

def weighted_dice(wa, wb):
    # wa, wb: dict token -> weight
    if not wa or not wb:
        return 0.0
    inter = sum(min(wa[k], wb[k]) for k in wa.keys() & wb.keys())
    return 2 * inter / (sum(wa.values()) + sum(wb.values()))

def seas_weights(d):
    return {ALIAS.get(s, s): SEAS_IDF[ALIAS.get(s, s)] for s in d['seas']}

def ing_weights(d):
    out = {}
    for name, role in d['ing']:
        n = ALIAS.get(name, name)
        out[(n, role)] = ING_IDF[n] * ROLE_W[role]  # same-role matching only
    return out

def components(a, b):
    s = weighted_dice(seas_weights(a), seas_weights(b))
    i = weighted_dice(ing_weights(a), ing_weights(b))
    m = weighted_dice({x: 1.0 for x in a['methods']}, {x: 1.0 for x in b['methods']})
    st = 1 - min(abs(a['steps'] - b['steps']), STEP_RANGE) / STEP_RANGE
    total = W_SEAS * s + W_ING * i + W_METH * m + W_STEPS * st
    pa, pb = POOL[a['box']], POOL[b['box']]
    if {pa, pb} == {'A', 'B'}:
        total *= CROSS_DAMP
    return total, s, i, m, st

def visible(a, b):
    # C/D pools rank only within themselves; A and B see each other (damped)
    pa, pb = POOL[a['box']], POOL[b['box']]
    if pa in ('C', 'D') or pb in ('C', 'D'):
        return pa == pb
    return True

def main():
    by_id = {d['id']: d for d in DISHES}
    neighbors = {d['id']: [] for d in DISHES}
    for a in DISHES:
        for b in DISHES:
            if a['id'] >= b['id'] or not visible(a, b):
                continue
            t, s, i, m, st = components(a, b)
            neighbors[a['id']].append((t, b['id'], s, i, m, st))
            neighbors[b['id']].append((t, a['id'], s, i, m, st))
    for v in neighbors.values():
        v.sort(reverse=True)

    anchors = ['curry-rice', 'shogayaki', 'karaage', 'saba-misoni',
               'tonjiru', 'fried-rice', 'hamburg', 'kinpira']

    out = []
    out.append('## v2 近傍テーブル（アンカー8皿 × TOP5）\n')
    out.append('score = 0.45×調味料 + 0.30×食材 + 0.15×調理法 + 0.05×工程近さ（IDF加重Dice、役割一致、プール分割、A↔Bクロス×0.75）\n')
    for aid in anchors:
        a = by_id[aid]
        out.append(f"\n### {a['name']}（{a['box']}）の隣 TOP5\n")
        out.append('| # | 料理 | 箱 | score | 調味料 | 食材 | 調理法 | 工程 |')
        out.append('|---|---|---|---|---|---|---|---|')
        for rank, (t, bid, s, i, m, st) in enumerate(neighbors[aid][:5], 1):
            b = by_id[bid]
            out.append(f"| {rank} | {b['name']} | {b['box']} | **{t:.2f}** | {s:.2f} | {i:.2f} | {m:.2f} | {st:.2f} |")

    out.append('\n## 全25皿の最近傍TOP3（v2）\n')
    out.append('| 料理 | 1位 | 2位 | 3位 |')
    out.append('|---|---|---|---|')
    for d in DISHES:
        lst = neighbors[d['id']][:3]
        row = [f"{by_id[bid]['name']} {t:.2f}" for (t, bid, *_) in lst]
        while len(row) < 3:
            row.append('—')
        out.append(f"| {d['name']} | {row[0]} | {row[1]} | {row[2]} |")

    out.append('\n## 派生エッジ（近さとは別チャネル）\n')
    out.append('| 皿 | 部品として含む |')
    out.append('|---|---|')
    for d in DISHES:
        for src in d['derived_from']:
            out.append(f"| {d['name']} | {by_id[src]['name']} |")

    out.append('\n## v1でオーナーが違和感を挙げたペアの before → after\n')
    flagged = [('shogayaki', 'katsudon'), ('karaage', 'mapo-tofu'),
               ('fried-rice', 'niratama'), ('fried-rice', 'kenchinjiru'),
               ('hamburg', 'tonkatsu')]
    v1_scores = {('shogayaki', 'katsudon'): 0.42, ('karaage', 'mapo-tofu'): 0.47,
                 ('fried-rice', 'niratama'): 0.73, ('fried-rice', 'kenchinjiru'): 0.51,
                 ('hamburg', 'tonkatsu'): 0.58}
    out.append('| ペア | v1 | v2 |')
    out.append('|---|---|---|')
    for a_id, b_id in flagged:
        a, b = by_id[a_id], by_id[b_id]
        if not visible(a, b):
            v2s = '別プール（比較対象外）'
        else:
            t, *_ = components(a, b)
            v2s = f'{t:.2f}'
        out.append(f"| {a['name']} → {b['name']} | {v1_scores[(a_id, b_id)]:.2f} | {v2s} |")

    out.append('\n## 保持確認: v1で良かったペア\n')
    keep = [('karaage', 'tatsuta-age', 0.83), ('shogayaki', 'buri-teriyaki', 0.60),
            ('tonkatsu', 'aji-fry', 0.92), ('oyakodon', 'katsudon', 0.78),
            ('tonjiru', 'kenchinjiru', 0.71), ('curry-rice', 'keema-curry', 0.63),
            ('hamburg', 'nikomi-hamburg', 0.73)]
    out.append('| ペア | v1 | v2 |')
    out.append('|---|---|---|')
    for a_id, b_id, v1s in keep:
        a, b = by_id[a_id], by_id[b_id]
        t, *_ = components(a, b)
        out.append(f"| {a['name']} ↔ {b['name']} | {v1s:.2f} | {t:.2f} |")

    path = os.path.join(os.path.dirname(__file__), 'pilot-proximity-tables-v2.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print(f'written: {path}')

if __name__ == '__main__':
    main()
