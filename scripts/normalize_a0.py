# spec-032 Phase A-1: apply the frozen vocabulary to the A-0 raw extraction.
#   in : data/vocab/a0-raw-282.json   (raw, unnormalized)
#        data/vocab/aliases.json      (the frozen vocab — reviewable, owner-vetoable)
#   out: data/vocab/dish-v4-282.json  (features only; intro text is Phase B)
#
# Also prints the checks that matter before scoring:
#   - vocabulary sizes before/after
#   - dishes whose methods went EMPTY (weighted_dice returns 0.0 on empty -> silent damage)
#   - alias entries that matched nothing (stale table)

import json
import os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data', 'vocab')


def load(n):
    with open(os.path.join(DATA, n), encoding='utf-8') as f:
        return json.load(f)


def main():
    raw = load('a0-raw-282.json')
    A = load('aliases.json')
    s_map, s_split, s_drop = A['seasonings'], A['seasonings_split'], set(A['seasonings_drop'])
    i_map = A['ingredients']
    m_map, m_drop = A['methods'], set(A['methods_drop'])
    force_role = A['roles']['force']
    fbm = A['roles'].get('force_by_method', {})
    dom = A['method_dominance']['rank']

    used = set()
    before_s, before_i, before_m = Counter(), Counter(), Counter()
    after_s, after_i, after_m = Counter(), Counter(), Counter()
    emptied = []
    role_forced = []
    out = []

    for r in raw:
        # --- seasonings ---
        seas = []
        for s in r['seasonings']:
            before_s[s] += 1
            if s in s_drop:
                used.add(s)
                continue
            if s in s_split:
                used.add(s)
                seas.extend(s_split[s])
                continue
            if s in s_map:
                used.add(s)
                s = s_map[s]
            seas.append(s)
        seas = sorted(set(seas))

        # --- ingredients (name, role) ---
        ings = []
        for g in r['ingredients']:
            before_i[g['name']] += 1
            n = g['name']
            if n in i_map:
                used.add(n)
                n = i_map[n]
            role = force_role.get(g['name'], g['role'])
            if g['name'] in force_role:
                used.add(g['name'])
            ings.append({'name': n, 'role': role})
        # (name, role) is the score key, so dedupe on the pair — a dish may legitimately
        # carry the same ingredient twice with different roles (酢豚: 片栗粉 coat + thicken)
        seen, ded = set(), []
        for g in ings:
            k = (g['name'], g['role'])
            if k not in seen:
                seen.add(k)
                ded.append(g)
        ings = ded

        # --- methods ---
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
                meth.append(m)  # keep A-0's order; sorting here destroyed sequence info
        if r['methods'] and not meth:
            emptied.append(r['name'])

        # role rules keyed on method: A-0 never emitted 'とじ' (it wasn't in its
        # vocabulary), so 親子丼/他人丼/カツ丼/卵とじ scattered across sub/bind/main.
        # Re-seat them here, or the new role stays declared-but-unused.
        for mname, rule in fbm.items():
            if mname not in meth:
                continue
            used.add(mname)
            for g in ings:
                if g['name'] == rule['ingredient'] and g['role'] in rule['from_roles']:
                    g['role'] = rule['to_role']
                    role_forced.append((r['name'], mname))

        for x in seas:
            after_s[x] += 1
        for g in ings:
            after_i[g['name']] += 1
        for x in meth:
            after_m[x] += 1

        # primary method = the dish's dominant technique (lowest dominance rank).
        # It is what decides the finished dish; everything else is a step passed through.
        primary = min(meth, key=lambda x: dom[x]) if meth else None
        out.append({'name': r['name'], 'seasonings': seas, 'ingredients': ings,
                    'methods': meth, 'primary_method': primary, 'steps': r['steps']})

    print('=== vocabulary size: raw -> normalized ===')
    print('  seasonings : %3d -> %3d' % (len(before_s), len(after_s)))
    print('  ingredients: %3d -> %3d' % (len(before_i), len(after_i)))
    print('  methods    : %3d -> %3d' % (len(before_m), len(after_m)))

    print('\n=== methods emptied by normalization (would score 0.0 on the method axis) ===')
    print('  ', emptied if emptied else 'none')

    missing_rank = sorted(after_m.keys() - set(dom))
    print()
    print('=== methods with no dominance rank (cannot pick a primary) ===')
    print('  ', missing_rank if missing_rank else 'none')

    from collections import Counter as _C
    pc = _C(o['primary_method'] for o in out)
    print()
    print('=== primary_method distribution ===')
    for k, v in pc.most_common():
        print('  %3d  %s' % (v, k))

    all_keys = (set(s_map) | set(s_split) | s_drop | set(i_map) | set(m_map) | m_drop
                | set(force_role))
    stale = sorted(all_keys - used)
    print('\n=== alias entries that matched nothing (stale) ===')
    for k in stale:
        print('   STALE:', k)
    if not stale:
        print('   none')

    p = os.path.join(DATA, 'dish-v4-282.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print('\nwrote:', p, len(out))


if __name__ == '__main__':
    main()
