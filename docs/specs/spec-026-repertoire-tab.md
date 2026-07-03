# Spec 026: Repertoire Tab

Approved: 2026-07-03

## What We're Building

レパートリータブ。web版で別々だったレベルアップ画面（`LevelUpScreen.tsx`）と島マップ画面（`IslandMap.tsx`）を1つのタブに統合する。上部に達成ヘッダー（品数 + マイルストーン進捗）を常時表示し、その下をマップビューと料理帳リストビューでトグル切替する。

## User Story

自分がどれだけ料理を広げてきたか確認したいユーザーとして、
達成状況をひと目で見て、地図としても一覧としても振り返りたい。
そうすれば、育ってきたレパートリーを実感し、次に何を作るか考えられる。

## Feature Overview

### Feature A: 達成ヘッダー（常時表示）

- 「{N}品」（作った料理のユニーク数、大きな数字）
- 「累計{M}日 料理した」
- 次のマイルストーンまでの進捗バー + 「あと{X}品で{milestone}品」（`[5,10,15,20,30,50,75,100]`）
- web版 `LevelUpScreen.tsx` の該当セクションをそのまま移植（月別バーチャートはこのヘッダーには含めない——下記Feature Bのリストビューに統合する）

### Feature B: ビュー切替

- ヘッダー直下にマップ / リストの2択トグル（タブ内タブ、またはセグメントコントロール）
- 初期状態はマップビュー
- `cookbook_view_toggle` イベントを切替時に発火（`tab` パラメータに `'map' | 'list'`）

### Feature C: マップビュー（react-native-svg移植）

- web版 `IslandMap.tsx` のノード状態ロジックをそのまま移植: 作った(made)＝濃い色・領土 / 作れる・作ってみたい(bookmarked/base)＝中間色・足場 / 未踏(unexplored)＝霞み表示
- web版は現状グリッド表示（`IslandNode`型の `x`/`y`/`neighbors` 座標配置は将来実装、現行実装は簡易グリッド）。native v1でも同じ簡易グリッドで進めてよい——静的座標配置（`x`/`y`/`neighbors`）への刷新はこのspecのスコープ外とする
- react-native-svgでのSVG描画に置き換える以外、ロジック・状態分類はweb版から変更しない
- ノードタップ → 料理詳細画面へ遷移
- 自作料理（CustomDish、spec-027で作成）は専用の「自作」エリアとしてマップの別セクションに表示する。`attached_base_dish_id` が設定されている自作料理は、対応するベース料理のノード群の近くに表示する（グリッド上で隣接配置する程度の対応でよい。厳密な近接座標計算は不要）

### Feature D: 料理帳リストビュー（新規）

- 作った・保存済み・自作の全料理を1つのリストとして表示（web版 `LevelUpScreen.tsx` の「作った料理一覧」を拡張）
- 各行: 料理名、日付（作った場合）、評価絵文字（😋/🙂/🤔）、未調理の保存済みなら「作ってみたい」バッジ、自作料理なら「自作」バッジ
- 月別バーチャート（web版 `LevelUpScreen.tsx` を移植）をこのビューの上部に表示
- 空状態: 「まだ記録がありません。ホームから料理を記録してみましょう！」
- 行タップ → 料理詳細画面へ遷移（編集モードの起点はspec-027で扱う）

## Screen Layout

```
┌──────────────────────┐
│     あなたのレパートリー   │
│                        │
│        13品             │
│    累計29日 料理した      │
│ [████████░░] あと2品で15品│
│                        │
│  [ マップ ]  [ リスト ]   │  ← ビュー切替
├──────────────────────┤
│ (マップビュー)            │
│ 凡例: ●作った ○作りたい 霞未踏│
│ [島グリッド:                │
│  作った/作れる/未踏 で色分け] │
│ ┌─ 自作 ─────────┐    │
│ │ [my dish 1][my dish 2]│ │
│ └──────────────────┘ │
├──────────────────────┤
│ (リストビュー)             │
│ 📊 月別レパートリー         │
│ [bar chart]              │
│ 作った料理一覧              │
│ 6/19 油淋鶏 😋            │
│ 6/17 親子丼 🙂 [自作]      │
│ 6/15 カレー 😋 作ってみたい │
├──────────────────────┤
│ [食材][ホーム][レパートリー] │
└──────────────────────┘
```

