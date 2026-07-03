# Spec 024: Home Tab

Approved: 2026-07-03

## What We're Building

ホームタブ本体。今日のとなりごはん（日付シード固定ピック）、再訪ナッジバー、その他のカード、FABからの記録フローを実装する。web版 `HomeScreen.tsx` の移植だが、食材チップフィルタは食材タブ（spec-025）に移すため、ホームからは除外する。記録モーダル（3ステップ + マイルストーン祝福）はFABから開く導線としてこのspecに含める——ホーム画面と記録フローは1つの操作単位として扱う方がCodexにとって実装境界が明確なため、本specでまとめて扱う判断とする。

## User Story

アプリを開いたユーザーとして、
今日のおすすめ料理をすぐに見て、作ったらワンタップで記録したい。
そうすれば、迷わず今日の一品にたどり着き、記録の手間を感じずにレパートリーを増やせる。

## Feature Overview

### Feature A: 今日のとなりごはん

- `todaysPick(selectedBaseDishIds, mode, dateISO)` ロジックをそのまま移植（日付シードで同日同結果、API/AI不使用）
- 難易度タブ（かんたん / 少し広げる / しっかり作る）で `mode` を切替
- 起点料理名を表示し「他の起点にする」ボタンでランダムに別のベース料理へ切替可能

### Feature B: 再訪ナッジバー

- `state.last_active_date` が今日より前の場合のみ表示
- 前日の `todaysPick` 結果を計算し「昨日の{dish_name}、作りましたか？」を表示
- 「作った!」→ `recordMade` を rating: 'ok' で即記録、`nudge_record` イベント発火、ナッジを閉じる
- 「今度ね」→ `nudge_dismiss` イベント発火、その日はナッジを再表示しない

### Feature C: その他のカード

- featuredと同じ起点料理・全難易度（`tab`フィルタなし）・featured自身を除く・proximity降順で最大3件
- 横スクロールのコンパクトカードとして表示

### Feature D: FAB + 記録モーダル（3ステップ）

- FAB（右下、丸型、「+」アイコン + 「作った」ラベル、bottom navの上に重ねる）
- タップで記録モーダルを開く（新規ページ遷移ではなくモーダル/シートとして表示）
- **ステップ1（料理選択）**: 直近のおすすめ（今日+昨日のピック）と保存済み料理を一覧表示。タップで選択して次へ。「他の料理を探す」で全料理からの検索に切替
- **ステップ2（感想）**: 😋最高 / 🙂まあまあ / 🤔微妙 の3ボタン。タップで次へ（写真機能はv1では実装しない——web版にあった `photo_url` フィールドはnative v1でも型としては残すが、native側の撮影UIは対象外。ADR-007「写真なし」の方針に従う）
- **ステップ3（完了）**: 「🎉 {dish_name}を記録しました！」+「レパートリー {N}品」+「累計 {M}日目」+ 近いマイルストーンなら「あと{X}品で{milestone}品！」+「ホームに戻る」ボタン
- マイルストーン: `[5, 10, 15, 20, 30, 50, 75, 100]`

### Feature E: 通知ディープリンク受け口（本specでは受け口のみ）

- ホーム画面は起動パラメータ/ディープリンクで「今日のピックを表示した状態」に直接遷移できる必要がある。実際の通知スケジューリングと発火はspec-028で実装するが、ホーム画面側は `expo-router` のディープリンクで `home` ルートに来たときに常に今日のピックを表示するデフォルト挙動を持てば十分（追加のクエリパラメータ処理は不要）

## Screen Layout

```
┌──────────────────────┐
│ ☰   となりごはん   🔔    │  ← ヘッダー
├──────────────────────┤
│ [再訪ナッジ: 昨日の〇〇、  │  ← last_active_date < today のみ
│  作りましたか？][作った!][今度ね]│
│                        │
│ おはようございます       │
│ 今日のおすすめはこちら    │
│                        │
│ [かんたん][少し広げる][しっかり]│ ← 難易度タブ
│                        │
│ この前作った『〇〇』から広げる [他の起点にする] │
│ ┌──────────────────┐ │
│ │   Featured Card     │ │
│ └──────────────────┘ │
│                        │
│ 他にもこんな広げ方があります │
│ [card][card][card]  → 横スクロール │
│                        │
│ [食材][ホーム][レパートリー] │ ← bottom tab bar
│                    (FAB)│ ← 右下フローティング
└──────────────────────┘
```

### 記録モーダル（3ステップ）

```
Step 1:            Step 2:           Step 3:
┌──────────┐      ┌──────────┐      ┌──────────┐
│ 何を作り  │      │ どうでし  │      │    🎉     │
│ ましたか？│      │ たか？   │      │ 油淋鶏を  │
│ ○ 油淋鶏  │      │          │      │ 記録！    │
│ ○ 親子丼  │      │ 😋 🙂 🤔  │      │ レパート  │
│ 🔍他の料理 │      │          │      │ リー13品  │
└──────────┘      └──────────┘      │ 累計29日  │
                                     │ あと2品！ │
                                     │[ホームに戻る]│
                                     └──────────┘
```

