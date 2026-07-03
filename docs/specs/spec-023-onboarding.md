# Spec 023: Onboarding

Approved: 2026-07-03

## What We're Building

初回起動時の3画面フロー。Welcome → ベース料理選択（15皿・カテゴリ見出し付き3列グリッド）→ 通知オプトイン。web版の2×5グリッド（10皿）から15皿へ拡張するため、グリッドはカテゴリ見出しで区切った縦スクロール形式に変更する。

## User Story

初めてアプリを開いたユーザーとして、
自分が作れる料理を選び、通知を設定してから使い始めたい。
そうすれば、初回から自分に合ったおすすめと毎日のリマインドを受け取れる。

## Feature Overview

### Feature A: Welcome画面

- アプリのコアコピー「いつもの料理から、次の一品へ。」を表示
- 1つのCTAボタン「はじめる」→ ベース料理選択画面へ遷移
- スキップ不可（初回起動の最初の画面）

### Feature B: ベース料理選択（15皿グリッド）

- タイトル「作れる料理を選んでください」+ サブテキスト（web版を踏襲）
- 15皿をカテゴリ見出しで区切った縦スクロール・3列グリッドで表示
- カテゴリ分けは以下の3グループとする（既存10皿+新規5皿の合計15皿を、料理の系統で分類。この分類はADR-007に明記されておらず、実装上のUI整理として本specで決定する軽微な事項——プロダクト判断ではなく表示グルーピングの選択）:
  - **和食**: 肉じゃが, 親子丼, 生姜焼き, 豚汁, 野菜炒め
  - **洋食・中華**: カレー, チャーハン, オムライス, ハンバーグ, 麻婆豆腐
  - **麺類**: ナポリタン, ペペロンチーノ, 焼きそば, うどん, 唐揚げ ※唐揚げは麺類ではなく「揚げ物」系だが5×3の均等区分を優先し「その他」枠として麺類グループに含める。実装時によりわかりやすい第4カテゴリ（例: 揚げ物）に独立させても構わない——グルーピングの微調整は実装者判断でよい
- 各カードは絵文字 + 料理名（web版のDISH_EMOJIマップを拡張。新規5皿の絵文字は実装時に選定してよい）
- タップで選択トグル。選択済みは上部にピン留めチップとして表示（web版踏襲）
- 選択数カウント表示「{N}つ選択中」
- 1つ以上選択で「あなたのとなりごはんを探す」ボタンが有効化
- `select_base_dish` イベントを新規選択時に発火（既存イベント、変更なし）

### Feature C: 通知オプトイン画面

- タイトル「今日のおすすめをお知らせします」（文言は実装時に調整可）
- 朝の通知トグル + 時刻ピッカー（デフォルト 7:00）
- 夜の通知トグル + 時刻ピッカー（デフォルト 20:00）
- 両方独立してON/OFF可能。デフォルトは両方ON
- expo-notificationsのOS権限リクエストは、このトグルを最初にONにした操作（またはCTAタップ時に一括）で発火させる
- 「スキップ」導線あり——スキップ時は `notification_prefs.morning_enabled = false, evening_enabled = false` として保存し、後で設定画面から有効化できる
- CTA「はじめる」→ オンボーディング完了、ホームタブへ遷移

## Screen Layout

### Welcome

```
┌──────────────────┐
│                    │
│   となりごはん       │
│                    │
│ いつもの料理から、   │
│ 次の一品へ。         │
│                    │
│  [   はじめる   ]   │
└──────────────────┘
```

### ベース料理選択

```
┌──────────────────┐
│ 作れる料理を選んで   │
│ ください             │
│ よく作る料理を選ぶと… │
│ [選択済みチップ群]    │
│                    │
│ 和食                │
│ [🥘][🐔][🐷]         │
│ [🍲][🥬]             │
│                    │
│ 洋食・中華            │
│ [🍛][🍳][🍳]         │
│ [🍔][🌶️]             │
│                    │
│ 麺類                │
│ [🍝][🧄][🍜]         │
│ [🍥][🍗]             │
│                    │
│    3つ選択中         │
│ [あなたのとなりごはんを探す] │
└──────────────────┘
```

### 通知オプトイン

```
┌──────────────────┐
│ 今日のおすすめを     │
│ お知らせします       │
│                    │
│ 朝の通知    [ON/OFF] │
│  時刻: 07:00         │
│                    │
│ 夜の通知    [ON/OFF] │
│  時刻: 20:00         │
│                    │
│  [   はじめる   ]    │
│      スキップ         │
└──────────────────┘
```

