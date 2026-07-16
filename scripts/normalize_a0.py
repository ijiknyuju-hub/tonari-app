# spec-032 Phase A-1: build the dish records from the A-0 raw extraction.
#   in : data/vocab/a0-raw-282.json   (raw, unnormalized)
#        docs/catalog-281.json        (the frozen catalog; renames + hygiene cuts)
#        data/vocab/aliases.json      (the frozen vocab - reviewable, owner-vetoable)
#   out: data/vocab/dish-v4-281.json  (features only; intro text is Phase B)
#
# LAYERING (2026-07-17, after the owner asked whether a recipe would show the
# folded name). It would not, and this script used to make that impossible.
#
#   dish-v4  = what the dish IS. Display truth. 豚の角煮 keeps 豚バラ肉(ブロック),
#              ローストビーフ keeps 牛もも肉塊. Phase B writes intro text from this,
#              the fridge match reads this, cost tier is justified from this.
#   aliases  = how to COMPARE. 豚バラ肉 -> 豚肉 is a scoring-time transform applied
#              by proximity_282.py when it builds weights - never baked in here.
#
# The pilot (proximity_pilot.py v2) had this right: ALIAS.get() at scoring time.
# Baking the fold into the data destroyed the cut information the app needs.
#
# Still applied here, because these repair A-0 mistakes rather than compare dishes:
#   - seasonings_drop  (長ねぎ(みじん切り) was a vegetable filed as a seasoning)
#   - methods/methods_drop (parenthetical dupes, prep verbs that decide no dish)
#   - role fixes (wrappers -> base; とじ via force_by_method)

import json
import os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data', 'vocab')
DOCS = os.path.join(HERE, '..', 'docs')


def load(n, d=DATA):
    with open(os.path.join(d, n), encoding='utf-8') as f:
        return json.load(f)


def main():
    raw = load('a0-raw-282.json')
    A = load('aliases.json')
    cat = load('catalog-281.json', DOCS)

    # the catalog is the gate: hygiene cuts drop out, renames carry over
    rename = {r['renamed_from']: r['name'] for r in cat if 'renamed_from' in r}
    keep_names = {r.get('renamed_from', r['name']) for r in cat}

    s_drop = set(A['seasonings_drop'])
    m_map, m_drop = A['methods'], set(A['methods_drop'])
    force_role = A['roles']['force']
    fbm = A['roles'].get('force_by_method', {})
    dom = A['method_dominance']['rank']

    used = set()
    before_s, before_i, before_m = Counter(), Counter(), Counter()
    after_s, after_i, after_m = Counter(), Counter(), Counter()
    emptied, role_forced, cut, out = [], [], [], []

    for r in raw:
        if r['name'] not in keep_names:
            cut.append(r['name'])
            continue
        dish_name = rename.get(r['name'], r['name'])

        # --- seasonings: display truth. Only drop A-0 miscategorisations. ---
        seas = []
        for s in r['seasonings']:
            before_s[s] += 1
            if s in s_drop:
                used.add(s)
                continue
            seas.append(s)
        seas = sorted(set(seas))

        # --- ingredients: display truth. The cut stays (豚バラ肉(ブロック)). ---
        ings = []
        for g in r['ingredients']:
            before_i[g['name']] += 1
            role = force_role.get(g['name'], g['role'])
            if g['name'] in force_role:
                used.add(g['name'])
            ings.append({'name': g['name'], 'role': role})
        # (name, role) is the score key, so dedupe on the pair - a dish may
        # legitimately carry one ingredient twice in two roles
        # (酢豚: 片栗粉 as coat and as thicken)
        seen, ded = set(), []
        for g in ings:
            k = (g['name'], g['role'])
            if k not in seen:
                seen.add(k)
                ded.append(g)
        ings = ded

        # --- methods: canonicalised. Parenthetical dupes and prep verbs are
        #     A-0 noise, not display material. ---
        meth = []
        for m in r['methods']:
            before_m[m] += 1
            if m in m_drop:
                used.add(m)
                continue
            if m in m_map:
                used.add(m)
                m = m_map[m]
            if m not in meth:
                meth.append(m)  # keep A-0's order; sorting destroyed sequence info
        if r['methods'] and not meth:
            emptied.append(dish_name)

        # role rules keyed on method: A-0 never emitted 'とじ' (not in its
        # vocabulary), so 親子丼/他人丼/カツ丼/卵とじ scattered across sub/bind/main.
        # Re-seat them, or the role stays declared-but-unused.
        for mname, rule in fbm.items():
            if mname not in meth:
                continue
            used.add(mname)
            for g in ings:
                if g['name'] == rule['ingredient'] and g['role'] in rule['from_roles']:
                    g['role'] = rule['to_role']
                    role_forced.append((dish_name, mname))

        for x in seas:
            after_s[x] += 1
        for g in ings:
            after_i[g['name']] += 1
        for x in meth:
            after_m[x] += 1

        # primary method = the dish's dominant technique (lowest dominance rank).
        # It decides the finished dish; the rest are steps passed through.
        primary = min(meth, key=lambda x: dom[x]) if meth else None
        out.append({'name': dish_name, 'seasonings': seas, 'ingredients': ings,
                    'methods': meth, 'primary_method': primary, 'steps': r['steps']})

    print('=== display vocabulary (NOT folded - folding happens at scoring time) ===')
    print('  seasonings : %3d raw -> %3d kept' % (len(before_s), len(after_s)))
    print('  ingredients: %3d raw -> %3d kept' % (len(before_i), len(after_i)))
    print('  methods    : %3d raw -> %3d canonical' % (len(before_m), len(after_m)))

    print()
    print('=== dropped by the catalog (hygiene cuts) ===')
    print('  ', cut if cut else 'none')
    print('=== renamed ===')
    for k, v in rename.items():
        print('   %s -> %s' % (k, v))

    print()
    print('=== methods emptied (weighted_dice returns 0.0 on empty) ===')
    print('  ', emptied if emptied else 'none')

    missing = sorted(after_m.keys() - set(dom))
    print()
    print('=== methods with no dominance rank (cannot pick a primary) ===')
    print('  ', missing if missing else 'none')

    print()
    print('=== role re-seated by method rule ===')
    for n, m in role_forced:
        print('   %s  (%s)' % (n, m))
    if not role_forced:
        print('   NONE  <- a declared role that nothing assigns is a no-op')

    stale = sorted((s_drop | set(m_map) | m_drop | set(force_role)) - used)
    print()
    print('=== entries that matched nothing (stale) ===')
    for k in stale:
        print('   STALE:', k)
    if not stale:
        print('   none')

    p = os.path.join(DATA, 'dish-v4-281.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print()
    print('wrote:', p, len(out))


if __name__ == '__main__':
    main()