## Interaction Flow

1. ホームタブを開く → 今日のピックが即表示される
2. 再訪の場合 → ナッジバーが上部に表示され、ワンタップで前日分を記録できる
3. 難易度タブを切り替える → featured/other cardsが再計算される
4. 「他の起点にする」→ ランダムな別ベース料理に切替
5. 他のカードを横スクロールして眺める
6. FABをタップ → 料理選択 → 感想選択 → 完了画面（マイルストーン確認）→ ホームに戻る

## Scope

### In scope

- `app/(tabs)/home.tsx`
- `components/native/HomeScreen.tsx`
- `components/native/ReturnNudge.tsx`
- `components/native/RecordingModal.tsx`（3ステップ、マイルストーン計算含む）
- `components/native/FeaturedCard.tsx` / `CompactCard.tsx`（`NearbyDishCard.tsx`のRN移植、2コンポーネントに分割継続）
- FABコンポーネント（`components/native/Fab.tsx` として独立させてよい）

### Out of scope

- 食材チップフィルタ（spec-025で食材タブに実装。ホーム側のフィルタ適用ロジックはspec-025完了後に統合）
- 写真撮影UI（v1スコープ外、ADR-007）
- 通知スケジューリング本体（spec-028）
- 設定画面（spec-028）

## Done When

- [ ] ホームを開くと今日のピックが表示される（日付シードで同日同結果）
- [ ] 難易度タブ切替でfeatured/other cardsが更新される
- [ ] 再訪時のみナッジバーが表示され、「作った!」で即記録、「今度ね」で非表示になる
- [ ] other cardsが同一起点・全難易度・featured除く・最大3件で表示される
- [ ] 「他の起点にする」でベース料理がランダムに切り替わる
- [ ] FABタップで記録モーダルが開く
- [ ] 記録モーダルが3ステップ（選択→感想→完了）で完了する
- [ ] 完了画面にレパートリー品数・累計日数・マイルストーンが正しく表示される
- [ ] `nudge_record` / `nudge_dismiss` / `fab_record` / `show_recommendations` イベントが発火する
- [ ] `npm run lint` / TypeScriptビルドが通る

## Design References

`mocks/design-tokens.md` を参照。web版 `components/mvp/HomeScreen.tsx`, `components/mvp/RecordingModal.tsx`, `components/mvp/ReturnNudge.tsx`, `components/mvp/NearbyDishCard.tsx` のレイアウトを直接踏襲する（M6: static）。

## Technical Notes (for Codex)

### 参照する既存ファイル（移植元）

- `components/mvp/HomeScreen.tsx` — 画面全体の構成・ロジック源（食材フィルタ部分は移植対象外）
- `components/mvp/ReturnNudge.tsx` — ナッジバーの移植元
- `components/mvp/RecordingModal.tsx` — 3ステップモーダルの移植元
- `components/mvp/NearbyDishCard.tsx` — FeaturedCard/CompactCardの移植元
- `lib/mvp/todaysPick.ts` — 日付シードピックロジック（`lib/native/todaysPick.ts` として移植、ロジック不変）
- `lib/mvp/useSelectedBaseDishes.ts` — ベース料理選択状態
- `lib/native/useUserState.ts`（spec-022で作成済み前提）

### 新規作成ファイル

```
app/(tabs)/home.tsx
components/native/HomeScreen.tsx
components/native/ReturnNudge.tsx
components/native/RecordingModal.tsx
components/native/FeaturedCard.tsx
components/native/CompactCard.tsx
components/native/Fab.tsx
lib/native/todaysPick.ts
lib/native/useSelectedBaseDishes.ts
```

### マイルストーン計算（不変・web版と同一ロジック）

```ts
const repertoireCount = new Set(state.made_records.map(r => r.dish_id)).size
const cumulativeDays = new Set(state.made_records.map(r => r.made_at.slice(0, 10))).size
const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]
const nextMilestone = MILESTONES.find(m => m > repertoireCount) ?? 100
const remaining = nextMilestone - repertoireCount
```

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `lib/native/todaysPick.ts`（ロジック移植、他に依存しない）
- Set B: `lib/native/useSelectedBaseDishes.ts`（ロジック移植、他に依存しない）
- Set C: `components/native/FeaturedCard.tsx` + `components/native/CompactCard.tsx`（表示コンポーネント、単体で完成可）

Wave 2（並行可、Wave 1完了後）:
- Set D: `components/native/ReturnNudge.tsx`（Set A/Bに依存）
- Set E: `components/native/RecordingModal.tsx`（Set B・useUserStateに依存）
- Set F: `components/native/Fab.tsx`（依存最小、単体で完成可）

Wave 3（順次・統合）:
- Set G: `components/native/HomeScreen.tsx` + `app/(tabs)/home.tsx`（Wave 1・2の全コンポーネントを統合）

## New analytics events

新規イベントなし。既存の `show_recommendations`, `nudge_record`, `nudge_dismiss`, `fab_record`, `open_dish_card` を使用する。
