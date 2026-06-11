# Objective

Implement the 「作れる料理を選ぶ」 chip-style selection screen (spec v2.7 §5.3, §7, implementation unit 3).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.3, §7).

This is the only user input in Phase 0. If it feels heavy, users bounce before ever seeing a dish card, so it is chip selection only — no free text. Depends on goal 002 (base dish data) and connects from the top-page CTA (goal 003).

# Scope

- `components/phase0/BaseDishSelector.tsx` — new. Chip-style multi-select of the 16 base dishes from `data/baseDishes.ts`.
- A route or in-page step reachable from the top CTA (e.g. `app/select/page.tsx`, or a step within a single-page flow — spec §5.1 allows one page as long as it feels like screen transitions). Keep the choice simple and consistent with goal 003's wiring.

Behavior (spec §5.3, §7):

- Heading copy:

  ```
  作れる料理を選んでください

  よく作る料理を3つくらい選ぶと、
  あなたに近い料理が出てきます。
  ```

- Multi-select chips; selected chips visually emphasized.
- Selected dishes pinned at the top of the screen.
- Proceed button labeled 「あなたのとなりごはんを探す」.
- 0 selected → proceed disabled. 1+ → enabled. No upper limit (optional 「十分です」 hint at 5+).
- Selection state in React state (lifting it to a parent or a small context is fine). No persistence required for the selection itself.
- Proceeding hands the selected base dish ids to the recommendation step (goal 005/006). Until those exist, navigate to a stub that receives the ids (e.g. query params or state) and note the handoff shape in the report.

# Out of Scope

- Free-text dish input.
- Recommendation logic and card UI (goals 005-007).
- localStorage persistence (goal 008 covers saving cards, not selections).
- Prototype code (`components/` top level, `lib/`, `app/legacy/`).
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.3, §7)
- `data/baseDishes.ts`, `types/dish.ts`
- `app/page.tsx` (top CTA wiring from goal 003)
- `app/globals.css`

# Implementation Plan

1. Inspect the current state; confirm goals 002-003 are in the branch.
2. Add `components/phase0/BaseDishSelector.tsx` and the route/step.
3. Wire the top-page CTA to this screen.
4. Run verification.
5. Report changed files, the id-handoff shape, and results.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev` confirm:

- All 16 chips render; tapping toggles selection with clear visual feedback.
- Selected dishes appear pinned at the top.
- Proceed button is disabled at 0 selections and enabled at 1+.
- Works without layout break at 375px width; chips are comfortably tappable.
- No console errors.

# Stop and Ask Conditions

Stop and ask if:

- goals 002-003 are not present in the branch
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
