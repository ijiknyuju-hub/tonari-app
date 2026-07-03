# Spec 025: Ingredients Tab

Approved: 2026-07-03

## What We're Building

食材タブ。持っている食材をチップで選び、「今すぐ作れる」料理を絞り込んで表示する。web版は「食材から探す」画面（`IngredientsSearch.tsx`）とホーム画面内のチップフィルタ（`IngredientChipFilter.tsx`）の2つに機能が分かれていたが、native v1では食材タブに一本化する。

## User Story

冷蔵庫にある食材からアプリを使い始めたいユーザーとして、
持っている食材をタップで選んで、それだけで作れる料理を見たい。
そうすれば、買い物なしで今すぐ作れる一品を見つけられる。

## Feature Overview

### Feature A: 食材チップフィルタ

- セクション見出し「持っている食材で絞る」
- チップ一覧: 選択中のベース料理に紐づく `relations` の `new_ingredients` から抽出したユニークな食材（カテゴリ変換ロジックはweb版 `HomeScreen.tsx` の `INGREDIENT_CATEGORIES` マップを踏襲——生の食材名ではなくカテゴリ名でチップ化する）
- タップでON/OFFをトグル。ONは accent色背景、OFFはoutline
- 選択状態は `UserState.available_ingredients[]` に永続化（ホームタブと共有の状態——このタブで選択した食材はホームのfeatured/other cardsの絞り込みにも反映される。spec-024のホーム側フィルタ適用は本specの完了後に統合する）
- `ingredient_filter_toggle` イベントを発火（`ingredient`, `active` パラメータ）

### Feature B: 「今すぐ作れる」結果一覧

- 選択中の食材カテゴリが `new_ingredients` の必要カテゴリを全て満たす `relations` を一覧表示
- 各結果カードに: 対象料理名、起点料理名（「〇〇から →」）、差分説明（`description_line1`）、必要な新食材一覧
- チップが1つも選択されていない場合: 「よく使う食材」として頻出食材の候補チップ一覧を表示（web版 `IngredientsSearch.tsx` の `frequentIngredients` ロジックを踏襲。上位8件）
- チップ選択後、該当する料理が0件の場合: 「もう少し食材を追加してみてください」を表示
- 結果カードタップ → 料理詳細画面へ遷移

## Screen Layout

```
┌──────────────────────┐
│      となりごはん        │
│                        │
│ 食材から探す             │
│ 冷蔵庫にある食材から、    │
│ 作れる料理を見つけよう     │
│                        │
│ 最近よく使う食材          │
│ [鶏肉][玉ねぎ][卵]...  → 横スクロール │
│                        │
│ 選択中の食材    [クリア]   │
│ [鶏肉 ×][玉ねぎ ×]       │
│                        │
│ ┌──────────────────┐ │
│ │ 親子丼               │ │
│ │ カレーから →          │ │
│ │ 卵でとじるだけ         │ │
│ │ 新食材: 卵、みつば      │ │
│ └──────────────────┘ │
│ ...                    │
│                        │
│ [食材][ホーム][レパートリー] │
└──────────────────────┘
```

## Interaction Flow

1. 食材タブを開く → 未選択なら頻出食材チップが表示される
2. 食材チップをタップ → 選択チップとして上部に表示、結果一覧が絞り込まれる
3. 結果一覧をスクロールして眺める、または「クリア」で選択をリセット
4. 結果カードをタップ → 料理詳細画面へ

## Scope

### In scope

- `app/(tabs)/ingredients.tsx`
- `components/native/IngredientsTab.tsx`
- `components/native/IngredientChipFilter.tsx`
- `lib/native/ingredientIndex.ts`（`lib/mvp/ingredientIndex.ts` の移植: `allIngredients()`, `relationsByIngredients()`, `getDishName()`）
- `UserState.available_ingredients[]` の読み書き（`lib/native/useUserState.ts` は spec-022 で作成済み前提。本specで実際の toggle 操作を実装する）

### Out of scope

- ホーム画面側のフィルタ適用ロジックの統合（spec-024で骨格は用意済み。本specの `available_ingredients` 更新がホームにも反映されることの確認は結合時に行う）
- 料理詳細画面本体（既存の詳細画面ルートへ遷移するだけ。詳細画面の編集モードはspec-027）

## Done When

- [ ] 食材タブに未選択時は頻出食材チップが表示される
- [ ] チップタップで選択トグルでき、選択チップが上部に表示される
- [ ] 選択食材に応じて結果一覧が絞り込まれる
- [ ] 該当0件のとき「もう少し食材を追加してみてください」が表示される
- [ ] 「クリア」で選択が全解除される
- [ ] 結果カードタップで料理詳細画面へ遷移する
- [ ] `available_ingredients` がAsyncStorageに永続化され、アプリ再起動後も復元される
- [ ] `ingredient_filter_toggle` イベントが発火する
- [ ] `npm run lint` / TypeScriptビルドが通る

## Design References

`mocks/design-tokens.md` を参照。web版 `components/mvp/IngredientsSearch.tsx` と `components/mvp/IngredientChipFilter.tsx` のレイアウト・ロジックを統合して踏襲する（M6: static）。

## Technical Notes (for Codex)

### 参照する既存ファイル（移植元）

- `components/mvp/IngredientsSearch.tsx` — 画面全体の構成・頻出食材ロジック源
- `components/mvp/IngredientChipFilter.tsx` — チップ表示コンポーネントの移植元
- `lib/mvp/ingredientIndex.ts` — `allIngredients`, `relationsByIngredients`, `getDishName` ロジック源
- `components/mvp/HomeScreen.tsx` 内の `INGREDIENT_CATEGORIES` マップ・`toCategory` 関数 — カテゴリ変換ロジック源（`lib/native/ingredientCategories.ts` として分離移植してもよい）

### 新規作成ファイル

```
app/(tabs)/ingredients.tsx
components/native/IngredientsTab.tsx
components/native/IngredientChipFilter.tsx
lib/native/ingredientIndex.ts
lib/native/ingredientCategories.ts
```

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `lib/native/ingredientIndex.ts`（ロジック移植、他に依存しない）
- Set B: `lib/native/ingredientCategories.ts`（データ移植、他に依存しない）
- Set C: `components/native/IngredientChipFilter.tsx`（表示コンポーネント単体）

Wave 2（順次、Wave 1完了後）:
- Set D: `components/native/IngredientsTab.tsx` + `app/(tabs)/ingredients.tsx`（Set A/B/Cを統合）

## New analytics events

新規イベントなし。既存の `ingredient_filter_toggle`, `open_ingredients` を使用する。
