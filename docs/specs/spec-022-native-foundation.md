# Spec 022: Native Foundation

Approved: 2026-07-03

## What We're Building

Expoプロジェクトの初期構築。3タブのナビゲーション殻、デザイントークンのRNテーマ化、AsyncStorageの状態層、data v4読み込みの受け口を用意する。この段階では各タブの中身は空のプレースホルダーでよい——目的は後続のWave 2〜4がその上に画面を積める土台を作ることに限定される。

## User Story

開発者（Codex/Sonnet）として、
Expoプロジェクトを起動し3タブ間を移動でき、状態がAsyncStorageに永続化される土台がほしい。
そうすれば、以降のWaveで機能を実装するときに毎回インフラを再構築せずに済む。

## Feature Overview

### Feature A: Expoプロジェクトセットアップ

- Expo SDK 55+、New Architecture有効、TypeScript、expo-router導入
- `app.json` / `app.config.ts` にアプリ名・スキーム（ディープリンク用）・アイコン/スプラッシュのプレースホルダーを設定
- EASビルド設定の雛形（`eas.json`）を用意する。実際のビルド実行はWave 5（spec-028後の店舗提出準備）で行う

### Feature B: 3タブナビゲーション殻

- `app/(tabs)/_layout.tsx` に食材 / ホーム / レパートリーの3タブを定義
- 各タブ画面（`ingredients.tsx`, `home.tsx`, `repertoire.tsx`）はこの時点でタブ名を表示するだけのプレースホルダー
- タブアイコン・ラベルはdesign-tokensのボトムナブ仕様（白背景・上ヘアライン・active=accent色/inactive=text-sub色）に従う

### Feature C: デザイントークンのRNテーマ化

- `mocks/design-tokens.md` の値を `lib/native/theme.ts` にプレーンなJSオブジェクトとして移植
- 色・角丸・余白をpx固定値に変換（remベースの値は基準フォントサイズ16pxとして換算）
- `StyleSheet.create` から参照できる構造にする（例: `theme.colors.accent`, `theme.radius.card`, `theme.colors.tagEasyBg` / `theme.colors.tagEasyText`）

### Feature D: AsyncStorage状態層

- `lib/native/useUserState.ts` を新規作成。`lib/mvp/useUserState.ts` の構造を移植し、AsyncStorageベースに置き換える
- 既存フィールド: `selected_dishes`, `bookmarked`, `made_records`, `promoted_variations`, `available_ingredients`, `last_active_date`
- 新規キー（この段階ではスキーマ定義と空の初期値のみ。編集UIはWave 4で実装）: `dish_overrides`（`Record<string, DishOverride>`）, `custom_dishes`（`CustomDish[]`）, `notification_prefs`（`NotificationPrefs`）
- 型定義は `types/dish.ts` に追加せず、`types/native.ts` を新規作成してDishOverride / CustomDish / NotificationPrefsを定義する（`docs/blueprint-native-v1.md` §4のフィールド定義に従う）

### Feature E: data v4読み込みの受け口

- `data/v3.ts` を現状のまま `import` して使う。data v4（15ベース料理・約120関係）がまだ届いていないため、差し替え時にファイルパスの変更だけで済むよう、直接 `data/v3.ts` を参照せず `lib/native/dishData.ts` という薄いre-exportファイルを経由させる
- `lib/native/dishData.ts` は `export { dishes, relations } from '@/data/v3'` のみを行う。data v4到着時はこの1行を新ファイルへのimportに差し替えるだけで全体に反映される

## Screen Layout

```
[Tab: 食材]        [Tab: ホーム]        [Tab: レパートリー]
┌──────────┐      ┌──────────┐      ┌──────────┐
│  食材      │      │  ホーム    │      │ レパートリー│
│ (placeholder)│    │ (placeholder)│    │ (placeholder)│
└──────────┘      └──────────┘      └──────────┘
[食材] [ホーム] [レパートリー]  ← bottom tab bar
```

## Interaction Flow

