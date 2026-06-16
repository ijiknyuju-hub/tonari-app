# Objective

Implement the 2-screen onboarding flow (welcome + base dish selection) so
first-time users can select their cooking repertoire before seeing the home
screen. Returning users skip onboarding entirely.

# Spec Reference

- Spec: `docs/specs/spec-020-onboarding.md`

# Dependencies

- [x] Goal 018 (v3 data model) — completed
- [x] Goal 019 (home card UI) — completed

# Design References

None (emoji-based wireframe mockups, no design images).

# Product Context

Without onboarding, first-time users land on an empty home screen with no
recommendations. This is the critical missing piece before public launch —
the app needs to know what the user can cook to generate "nearby dish"
suggestions. This goal directly unblocks the v2.7 launch path.

# Scope

### Create

- `components/mvp/WelcomeScreen.tsx` — intro screen with app description and
  "はじめる" button
- `components/mvp/BaseDishSelector.tsx` — 10 dish cards in 2×5 grid with
  multi-select, pinned chips, count display, and proceed button
- `app/onboarding/page.tsx` — route for the 2-step onboarding flow

### Modify

- `app/page.tsx` or `components/mvp/HomeScreen.tsx` — redirect to /onboarding
  when selectedDishes is empty (replace current EmptyState behavior)
- Settings area — add "ベース料理を変更する" entry point that reuses
  BaseDishSelector

### Read only

- `data/v3.ts` — 10 base dishes
- `types/dish.ts` — Dish type
- `lib/mvp/useSelectedBaseDishes.ts` — existing selection state hook
- `app/globals.css` — existing styles

# Out of Scope

- Skip button (bypassing dish selection)
- Animation or transition effects
- Returning user greeting ("おかえりなさい")
- "全部選ぶ" / "リセット" buttons
- Real food photos
- Server-side storage or user accounts
- Prototype code in `components/` top level or `lib/`

# Files to Read First

- `AGENTS.md`
- `docs/specs/spec-020-onboarding.md`
- `data/v3.ts`
- `types/dish.ts`
- `lib/mvp/useSelectedBaseDishes.ts`
- `components/mvp/HomeScreen.tsx`
- `app/globals.css`

# Implementation Plan

1. Read spec and inspect current code state (HomeScreen empty state logic,
   useSelectedBaseDishes API, base dish data shape in v3.ts).
2. Create `WelcomeScreen.tsx`:
   - App intro text + 3-step explanation box + "はじめる" button
   - Orange accent (#f97316) consistent with existing design
3. Create `BaseDishSelector.tsx`:
   - Render all 10 base dishes as emoji cards in 2-column grid
   - Tap toggles selection (orange border + #FFF7ED background)
   - Selected dishes shown as chips pinned above the grid
   - Count display ("Nつ選択中")
   - Proceed button: gray/disabled at 0, orange/enabled at 1+
   - On proceed: call useSelectedBaseDishes setter, navigate to /home
4. Create `app/onboarding/page.tsx`:
   - 2-step flow: welcome → selection (local state or sub-routes)
5. Modify entry point:
   - If selectedDishes is empty → redirect to /onboarding
   - Remove or replace current EmptyState in HomeScreen
6. Add settings entry point for changing base dishes later.
7. Run verification.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`.

Then with `npm run dev` confirm:

- First visit (clear localStorage) → welcome screen appears
- "はじめる" → selection screen with 10 cards in 2×5 grid
- Tapping a card toggles selection with orange visual feedback
- Selected dishes appear as pinned chips above grid
- 0 selected → "探す" button is disabled (gray)
- 1+ selected → "探す" button is enabled (orange)
- Tapping "探す" → home screen shows recommended cards
- Refresh page → home screen loads directly (skips onboarding)
- No console errors at 375px mobile width

# Stop and Ask Conditions

Stop and ask if:

- Goals 018/019 changes are not present in the branch
- useSelectedBaseDishes API doesn't match expected shape
- base dish data in v3.ts lacks emoji or name fields
- the spec conflicts with existing routing structure
- unrelated user changes would need to be overwritten

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