## Interaction Flow

1. 初回起動 → Welcome画面表示
2. 「はじめる」タップ → ベース料理選択画面へ
3. カテゴリごとにスクロールしながら料理をタップ選択（複数選択可）
4. 1つ以上選択後「あなたのとなりごはんを探す」タップ → 通知オプトイン画面へ
5. 朝・夜の通知トグルと時刻を確認/調整（デフォルトのまま進んでもよい）
6. 「はじめる」タップ → OS通知権限リクエスト（トグルONの場合）→ 権限結果に関わらずホームタブへ遷移
7. 「スキップ」タップ → 通知OFFのまま直接ホームタブへ遷移

## Scope

### In scope

- `app/(onboarding)/welcome.tsx`
- `app/(onboarding)/base-dish-select.tsx`
- `app/(onboarding)/notification-opt-in.tsx`
- 15皿分のカテゴリ分けデータ（コンポーネント内定数として定義、または `lib/native/dishCategories.ts` として分離）
- `selected_dishes` のuseUserState保存
- `notification_prefs` のuseUserState保存（実際のスケジューリングはspec-028。ここでは値の保存とOS権限リクエストの呼び出しのみ）
- オンボーディング完了判定（初回起動フラグ。`AsyncStorage` に `onboarding_completed: boolean` を追加保存し、`app/_layout.tsx` が起動時にこれを見て初回はonboarding groupへ、以降は`(tabs)`へ遷移させる）

### Out of scope

- 実際の通知スケジューリング処理（spec-028で実装。ここではプリファレンスの保存とOS権限確認のみ）
- 設定画面からの再編集（spec-028）
- data v4到着後の15皿データ本体（このspecは `data/v3.ts` 拡張後の15皿を前提とするが、データ内容自体はdata v4パイプラインの成果物。data v4未到着時は現行10皿 + 仮の5皿プレースホルダーエントリで進めてよい）

## Done When

- [ ] Welcome画面が表示され「はじめる」で次画面へ進む
- [ ] ベース料理選択画面に15皿がカテゴリ見出し付きで表示される（data v4未到着時は仮データでも可）
- [ ] 料理タップで選択トグルでき、選択チップが上部に表示される
- [ ] 1つ以上選択しないと次へ進めない
- [ ] 通知オプトイン画面で朝・夜それぞれのトグルと時刻設定ができる
- [ ] 「はじめる」でOS通知権限がリクエストされ、`notification_prefs` が保存される
- [ ] 「スキップ」で通知OFFのまま完了できる
- [ ] オンボーディング完了後、次回起動時はオンボーディングをスキップして直接タブ画面が開く
- [ ] `select_base_dish` イベントが発火する
- [ ] `npm run lint` / TypeScriptビルドが通る

## Design References

`mocks/design-tokens.md` を参照。画像なし。web版 `components/mvp/BaseDishSelector.tsx` のレイアウト・チップ表示ロジックを踏襲し、グリッドを2列→3列・カテゴリ見出し付きに変更する（M6: static）。

## Technical Notes (for Codex)

### 参照する既存ファイル（移植元）

- `components/mvp/BaseDishSelector.tsx` — 選択トグル・チップピン留め・進むボタンのロジック源（DISH_EMOJIマップも移植・拡張対象）
- `lib/mvp/analytics.ts` — `select_base_dish` イベント定義
- `lib/native/useUserState.ts`（spec-022で作成済み前提）
- `lib/native/theme.ts`（spec-022で作成済み前提）

### 新規作成ファイル

```
app/(onboarding)/welcome.tsx
app/(onboarding)/base-dish-select.tsx
app/(onboarding)/notification-opt-in.tsx
lib/native/dishCategories.ts
```

### 依存関係

spec-022（Expo基盤・useUserState・theme）完了後に着手する。

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `app/(onboarding)/welcome.tsx`（他画面に依存しない静的画面）
- Set B: `lib/native/dishCategories.ts`（データ定義のみ）

Wave 2（順次、Set B完了後）:
- Set C: `app/(onboarding)/base-dish-select.tsx`（Set Bのカテゴリデータに依存）

Wave 3（並行可、Wave 2完了後）:
- Set D: `app/(onboarding)/notification-opt-in.tsx`
- Set E: `app/_layout.tsx` のオンボーディング完了判定ロジック追加（spec-022で作成済みの`_layout.tsx`を拡張）

## New analytics events

新規イベントなし。既存の `select_base_dish` を使用する。
