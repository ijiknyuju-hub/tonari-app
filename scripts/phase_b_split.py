# spec-032 Phase B: emit batch manifests for the intro-generation Codex runs.
#
# Batch 0        = the 17 entry dishes (spec A-3), scene-form intros (場面型).
# Batches 1..6   = the remaining 265 dishes, substance-form intros (料理実体型),
#                  sorted by (box, name) and chunked contiguously so that dish
#                  families land in the same batch — the writer must see siblings
#                  side by side to differentiate them, not rediscover them across
#                  runs.
#
# Each manifest carries the full Dish v4 feature record per dish so the Codex
# prompt is self-contained. Features are COPIED for reading only; the writer
# returns name + intro_line1 + intro_line2 and nothing else (spec B-0/B-1).

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
VOCAB = os.path.join(DATA, 'vocab')
OUT = os.path.join(DATA, 'phase-b')

# Source of truth: spec-032 A-3 (confirmed 2026-07-18). Names must match
# dish-v4 exactly; the script fails loudly on any mismatch.
ENTRY_DISHES = [
    '唐揚げ', '肉じゃが', '生姜焼き', 'ハンバーグ', '鶏の照り焼き（照り焼きチキン）', '餃子',
    '鮭の塩焼き', 'さばの味噌煮', 'ぶりの照り焼き',
    '親子丼', '牛丼', 'カレーライス', 'チャーハン', 'オムライス',
    'ナポリタン', 'ミートソース（スパゲティ）', 'ソース焼きそば',
]

N_SUBSTANCE_BATCHES = 6


def load(p, d):
    with open(os.path.join(d, p), encoding='utf-8') as f:
        return json.load(f)


def main():
    dishes = load('dish-v4-281.json', VOCAB)
    cat = {r['name']: r for r in load('catalog-281.json', os.path.join(HERE, '..', 'docs'))}
    fill = load('boxes-missing.json', VOCAB)['boxes']  # 36 dishes have no box in the catalog sheet
    by = {d['name']: d for d in dishes}

    missing = [n for n in ENTRY_DISHES if n not in by]
    if missing:
        raise SystemExit('entry dishes not in dish-v4: %r' % missing)
    if len(set(ENTRY_DISHES)) != len(ENTRY_DISHES):
        raise SystemExit('duplicate names in ENTRY_DISHES')

    def record(d):
        c = cat.get(d['name'], {})
        box = c.get('box') or fill.get(d['name'])
        if not box:
            raise SystemExit('no box for ' + d['name'])
        return {
            'name': d['name'],
            'box': box,
            'tier': c.get('tier') or None,  # 32 dishes have no tier assigned yet (known gap)
            'seasonings': d['seasonings'],
            'ingredients': d['ingredients'],
            'methods': d['methods'],
            'primary_method': d['primary_method'],
            'steps': d['steps'],
        }

    os.makedirs(OUT, exist_ok=True)

    entry_set = set(ENTRY_DISHES)
    rest = sorted((d for d in dishes if d['name'] not in entry_set),
                  key=lambda d: (cat.get(d['name'], {}).get('box') or fill.get(d['name'], ''), d['name']))

    batches = [{
        'batch': 0,
        'style': 'scene',
        'dishes': [record(by[n]) for n in ENTRY_DISHES],
    }]

    n = len(rest)
    base, extra = divmod(n, N_SUBSTANCE_BATCHES)  # 265 -> 44 each, 1 gets +1
    pos = 0
    for i in range(N_SUBSTANCE_BATCHES):
        size = base + (1 if i < extra else 0)
        chunk = rest[pos:pos + size]
        pos += size
        batches.append({
            'batch': i + 1,
            'style': 'substance',
            'dishes': [record(d) for d in chunk],
        })
    assert pos == n

    total = sum(len(b['dishes']) for b in batches)
    if total != len(dishes):
        raise SystemExit('batch total %d != catalog %d' % (total, len(dishes)))

    for b in batches:
        p = os.path.join(OUT, 'batch-%d.json' % b['batch'])
        with open(p, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(b, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print('batch %d (%s): %d dishes -> %s'
              % (b['batch'], b['style'], len(b['dishes']), os.path.relpath(p, os.path.join(HERE, '..'))))
    print('total: %d dishes across %d batches' % (total, len(batches)))


if __name__ == '__main__':
    main()
