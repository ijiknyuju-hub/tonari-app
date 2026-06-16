# Objective

Implement the recommendation logic that turns selected base dishes into an ordered list of dish cards with closeness labels (spec v2.7 §6.4, §6.5, implementation unit 4).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§6.4, §6.5, §10.3).

Phase 0's core claim is "提案が近い". The logic itself can be simple — what matters is that the output order and the closeness labels feel right to a human. If cards feel too far ("提案が遠い"), that is the No-Go failure mode this logic owns.

# Scope

- `lib/phase0/recommendDishes.ts` — new. Pure function(s), no React:
  - Input: selected base dish ids. Output: dish cards from `data/dishCards.ts`, ordered by closeness.
  - A card matches when any of its `baseDishIds` is selected; cards matching more selected bases rank higher.
  - Closeness scoring uses the four axes (味付け / 食材 / 調理方法 / 工程の軽さ) via the card fields (`tasteAxis`, `mainIngredients`, `cookingMethod`, `difficulty`/`timeMinutes`). A simple weighted overlap count is enough; document the weights in code.
  - Map score ranges to the three labels: 「かなり近い」「少し変えれば作れる」「ちょっと挑戦」. Every returned card gets exactly one label.
  - For each card, also return which selected base dish to name in 「〇〇が作れるなら近い」 (the closest matching base).
  - Deterministic output (stable sort) so results are reproducible.

# Out of Scope

- Any UI (goal 006 renders the output).
- Changing `data/dishCards.ts` content (if data gaps block scoring, report them instead).
- ML, AI calls, server-side anything. This is a pure client-usable function over static data.
- Prototype code (`lib/closeness.ts` and other prototype modules — do not import or modify; the Phase 0 MVP keeps its own logic under `lib/phase0/`).

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§6)
- `types/dish.ts`, `data/baseDishes.ts`, `data/dishCards.ts`
- `lib/closeness.ts` (prototype — read only for awareness, do not reuse unless trivially clean)

# Implementation Plan

1. Inspect the current state; confirm goal 002 data is present.
2. Implement `recommendDishes` with scoring, labeling, and base-dish attribution.
3. Add a tiny usage example or inline doc comment showing the call shape for goal 006.
4. Run verification.
5. Report changed files, the scoring rule summary, and sample output for the selection [麻婆豆腐, 唐揚げ].

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Also include in the report (manual run or temporary script, no test framework):

- Output for [麻婆豆腐] — the 麻婆春雨 card must rank near the top with a 「かなり近い」-tier label.
- Output for a selection with no matching cards — must return an empty list without throwing.

# Stop and Ask Conditions

Stop and ask if:

- the card data lacks fields needed for sensible scoring (report which)
- the spec conflicts with existing code
- unrelated user changes would need to be overwritten
- implementation requires a larger architecture change

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly.