1. アプリ起動 → expo-routerが `app/(tabs)/_layout.tsx` を読み込みホームタブを初期表示
2. タブをタップ → 対応するプレースホルダー画面に切り替わる
3. アプリを閉じて再度開く → AsyncStorageから状態が復元される（この時点では確認用に `selected_dishes` の件数をプレースホルダー画面にログ出力する程度でよい）

## Scope

### In scope

- Expoプロジェクト初期化（TypeScript template）
- expo-router導入、3タブレイアウト
- `lib/native/theme.ts`
- `types/native.ts`（DishOverride, CustomDish, NotificationPrefs）
- `lib/native/useUserState.ts`
- `lib/native/dishData.ts`
- `eas.json` 雛形

### Out of scope

- 各タブの実際のUI（Wave 2以降）
- 通知（spec-028）
- 料理帳編集・自作料理（spec-027）
- data v4本体の到着待ち（プレースホルダーとして v3 を使う）

## Done When

- [ ] `npx expo start` でアプリが起動し3タブが表示される
- [ ] 3タブ間をタップで移動できる
- [ ] `lib/native/theme.ts` が design-tokens.md の全トークンをカバーしている
- [ ] `useUserState` がAsyncStorageに読み書きでき、アプリ再起動後も値が復元される
- [ ] `types/native.ts` にDishOverride / CustomDish / NotificationPrefsが定義されている
- [ ] `lib/native/dishData.ts` 経由で `data/v3.ts` のdishes/relationsが読み込める
- [ ] `npm run lint` 相当（Expo/TypeScriptのlint設定）が通る
- [ ] TypeScriptビルド（`tsc --noEmit`）がエラーなく通る

## Design References

`mocks/design-tokens.md` を参照。画像なし——この段階はプレースホルダー画面のみで、視覚検証は色・タブバーのトークン反映確認にとどまる（M6: static）。

## Technical Notes (for Codex)

### 参照する既存ファイル（移植元）

- `lib/mvp/useUserState.ts` — AsyncStorage移植のロジック源
- `types/dish.ts` — 既存の命名規則参照（新規型もこれに合わせる）
- `mocks/design-tokens.md` — トークン値の正本
- `data/v3.ts` — dishes/relations現行データ

### 新規作成ファイル

```
app/(tabs)/_layout.tsx
app/(tabs)/ingredients.tsx
app/(tabs)/home.tsx
app/(tabs)/repertoire.tsx
app/_layout.tsx
lib/native/theme.ts
lib/native/useUserState.ts
lib/native/dishData.ts
types/native.ts
eas.json
app.json (or app.config.ts)
```

### 型定義（types/native.ts）

```ts
export type DishOverride = {
  dish_id: string
  ingredients_override?: string[]
  steps_override?: string[]
  memo?: string
  updated_at: string
}

export type CustomDish = {
  id: string
  name: string
  ingredients: string[]
  steps: string[]
  attached_base_dish_id?: string
  created_at: string
}

export type NotificationPrefs = {
  morning_enabled: boolean
  morning_time: string  // "HH:mm"
  evening_enabled: boolean
  evening_time: string  // "HH:mm"
}
```

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `lib/native/theme.ts`（design-tokens.mdからの単純変換、他に依存しない）
- Set B: `types/native.ts`（型定義のみ、他に依存しない）
- Set C: `lib/native/dishData.ts`（data/v3.tsのre-export、他に依存しない）

Wave 2（並行可、Wave 1完了後）:
- Set D: `lib/native/useUserState.ts`（Set Bの型定義に依存）
- Set E: `app/(tabs)/_layout.tsx` + 3タブのプレースホルダー画面（Set Aのtheme.tsに依存）

Wave 3（順次・統合）:
- Set F: `app/_layout.tsx`（ルートレイアウト、Set D/Eの統合確認）
- Set G: `eas.json` + `app.json`（プロジェクト設定、他のコード変更と独立して進めてよい）

## New analytics events

このspecでは新規イベントは発火しない（`lib/native/analytics.ts` の雛形作成のみ、実際のtrackEvent呼び出しはWave 2以降で各画面に組み込む）。
