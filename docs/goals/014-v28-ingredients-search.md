# Objective

Implement the 食材から探す screen at `/ingredients` (owner concept design; copy in `mocks/ingredients-search.md`).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.8-draft.md`
Copy source of truth: `mocks/ingredients-search.md`
Visual reference: `mocks/concept/ingredients-search.webp` (warm cream bg, white cards, orange accent — tokens already in `app/globals.css` as `--tn-*` / `tn-*` classes from goal 012)

Third tab of the bottom nav. Lets users start from ingredients they have and find dishes they can make or stretch into. All data is static (derived from `data/dishCards.ts` and `data/baseDishes.ts`) — this is NOT inventory management.

# Scope

1. `lib/mvp/ingredientIndex.ts` — new, pure:
   - `allIngredients()`: unique ingredient names collected from dishCards `mainIngredients` + `extraIngredients` (and baseDishes if they carry ingredients), sorted by frequency desc
   - `dishesByIngredients(selected: string[])`: dishCards where every selected ingredient appears in `mainIngredients`; and `almostMakeable(selected)`: dishes missing 1-2 ingredients, returning `{ card, missing: string[] }`
2. `components/mvp/IngredientsSearch.tsx` — new client component per `mocks/ingredients-search.md`:
   - Header: `食材から探す` + `冷蔵庫にある食材から、作れる料理を見つけよう`
   - `最近よく使う食材` chip row: top ~8 frequent ingredients, multi-select toggle chips (MVP: static frequency, no learning, no search box, no 絞り込み)
   - `選択中の食材` block with remove (×) per chip and `クリア`
   - Result tabs (3, count badges): `作ったことがある` (madeAt set OR base dish) / `作りたいリスト` (saved, not made) / `チャレンジしてみたい` (everything else matching). Caption under tab 1 per mocks
   - Result cards: title, shortCopy, tag (かんたん/ふつう by difficulty), `工程：{roughSteps.length}`, tap → existing `DishDetailModal`; bookmark toggle (useSavedDishes)
   - `もう少し食材を足すと、こんな料理も作れます` strip: up to 3 `almostMakeable` results as `{title} ＋{missing joined by 、}`
   - Empty states: no ingredients selected → show all dishes in tabs; a tab with no matches → `この食材で表示できる料理がまだありません`
   - Photos: `tn-surface-soft` placeholder blocks
3. `app/ingredients/page.tsx` — replace the placeholder with the real screen (keep BottomNav).
4. Analytics: fire existing `open_dish_card` on detail open and `click_want_to_make` on save. No new event names.

# Out of Scope

- Free-text ingredient search, 絞り込み, 並び替え (deferred per mocks)
- Ingredient learning ("最近よく使う" is static frequency)
- New data files for ingredients beyond what derives from existing dish data
- 広がりマップ
- New dependencies

# Files to Read First

- `AGENTS.md`
- `mocks/ingredients-search.md`
- `data/dishCards.ts`, `data/baseDishes.ts`, `types/dish.ts`
- `lib/phase0/useSavedDishes.ts` (made state from goal 013)
- `components/mvp/BottomNav.tsx`, `app/ingredients/page.tsx`
- `app/globals.css` (tn-* tokens)

# Implementation Plan

1. Build ingredientIndex (pure, unit-testable shape).
2. Build IngredientsSearch UI.
3. Swap into /ingredients route.
4. Run verification.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

Confirm by code reasoning: chip toggle updates all three tabs and counts; tab classification (made / saved / challenge) is correct; almostMakeable lists missing ingredients correctly; no crash with zero selection.

# Stop and Ask Conditions

Stop and ask if:

- existing dish data lacks enough ingredient coverage to make the screen meaningful
- tab classification conflicts with how useSavedDishes models state
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
