# spec-032 Phase B, B-3 pre-join gates over the collected Codex intro outputs.
#
# Input:  data/phase-b/intros-batch-*.json, each a list of
#         {"name": ..., "intro_line1": ..., "intro_line2": ...}
# Gates (all must pass before phase_b_join.py will produce data/v4-dishes.json):
#   1. name-set match: union of all batches == the full dish-v4 catalog, no gaps
#   2. no duplicate names across batches
#   3. pairwise intro similarity (char-bigram Jaccard, own dish name masked)
#      above --gate3-threshold (default 0.85) => rejected pairs listed
#   4. loose vocabulary check: katakana runs in intro text that appear nowhere
#      in the frozen vocab / dish names / allowlist are flagged
#
# Gate 3 note: dish families (e.g. the seven 塩焼き fish) will legitimately sit
# close together; the listing is the input to the human 差し戻し call, and the
# threshold is an operator knob, not a hidden constant.

import argparse
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
VOCAB = os.path.join(DATA, 'vocab')
PHASE_B = os.path.join(DATA, 'phase-b')

# Cooking-context katakana that is fine in prose but absent from the
# ingredient/seasoning vocab. Extend when gate 4 reports a false positive.
KATAKANA_ALLOW = {
    'フライパン', 'グリル', 'オーブン', 'トースター', 'レンジ', 'ボウル',
    'スパイス', 'シンプル', 'ワンパン', 'メイン', 'アレンジ',
}


def load(p, d):
    with open(os.path.join(d, p), encoding='utf-8') as f:
        return json.load(f)


def load_intros():
    files = sorted(glob.glob(os.path.join(PHASE_B, 'intros-batch-*.json')))
    if not files:
        raise SystemExit('no intros-batch-*.json under data/phase-b/')
    rows = []
    for p in files:
        with open(p, encoding='utf-8') as f:
            rows.extend(json.load(f))
    return rows, files


def bigrams(s):
    return {s[i:i + 2] for i in range(len(s) - 1)}


def jaccard(a, b):
    A, B = bigrams(a), bigrams(b)
    if not A or not B:
        return 0.0
    return len(A & B) / len(A | B)


def vocab_terms():
    dishes = load('dish-v4-281.json', VOCAB)
    A = load('aliases.json', VOCAB)
    terms = set()
    for d in dishes:
        terms.add(d['name'])
        terms.update(d['seasonings'])
        terms.update(g['name'] for g in d['ingredients'])
    for section in ('seasonings', 'ingredients'):
        terms.update(A.get(section, {}).keys())
        terms.update(A.get(section, {}).values())
    for vals in A.get('seasonings_split', {}).values():
        terms.update(vals)
    return terms


def run_gates(rows, threshold):
    dishes = load('dish-v4-281.json', VOCAB)
    expected = {d['name'] for d in dishes}
    failures = []

    # gate 2 first (duplicates would confuse the set diff message)
    seen, dupes = set(), set()
    for r in rows:
        if r['name'] in seen:
            dupes.add(r['name'])
        seen.add(r['name'])
    if dupes:
        failures.append('gate2 duplicates: %s' % sorted(dupes))

    # gate 1
    got = {r['name'] for r in rows}
    missing, extra = expected - got, got - expected
    if missing:
        failures.append('gate1 missing %d: %s' % (len(missing), sorted(missing)[:10]))
    if extra:
        failures.append('gate1 extra %d: %s' % (len(extra), sorted(extra)[:10]))

    # gate 3 — mask each intro's own dish name so the comparison sees the prose,
    # not the label
    def masked(r, key):
        return r[key].replace(r['name'], '〇')

    hot = []
    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            for key in ('intro_line1', 'intro_line2'):
                s = jaccard(masked(rows[i], key), masked(rows[j], key))
                if s >= threshold:
                    hot.append((s, rows[i]['name'], rows[j]['name'], key))
    if hot:
        hot.sort(reverse=True)
        lines = ['  %.2f %s <-> %s (%s)' % h for h in hot[:30]]
        failures.append('gate3 %d pairs >= %.2f:\n%s'
                        % (len(hot), threshold, '\n'.join(lines)))

    # gate 4 — loose by design (spec B-3): katakana runs not covered by vocab
    terms = vocab_terms()
    kat = re.compile(r'[ァ-ヶー]{3,}')
    flagged = {}
    for r in rows:
        for key in ('intro_line1', 'intro_line2'):
            for tok in kat.findall(r[key]):
                if tok in KATAKANA_ALLOW:
                    continue
                if any(tok in t for t in terms):
                    continue
                flagged.setdefault(tok, []).append(r['name'])
    if flagged:
        lines = ['  %s (in %s)' % (t, ns[:3]) for t, ns in sorted(flagged.items())]
        failures.append('gate4 out-of-vocab katakana:\n%s' % '\n'.join(lines))

    return failures


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--gate3-threshold', type=float, default=0.85)
    args = ap.parse_args()

    rows, files = load_intros()
    print('loaded %d intros from %d files' % (len(rows), len(files)))
    failures = run_gates(rows, args.gate3_threshold)
    if failures:
        print('GATES FAILED (%d):' % len(failures))
        for f in failures:
            print('-', f)
        sys.exit(1)
    print('all gates passed')


if __name__ == '__main__':
    main()
