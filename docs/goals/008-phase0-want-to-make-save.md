# Objective

Implement the 「作ってみたい」 save feature with localStorage persistence and the saved list screen (spec v2.7 §5.6, §8, implementation unit 7).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.6, §8).

`click_want_to_make` is Phase 0's primary success metric — the proxy for "this card is genuinely appealing". The save experience must feel real (persists across reload) without any account or DB.

Depends on goals 006-007 (the buttons live on cards and the detail view).

# Scope

- `lib/phase0/useSavedDishes.ts` — new. Hook backed by `localStorage`:
  - storage value: `SavedDish[]` (`{ dishId, savedAt }`, spec §8.3) under a single namespaced key (e.g. `tonari.phase0.savedDishes`)
  - API: saved list, `isSaved(dishId)`, `save(dishId)`, `unsave(dishId)`
  - SSR-safe (no `localStorage` access during server render); tolerate corrupt/missing stored JSON by resetting to empty
- Wire the 「作ってみたい」 buttons in `components/phase0/DishCard.tsx` and `DishDetailModal.tsx`:
  - unsaved → 「作ってみたい」; saved → 「保存済み」 (spec §8.2); tapping again unsaves
  - after saving, show light feedback 「作ってみたいリストに追加しました」 plus a 「リストを見る」 affordance (spec §8.4)
- `components/phase0/SavedDishList.tsx` — new. The saved list screen (route or step consistent with the flow):
  - lists saved dishes (title + reopening the detail is enough)
  - empty state, verbatim from spec §5.6:

    ```
    まだ保存した料理はありません。
    気になる料理カードで「作ってみたい」を押してみてください。
    ```

  - reachable from the recommendation screen (e.g. a small saved-count link/badge)

# Out of Scope

- Accounts, DB, sync, export.
- 「作った」 tracking (optional per spec §8.5 — skip here).
- Event tracking (goal 009).
- Prototype code (`lib/storage.ts` and other prototype modules — do not reuse).
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.6, §8)
- `types/dish.ts`
- `components/phase0/DishCard.tsx`, `components/phase0/DishDetailModal.tsx`, `components/phase0/DishCardList.tsx`

# Implementation Plan

1. Inspect the current state; confirm goals 006-007 are in the branch.
2. Implement `useSavedDishes`.
3. Wire both 「作ってみたい」 buttons and the post-save feedback.
4. Build `SavedDishList` and its entry point.
5. Run verification.
6. Report changed files and results.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev` confirm:

- Saving from a card and from the detail both flip the button to 「保存済み」 and show the feedback message.
- The saved list shows saved dishes; unsaving removes them.
- **Reloading the page keeps the saved state** (localStorage persistence).
- Clearing site data shows the empty state copy verbatim.
- No hydration warnings or console errors.

# Stop and Ask Conditions

Stop and ask if:

- goals 006-007 are not present in the branch
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
