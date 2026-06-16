# Objective

Implement the recommendation card list screen — the core screen of Phase 0 (spec v2.7 §5.4, §6.3, implementation unit 5).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.4, §6.3, §6.5).

This screen is where the validation happens: a user who selected their dishes must see cards that explain **why each suggestion is close**, not just dish names. If this screen reads like a generic recipe app, the differentiation fails (No-Go row 「差別化が伝わらない」).

Depends on goals 002 (data), 004 (selection handoff), 005 (recommend logic).

# Scope

- `components/phase0/DishCard.tsx` — new. One recommendation card showing (spec §6.3 list view):
  - dish title
  - 「〇〇が作れるなら近い」 line (base dish from goal 005 attribution)
  - closeness label (かなり近い / 少し変えれば作れる / ちょっと挑戦)
  - 1-2 reasons (from `reusableSkills` / `changedPoints`)
  - 買い足し (extraIngredients, short)
  - timeMinutes and difficulty
  - 「作ってみたい」 button (until goal 008, render it; clicking may be a no-op or local state — note in report)
  - 「詳しく見る」 button (until goal 007, may be a no-op — note in report)
- `components/phase0/DishCardList.tsx` — new. Renders the ordered output of `recommendDishes` for the current selection; shows the selected base dishes at the top; handles the empty case (no matches) with a friendly message and a way back to selection.
- The screen/step after the selector's 「あなたのとなりごはんを探す」 (route or in-page step consistent with goals 003-004 wiring).

Note: a prototype `components/DishCard.tsx` already exists. Do not touch it; the Phase 0 component lives under `components/phase0/`.

# Out of Scope

- Detail view content (goal 007) and save persistence (goal 008) — only the buttons' placement here.
- Event tracking (goal 009).
- Prototype code (`components/` top level, `lib/` top level, `app/legacy/`).
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.4, §6.3)
- `lib/phase0/recommendDishes.ts` (call shape and attribution output)
- `components/phase0/BaseDishSelector.tsx` (handoff shape from goal 004)
- `types/dish.ts`
- `app/globals.css`

# Implementation Plan

1. Inspect the current state; confirm goals 002, 004, 005 are in the branch.
2. Build `DishCard` and `DishCardList`.
3. Wire the selector's proceed action to this screen.
4. Run verification.
5. Report changed files, which buttons are stubs, and results.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev` confirm:

- Selecting 麻婆豆腐 and proceeding shows cards led by 麻婆春雨-tier matches, each with the 「〇〇が作れるなら近い」 line, closeness label, reasons, 買い足し, time, difficulty.
- Cards follow the spec §5.4 example layout (reason-first, not photo-first).
- Empty selection result shows the empty state, not a crash.
- No layout break at 375px; cards and buttons are comfortably tappable.
- No console errors.

# Stop and Ask Conditions

Stop and ask if:

- goals 002, 004, or 005 are not present in the branch
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
