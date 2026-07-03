# Spec 027: Cookbook Editing

Approved: 2026-07-03

## What We're Building

料理詳細画面に編集モードを追加し、食材・手順・メモをユーザー自身の言葉で上書きできるようにする（DishOverride層）。正本データ（data v4）は不変のまま、上書きは端末ローカルの別レイヤーとして保存する。加えて、ユーザーが完全にゼロから料理を追加できる自作料理作成フォーム（CustomDish）を実装し、レパートリータブのマップ・料理帳リストの両方に反映させる。

## User Story

自分なりのアレンジを加えて料理を作ったユーザーとして、
レシピの食材や手順を自分用に書き換えたい。あるいはアプリのデータにない料理も自分の記録として残したい。
そうすれば、料理帳が本当に自分のレパートリーの記録になる。

## Feature Overview

### Feature A: 料理詳細・編集モード

- 通常表示の料理詳細画面（`components/mvp/DishDetailScreen.tsx` 相当）に「編集」ボタンを追加
- 編集モードでは以下を編集可能:
  - 材料リスト（`new_ingredients` を上書き。テキスト行の追加/削除/編集）
  - ざっくり手順（`rough_steps` を上書き。同様にテキスト行の追加/削除/編集）
  - メモ（自由記述テキストエリア。正本データに存在しない新規フィールド）
- 「保存」タップ → `DishOverride` としてAsyncStorageの `dish_overrides` に `dish_id` キーで保存（既存があれば上書き）
- 「保存」後は通常表示に戻り、以降その料理を開くたびに override があれば override の内容を優先表示する（正本の `NearbyRelation.new_ingredients` / `rough_steps` は変更しない。マージは表示時のみ行う）
- 「リセット」導線（override削除、正本表示に戻す）を編集モード内に用意する
- `dish_edit_save` イベントを保存時に発火（`dishId` パラメータ）

### Feature B: 自作料理作成フォーム

- 入力: 料理名（必須）、材料リスト（複数行、最低1件推奨だが空でも保存可）、手順リスト（複数行）
- ベース料理アタッチのピッカー（任意）: 「どの料理に近いですか？」で15ベース料理から1つ選択、または「選ばない」
  - 選択時 → `attached_base_dish_id` に設定。マップ配置は該当ベース料理の島クラスタ付近（spec-026のマップロジックに従う）
  - 未選択時 → `attached_base_dish_id` は `undefined`。マップの固定「自作」エリアに配置
- 「作成」タップ → `CustomDish` としてAsyncStorageの `custom_dishes` 配列に追加（`id` は `custom-${Date.now()}` 等で生成）
- 作成後、料理帳リストと（設定していれば）マップに即座に反映される
- `custom_dish_create` イベントを発火（`dishId` パラメータに生成されたID）

### Feature C: 料理帳リスト統合

- spec-026のCookbookListView（料理帳リストビュー）から、自作料理作成フォームへの導線（「＋ 自作料理を追加」ボタン等）をこのspecで追加する
- 自作料理は料理帳リストに「自作」バッジ付きで表示される（表示自体はspec-026で実装済みの前提。本specでは作成データが正しく流れ込むことを保証する）
- 自作料理の詳細画面は通常の料理詳細画面と同一コンポーネントを再利用し、CustomDishのフィールドをそのまま表示する（`new_ingredients`相当は`ingredients`、`rough_steps`相当は`steps`にマッピング）。自作料理は元から編集モードのみで、正本/上書きの区別はない（全フィールドが直接編集対象）

## Screen Layout

### 編集モード

```
┌──────────────────────┐
│ ← 戻る          [保存]  │
│                        │
│ 親子丼                  │
│ カレーから広げる          │
│                        │
│ 材料リスト               │
│ [卵           ] [×]     │
│ [みつば        ] [×]     │
│ [+ 追加]                │
│                        │
│ ざっくり手順             │
│ [1. 出汁を温める] [×]     │
│ [+ 追加]                │
│                        │
│ メモ                    │
│ [自由記述...]            │
│                        │
│      [リセット]          │
└──────────────────────┘
```

### 自作料理作成フォーム

```
┌──────────────────────┐
│ ← 戻る                  │
│ 自分の料理を追加          │
│                        │
│ 料理名 *                │
│ [                ]     │
│                        │
│ どの料理に近いですか？（任意）│
│ [カレー ▼] または [選ばない] │
│                        │
│ 材料                    │
│ [                ]     │
│ [+ 追加]                │
│                        │
│ 手順                    │
│ [                ]     │
│ [+ 追加]                │
│                        │
│      [作成する]          │
└──────────────────────┘
```

## Interaction Flow

