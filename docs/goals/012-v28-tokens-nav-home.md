# Objective

Implement the v2.8 design tokens, the new 3-tab bottom nav, and the Home screen (今日のおすすめ) skeleton (spec v2.8 draft §4.1, implementation units 1-2; decision 002).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.8-draft.md`
Decision: `docs/decisions/002-near-complete-mvp-validation.md`
Copy source of truth: `mocks/home.md`
Design tokens: `mocks/design-tokens.md`

v2.8 shifts validation from first-touch reaction to repeated real usage. The Home screen is where returning users land and get exactly one featured suggestion ("今日のとなりごはん"). The owner's concept design defines the look: warm cream background, white cards, orange outlined-pill buttons, 3 mode tabs, bottom nav (今日のおすすめ / 広がりマップ / 食材から探す).

The Phase 0 surfaces (/, /select, /recommend, /saved) are LIVE in production. Do not break them. v2.8 screens are built alongside them.

# Scope

1. `app/globals.css` — add the v2.8 design tokens from `mocks/design-tokens.md` as CSS variables (`--tn-*`) and component classes (`tn-card`, `tn-pill-button`, `tn-tag-easy` etc.). Keep existing phase0 classes untouched.
2. `components/mvp/BottomNav.tsx` — new. Fixed 3-tab bottom nav per `mocks/home.md`: 今日のおすすめ (`/home`) / 広がりマップ (`/map`) / 食材から探す (`/ingredients`). Active tab = accent color. Inline SVG icons (home / map-network / basket), no icon library.
3. Route shells:
   - `app/home/page.tsx` — Home screen (this goal's main work)
   - `app/map/page.tsx` — placeholder: heading `広がりマップ` + text `準備中です。もうすぐ、作った料理が島になります。` + BottomNav
   - `app/ingredients/page.tsx` — placeholder: heading `食材から探す` + text `準備中です。` + BottomNav
4. `lib/mvp/todaysPick.ts` — new. Pure function `todaysPick(selectedBaseDishIds, mode, dateISO)`:
   - mode: `'easy' | 'stretch' | 'full'` mapped from difficulty 1 / 2 / 3
   - picks ONE featured card deterministically: filter `recommendDishes(selected)` by mode difficulty (fall back to all if the mode has no match), then index by a simple hash of `dateISO` (same day = same pick). No APIs, no randomness at render time.
5. `components/mvp/HomeScreen.tsx` — new client component, per `mocks/home.md`:
   - Greeting by time of day (おはようございます！ / こんにちは！ / こんばんは！) + `今日のおすすめはこちら`
   - 3 mode tabs (かんたん・すぐ作れる・工程少なめ / 少し広げる・いつもと少し違う / しっかり作る・満足感のある一品), single select, default かんたん; switching updates the featured card
   - Featured block: `{起点料理}から広げる` + `いつもの料理から、少し変えてみませんか？`; featured card with おすすめ！ badge, mode tag, title, shortCopy, and 3 detail rows: 変わるところ (first changedPoints), 工程量 (`{起点料理}＋{changedPoints.length}工程`), 新しく必要な食材 (extraIngredients joined with 、). Buttons: `詳しく見る` (opens existing `DishDetailModal`) + bookmark save toggle (reuse `useSavedDishes`)
   - `他にもこんな広げ方があります` + `すべて見る` link to `/recommend?base=...`: next 3 cards (excluding featured) with mode tag, title, shortCopy, 工程量 row, chevron opening detail
   - Bottom blocks: 作りたいリスト (saved dish titles, max 3, link 一覧を見る → `/saved`) and 最近作った料理 (empty state `まだ記録がありません` — the 作った feature arrives in goal 013)
   - Photos: use a `tn-surface-soft` placeholder block (no real images yet)
   - Base dish selection: read from localStorage selection if present; if the user has no selection, show a lead-in card linking to `/select` (`まずは作れる料理を選んでください`). Persist the selection used by /recommend flow: if none exists, this screen must not crash
   - NOTE: selected base dishes are currently passed via URL on /recommend and not persisted. Add `lib/mvp/useSelectedBaseDishes.ts`: localStorage-backed (`tonari.v28.selectedBaseDishes`, string[]), SSR-safe, same pattern as `lib/phase0/useSavedDishes.ts`. Also update `components/phase0/BaseDishSelector.tsx` minimally: on proceed, ALSO write the selection to this storage (do not change its existing navigation behavior)
6. Fire existing analytics where natural: `open_dish_card` when opening detail from home, `click_want_to_make` on save. No new event names in this goal (goal for new events comes later).

# Out of Scope

- 広がりマップ and 食材から探す real implementations (placeholders only)
- 「作った」記録 / madeAt (goal 013)
- New analytics events (return_visit etc.)
- おすすめ条件 button, hamburger menu, notification bell, carousel dots (deferred per mocks)
- Real dish photos
- Changing /, /select, /recommend, /saved behavior (except the additive storage write in BaseDishSelector)
- New dependencies

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.8-draft.md`
- `mocks/home.md`, `mocks/design-tokens.md`
- `lib/phase0/recommendDishes.ts`, `lib/phase0/useSavedDishes.ts`
- `components/phase0/DishDetailModal.tsx`
- `data/dishCards.ts`, `data/baseDishes.ts`

# Implementation Plan

1. Inspect current state; confirm phase0 surfaces work.
2. Add tokens/classes to globals.css.
3. Build useSelectedBaseDishes + the additive write in BaseDishSelector.
4. Build todaysPick (pure, deterministic).
5. Build BottomNav + route shells.
6. Build HomeScreen.
7. Run verification.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`.

Behavior to confirm in the report (code-level reasoning is fine; browser check happens outside the sandbox):

- /home with no selection shows the lead-in card and does not crash
- /home with a selection shows featured + 3 secondary cards; same day = same featured pick; mode switch changes it
- Save toggle on home reflects in /saved
- /, /select, /recommend, /saved still build and render

# Stop and Ask Conditions

Stop and ask if:

- reusing DishDetailModal from home requires changing its props in a breaking way
- the deterministic pick cannot satisfy "same day same pick" without larger changes
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
