# Objective

Implement the 「作った」 (made) recording feature: extend SavedDish with `madeAt`, add 作った buttons, and surface recent made dishes on Home (spec v2.8 draft §4.3, §5.1; implementation unit 3).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.8-draft.md`
Copy: `mocks/home.md` (最近作った料理 block)

`mark_made` is one of v2.8's two primary metrics (the other is `return_visit`). Recording 作った is what later feeds the 広がりマップ territory state, so the data shape must be right now.

# Scope

1. `types/dish.ts` — extend `SavedDish` with optional `madeAt?: string` (spec §5.1). Backwards compatible: existing stored entries without madeAt stay valid.
2. `lib/phase0/useSavedDishes.ts` — add to the hook API:
   - `markMade(dishId)`: sets `madeAt` to now; if the dish is not yet saved, save it AND set madeAt in one write
   - `unmarkMade(dishId)`: removes `madeAt` only (keeps the save)
   - `isMade(dishId)`, `madeDishes` (sorted by madeAt desc)
   Keep the existing API unchanged.
3. 作った buttons:
   - `components/phase0/DishDetailModal.tsx` — add a secondary button 「作った」 next to the save button; made state shows 「作った済み」 and tapping again unmarks. Keep the modal's existing layout working at 375px
   - `components/phase0/SavedDishList.tsx` — per saved dish add 「作った」 toggle; made dishes show a made indicator (e.g. tag 作った済み)
4. `components/mvp/HomeScreen.tsx` — 最近作った料理 block: replace the empty-state-only block with real data (up to 2 most recent made dishes: title + `作った日：YYYY/MM/DD`), keep empty state copy `作った記録はまだありません` when none. Tapping a made dish opens its detail (reuse the existing modal wiring).
5. Analytics: fire a `mark_made` event (param: dishId) on marking made. Add `mark_made` to the typed event names in `lib/phase0/analytics.ts`. Do NOT add other new events in this goal.

# Out of Scope

- 広がりマップ (later goal) — but keep madeAt data clean for it
- return_visit / open_island_map events
- Changing the save (作ってみたい) behavior
- Date formatting libraries (use Intl)
- New dependencies

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.8-draft.md` (§4.3, §5.1, §6)
- `types/dish.ts`, `lib/phase0/useSavedDishes.ts`, `lib/phase0/analytics.ts`
- `components/phase0/DishDetailModal.tsx`, `components/phase0/SavedDishList.tsx`
- `components/mvp/HomeScreen.tsx`

# Implementation Plan

1. Extend the type and hook (with corrupt-data tolerance preserved).
2. Wire the buttons in detail modal and saved list.
3. Wire 最近作った料理 on Home.
4. Add the mark_made event.
5. Run verification.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`.

Confirm by code reasoning (browser check happens outside the sandbox):

- Marking made from the detail modal works for both saved and not-yet-saved dishes
- Unmarking made keeps the save
- Old localStorage entries (no madeAt) still load
- Home shows up to 2 recent made dishes with date; empty state intact

# Stop and Ask Conditions

Stop and ask if:

- the SavedDish change would break stored data irrecoverably
- modal layout cannot fit the second button without redesign
- unrelated user changes would need to be overwritten

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly. 日本語文字列はUTF-8を維持すること。
