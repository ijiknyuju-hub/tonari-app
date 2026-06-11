# Objective

Implement the dish card detail view — the "これなら作れるかも" screen (spec v2.7 §5.5, §6.3, implementation unit 6).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.5, §6.3).

The detail view is not a recipe page. It exists to let the user understand the **difference from a dish they already cook** well enough to feel capable. Depends on goal 006 (the 「詳しく見る」 button opens this).

# Scope

- `components/phase0/DishDetailModal.tsx` — new. Modal or detail step (consistent with the existing flow style) showing, per spec §5.5:
  - dish title and the base dish (「〇〇が作れるなら近い」 + closeness label)
  - そのまま使える (reusableSkills)
  - 変えるところ (changedPoints)
  - 買い足し食材 (extraIngredients)
  - ざっくり手順 (roughSteps — short lines, not a full recipe)
  - difficulty and timeMinutes
  - 「作ってみたい」 button with saved-state display (wire to goal 008 if present; otherwise local state, noted in report)
  - close/back affordance returning to the card list with scroll position preserved
- Wire the 「詳しく見る」 button in `components/phase0/DishCard.tsx` to open it.
- Optional, low priority (spec §8.5): a small 「作った」 button may be added; skip it if it adds complexity.

# Out of Scope

- Full recipes, photos, external links.
- Save persistence internals (goal 008) and event tracking (goal 009).
- Prototype code (`components/` top level, `lib/` top level, `app/legacy/`).
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.5, §6.3)
- `components/phase0/DishCard.tsx`, `components/phase0/DishCardList.tsx`
- `types/dish.ts`
- `app/globals.css`

# Implementation Plan

1. Inspect the current state; confirm goal 006 is in the branch.
2. Build `DishDetailModal` and wire 「詳しく見る」.
3. Run verification.
4. Report changed files and results.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev` confirm:

- 「詳しく見る」 opens the detail with all §5.5 sections populated from data.
- Closing returns to the list without losing scroll position or selection state.
- Readable and unbroken at 375px width; modal is scrollable if content overflows.
- No console errors.

# Stop and Ask Conditions

Stop and ask if:

- goal 006 is not present in the branch
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