1. 料理詳細画面を開く → 通常表示（overrideがあれば反映済みの内容）
2. 「編集」タップ → 編集モードへ。材料/手順/メモを編集
3. 「保存」タップ → DishOverrideとして保存、通常表示に戻る（次回表示時も反映される）
4. 「リセット」タップ → overrideを削除、正本データの表示に戻る
5. レパートリータブの料理帳リストから「＋ 自作料理を追加」タップ → 作成フォームへ
6. 料理名・材料・手順を入力し、任意でベース料理をアタッチ
7. 「作成する」タップ → CustomDishとして保存、料理帳リスト（と該当する場合マップ）に反映

## Scope

### In scope

- `app/dish/[id].tsx` の編集モード拡張（既存の詳細画面ルートに編集状態を追加）
- `components/native/DishDetailScreen.tsx` の編集モードUI
- `components/native/DishEditForm.tsx`
- `components/native/CustomDishForm.tsx`
- `app/custom-dish/new.tsx`
- DishOverrideのマージ表示ロジック（正本 + override → 表示用データへのマージ関数、`lib/native/dishOverrides.ts` 等に分離）
- CustomDishの保存・一覧反映ロジック

### Out of scope

- 正本データ（data v4）自体の編集・削除（不変が前提）
- 自作料理の削除機能（v1では作成のみ。削除はv1.1検討）
- 自作料理の写真添付（ADR-007により写真機能は対象外）
- マップの厳密な座標配置計算（spec-026の簡易配置ロジックをそのまま使う）

## Done When

- [ ] 料理詳細画面に「編集」ボタンがあり、編集モードへ遷移できる
- [ ] 編集モードで材料・手順の行を追加/削除/編集できる
- [ ] メモを自由記述できる
- [ ] 「保存」でDishOverrideが `dish_overrides` に保存され、通常表示に反映される
- [ ] 「リセット」でoverrideが削除され正本表示に戻る
- [ ] override保存後、アプリ再起動してもoverrideが復元される
- [ ] 自作料理作成フォームで料理名・材料・手順を入力し作成できる
- [ ] ベース料理アタッチを選択した場合、`attached_base_dish_id` が正しく保存される
- [ ] 作成した自作料理が料理帳リストに「自作」バッジ付きで表示される
- [ ] 作成した自作料理がマップの該当位置（アタッチ先付近 or 自作エリア）に表示される
- [ ] `dish_edit_save` / `custom_dish_create` イベントが発火する
- [ ] `npm run lint` / TypeScriptビルドが通る

## Design References

`mocks/design-tokens.md` を参照。画像なし。既存の `components/mvp/DishDetailScreen.tsx` の表示レイアウトを踏襲し、編集モードは同一画面のトグル状態として実装する（M6: interactive — 編集・保存・リセットの実操作確認が必須）。

## Technical Notes (for Codex)

### 参照する既存ファイル（移植元）

- `components/mvp/DishDetailScreen.tsx` — 通常表示レイアウトの移植元
- `lib/mvp/useUserState.ts` — 状態更新パターン（`writeState` によるAsyncStorage書き込みパターンをdish_overrides/custom_dishes用に拡張する参考実装）
- `types/native.ts`（spec-022で作成済み前提）— DishOverride, CustomDish型定義

### 新規作成ファイル

```
app/dish/[id].tsx
app/custom-dish/new.tsx
components/native/DishDetailScreen.tsx
components/native/DishEditForm.tsx
components/native/CustomDishForm.tsx
lib/native/dishOverrides.ts
```

### DishOverrideマージロジック

```ts
function mergedDishContent(relation: NearbyRelation, override?: DishOverride) {
  return {
    ingredients: override?.ingredients_override ?? relation.new_ingredients,
    steps: override?.steps_override ?? relation.rough_steps ?? [],
    memo: override?.memo ?? '',
  }
}
```

### useUserState拡張（dish_overrides / custom_dishes操作）

`lib/native/useUserState.ts`（spec-022作成分）に以下の操作を追加する:

```ts
saveDishOverride(dishId: string, override: Omit<DishOverride, 'dish_id' | 'updated_at'>): void
resetDishOverride(dishId: string): void
addCustomDish(dish: Omit<CustomDish, 'id' | 'created_at'>): void
```

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `lib/native/dishOverrides.ts`（マージロジック、他に依存しない）
- Set B: `lib/native/useUserState.ts` への `saveDishOverride`/`resetDishOverride`/`addCustomDish` 追加（spec-022の既存実装への追加のみ）

Wave 2（並行可、Wave 1完了後）:
- Set C: `components/native/DishEditForm.tsx`（Set A/Bに依存）
- Set D: `components/native/CustomDishForm.tsx`（Set Bに依存）

Wave 3（順次・統合）:
- Set E: `components/native/DishDetailScreen.tsx` + `app/dish/[id].tsx`（Set A/Cを統合、編集モードのトグル制御）
- Set F: `app/custom-dish/new.tsx`（Set Dを統合）

## New analytics events

新規イベント: `dish_edit_save`（`dishId`パラメータ）, `custom_dish_create`（`dishId`パラメータ）。
