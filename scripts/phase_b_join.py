# spec-032 Phase B: deterministic join of Codex intros with the frozen features.
#
# Codex never touches the feature fields (spec B-0); this script is the only
# writer of data/v4-dishes.json. It re-runs the B-3 gates, joins, then verifies
# gate 5 (invariance): every feature field in the output must be identical to
# dish-v4-281.json. Any failure aborts before the output file is written.

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
VOCAB = os.path.join(DATA, 'vocab')
OUT_PATH = os.path.join(DATA, 'v4-dishes.json')

sys.path.insert(0, HERE)
from phase_b_gate import load, load_intros, run_gates  # noqa: E402

FEATURE_FIELDS = ['seasonings', 'ingredients', 'methods', 'primary_method', 'steps']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--gate3-threshold', type=float, default=0.85)
    args = ap.parse_args()

    rows, files = load_intros()
    print('loaded %d intros from %d files' % (len(rows), len(files)))
    failures = run_gates(rows, args.gate3_threshold)
    if failures:
        print('refusing to join, gates failed (%d):' % len(failures))
        for f in failures:
            print('-', f)
        sys.exit(1)

    dishes = load('dish-v4-281.json', VOCAB)
    cat = {r['name']: r for r in load('catalog-281.json', os.path.join(HERE, '..', 'docs'))}
    fill = load('boxes-missing.json', VOCAB)['boxes']
    intro = {r['name']: r for r in rows}

    joined = []
    for d in dishes:  # dish-v4 order is authoritative
        c = cat.get(d['name'], {})
        box = c.get('box') or fill.get(d['name'])
        if not box:
            raise SystemExit('no box for ' + d['name'])
        rec = {f: d[f] for f in ['name'] + FEATURE_FIELDS}
        rec['box'] = box
        rec['tier'] = c.get('tier') or None  # 32 dishes have no tier yet (known catalog gap)
        rec['intro_line1'] = intro[d['name']]['intro_line1']
        rec['intro_line2'] = intro[d['name']]['intro_line2']
        joined.append(rec)

    # gate 5: invariance — features in the join output vs the frozen source
    src = {d['name']: d for d in dishes}
    for rec in joined:
        for f in FEATURE_FIELDS:
            if rec[f] != src[rec['name']][f]:
                raise SystemExit('gate5 invariance broken: %s.%s' % (rec['name'], f))

    with open(OUT_PATH, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(joined, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('wrote %s (%d dishes)' % (os.path.relpath(OUT_PATH, os.path.join(HERE, '..')), len(joined)))


if __name__ == '__main__':
    main()