## Interaction Flow

1. レパートリータブを開く → 達成ヘッダー + マップビュー（初期状態）が表示される
2. 「リスト」タップ → 料理帳リストビューに切り替わる（`cookbook_view_toggle`発火）
3. マップのノードまたはリスト行をタップ → 料理詳細画面へ遷移

## Scope

### In scope

- `app/(tabs)/repertoire.tsx`
- `components/native/RepertoireTab.tsx`
- `components/native/AchievementHeader.tsx`
- `components/native/IslandMapView.tsx`（react-native-svg移植）
- `components/native/CookbookListView.tsx`（新規、月別チャート含む）
- ビュー切替コントロール

### Out of scope

- 自作料理の作成フォーム（spec-027。本specは既存のCustomDishデータを表示する側のみ）
- 料理詳細の編集モード起動（spec-027）
- 静的座標ベースの島レイアウト刷新（将来実装、v1はグリッド表示のまま）

## Done When

- [ ] レパートリータブを開くと達成ヘッダーが正しい品数・日数・進捗で表示される
- [ ] マップ/リストのビュー切替が動作する
- [ ] マップビューでノードが作った/作れる/未踏の3状態で色分け表示される
- [ ] 自作料理が「自作」エリアまたは対応ベース料理付近に表示される
- [ ] リストビューに月別バーチャートと全記録一覧が表示される
- [ ] リストビューの空状態メッセージが正しく表示される
- [ ] ノード/リスト行タップで料理詳細画面へ遷移する
- [ ] `cookbook_view_toggle` イベントが発火する
- [ ] `open_level_up` / `open_map` イベントが発火する（タブ表示時）
- [ ] `npm run lint` / TypeScriptビルドが通る

## Design References

`mocks/design-tokens.md` を参照。web版 `components/mvp/LevelUpScreen.tsx`（達成ヘッダー・月別チャート・一覧）と `components/mvp/IslandMap.tsx`（マップ表示・ノード状態ロジック）を統合して踏襲する（M6: static）。

## Technical Notes (for Codex)

### 参照する既存ファイル（移植元）

- `components/mvp/LevelUpScreen.tsx` — 達成ヘッダー・月別チャート・リストの移植元
- `components/mvp/IslandMap.tsx` — マップ表示・ノード状態分類ロジックの移植元
- `lib/native/useUserState.ts`（spec-022で作成済み前提）— `made_records`, `bookmarked`, `custom_dishes` を参照

### 新規作成ファイル

```
app/(tabs)/repertoire.tsx
components/native/RepertoireTab.tsx
components/native/AchievementHeader.tsx
components/native/IslandMapView.tsx
components/native/CookbookListView.tsx
```

react-native-svgを新規依存として `package.json` に追加する。

### マイルストーン・ノード状態ロジック（不変・web版と同一）

```ts
const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]

type NodeState = 'made' | 'bookmarked' | 'base' | 'unexplored'
function getNodeState(dishId: string): NodeState {
  if (madeSet.has(dishId)) return 'made'
  if (bookmarkedSet.has(dishId)) return 'bookmarked'
  if (selectedBaseSet.has(dishId)) return 'base'
  return 'unexplored'
}
```

自作料理（CustomDish）はdishesと別配列のため、マップ描画時は `dishes` のノード群とは独立した「自作」セクションとして描画し、`attached_base_dish_id` がある場合のみ該当ベース料理ノードの隣接位置に配置する。

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `components/native/AchievementHeader.tsx`（useUserStateのmade_records/milestone計算のみに依存）
- Set B: `components/native/CookbookListView.tsx`（useUserStateのmade_records/bookmarked/custom_dishesに依存）

Wave 2（並行可、Wave 1と並行してよい。react-native-svg導入が前提）:
- Set C: `components/native/IslandMapView.tsx`（react-native-svg依存、Set Aと独立して進行可）

Wave 3（順次・統合）:
- Set D: `components/native/RepertoireTab.tsx` + `app/(tabs)/repertoire.tsx`（Set A/B/Cを統合、ビュー切替を実装）

## New analytics events

新規イベント: `cookbook_view_toggle`（`tab: 'map' | 'list'`）。既存の `open_level_up`, `open_map` も引き続き使用する。
