# Spec 028: Notifications & Settings

Approved: 2026-07-03

## What We're Building

2本のローカル通知（朝「今日のとなりごはん」、夜「作りましたか？」）の実スケジューリングとディープリンク処理、通知経由の直接記録アクション、および設定画面（通知時刻編集・ベース料理編集・about）を実装する。サーバーは使わず、すべて `expo-notifications` による端末ローカル通知で完結する（ADR-007）。

## User Story

毎日アプリを使い続けたいユーザーとして、
朝は今日のおすすめを、夜は記録を忘れていないかを知らせてほしい。
そうすれば、開く理由を毎日思い出さなくてもアプリが続く。

## Feature Overview

### Feature A: 朝の通知「今日のとなりごはん」

- `NotificationPrefs.morning_enabled` がtrueの場合、`morning_time`（"HH:mm"）に毎日繰り返しスケジュールする
- 通知本文: 「今日のとなりごはん」+ サブテキスト（例: 今日のピック料理名を含めてよいが、日付シードのピックは通知スケジュール登録時点では未確定日もあるため、汎用文言「今日のおすすめができました」でも可。実装時にどちらでも構わない——通知登録タイミングの制約による軽微な文言判断であり、プロダクト上の優先度は低い）
- タップ → アプリを開き、ホームタブへ遷移（today's pickが表示された状態。spec-024のホーム画面は起動時に常に今日のピックを表示するため、追加のルーティングパラメータは不要）
- `notif_morning_open` イベントを、この通知経由でアプリが開かれたときに発火

### Feature B: 夜の通知「作りましたか？」

- **発火条件**: その日ユーザーがカードを閲覧または保存した場合のみ発火する。web版の `last_active_date` 相当のロジックに加え、「その日カードを見た/保存した」ことを判定する新しいトラッキングが必要——`open_dish_card` または `bookmark` イベントが発生した日を記録する（AsyncStorageに `last_card_view_date: string` を追加保存し、料理詳細を開いた時点で更新する）
- `evening_enabled` がtrueかつ `last_card_view_date === 今日の日付` の場合のみ、`evening_time` にその日の通知をスケジュールする（前日にスケジュール済みの通知はキャンセルし、条件を満たした日だけ都度スケジュールし直す方式でよい）
- 通知本文: 「作りましたか？」
- **アクションボタン**（通知の直接アクション、iOS/Android双方でnotification categoryとして定義）:「作った」ボタン → アプリを開かずに直接 `recordMade` を実行（`rating: 'ok'`、`dish_id` はその日閲覧/保存した最後の料理）。バックグラウンドタスクとしてAsyncStorage書き込みを行う。`notif_evening_record` イベントを発火
- **通知本体タップ**（アクションボタン以外の部分をタップ）→ アプリを開き、記録モーダルをステップ2（感想選択）から開始する。対象料理はその日閲覧/保存した最後の料理として自動確定済み。`notif_evening_open` イベントを発火

### Feature C: 通知権限とスケジューリング基盤

- `expo-notifications` の権限リクエストは、オンボーディング（spec-023）と設定画面の両方から呼び出せる共通関数として実装する（`lib/native/notifications.ts`）
- 権限が拒否された場合、`NotificationPrefs` のトグルはON表示のままにせず、UIにその旨を表示する（例: 「通知が許可されていません。端末の設定から許可してください」）
- アプリ起動時（`app/_layout.tsx`）、`notification_prefs` に応じて朝の通知の再スケジュールを行う（時刻変更や端末再起動後もスケジュールが有効であるようにする）

### Feature D: 設定画面

- 通知時刻編集: 朝・夜それぞれのON/OFFトグルと時刻ピッカー（オンボーディングの通知オプトイン画面と同じUIコンポーネントを再利用してよい）
- ベース料理編集: 現在選択中のベース料理一覧を表示し、追加/削除できる（spec-023のベース料理選択グリッドを再利用し、初期選択状態を現在の `selected_dishes` にする）
- about: アプリバージョン、開発者情報等の簡易表示（実データはプレースホルダーで可。バージョン番号は `app.json` の `expo.version` を参照して表示する）
- データエクスポート機能はv1では実装しない（ADR-007明記）

## Screen Layout

### 設定画面

```
┌──────────────────────┐
│ ← 戻る    設定           │
│                        │
│ 通知                    │
│ 朝の通知    [ON/OFF]     │
│  時刻: 07:00             │
│ 夜の通知    [ON/OFF]     │
│  時刻: 20:00             │
│                        │
│ ベース料理               │
│ [作れる料理を編集 →]      │
│                        │
│ このアプリについて         │
│ バージョン 1.0.0          │
└──────────────────────┘
```

### 夜の通知（OS通知トレイ）

```
┌──────────────────────┐
│ となりごはん             │
│ 作りましたか？           │
│           [作った]       │  ← アクションボタン
└──────────────────────┘
```

## Interaction Flow

1. オンボーディングまたは設定画面で通知をON、時刻を設定
2. 毎朝設定時刻に「今日のとなりごはん」通知が届く → タップでホームタブが開く
3. その日カードを見る/保存する → `last_card_view_date` が今日に更新される
4. 夜の設定時刻に「作りましたか？」通知が届く（カードを見ていない日は届かない）
5a. アクションボタン「作った」をタップ → アプリを開かず直接記録される
5b. 通知本体をタップ → アプリが開き、記録モーダルのステップ2（感想選択）から始まる
6. 設定画面から通知時刻やベース料理をいつでも編集できる

## Scope

### In scope

- `lib/native/notifications.ts`（権限リクエスト、朝の通知スケジューリング、夜の通知の条件付きスケジューリング、アクションカテゴリ定義）
- `last_card_view_date` の保存ロジック（料理詳細画面の閲覧・保存時に更新。既存の `open_dish_card`/`bookmark` イベント発火箇所に統合）
- 通知ディープリンクハンドラ（`app/_layout.tsx` での通知タップ/アクション処理）
- `app/settings.tsx`
- `components/native/SettingsScreen.tsx`
- `components/native/NotificationTimeEditor.tsx`（オンボーディングと共用可能な形で分離）

### Out of scope

- データエクスポート機能（ADR-007により対象外）
- 通知の詳細カスタマイズ（音・バイブ等の個別設定はv1では扱わない。OSデフォルト挙動に従う）
- サーバープッシュ通知（ローカル通知のみ、ADR-007）

## Done When

- [ ] 朝の通知が設定時刻に毎日届く
- [ ] 朝の通知タップでアプリが開き、ホームタブに今日のピックが表示される
- [ ] その日カードを見ていない日は夜の通知が届かない
- [ ] その日カードを見た日は夜の通知が設定時刻に届く
- [ ] 夜の通知のアクションボタン「作った」でアプリを開かず記録される
- [ ] 夜の通知本体タップでアプリが開き、記録モーダルがステップ2から始まる
- [ ] 設定画面で通知時刻のON/OFF・時刻変更ができ、即座にスケジュールへ反映される
- [ ] 設定画面でベース料理の追加/削除ができる
- [ ] about欄にアプリバージョンが表示される
- [ ] 通知権限が拒否された場合、UIにその旨が表示される
- [ ] `notif_morning_open` / `notif_evening_record` / `notif_evening_open` イベントが発火する
- [ ] `npm run lint` / TypeScriptビルドが通る

## Design References

`mocks/design-tokens.md` を参照。画像なし（M6: interactive — 通知の実発火・アクションボタン・ディープリンクは実機/シミュレータでの実操作確認が必須。スクリーンショットだけでは検証できない）。

## Technical Notes (for Codex)

### 参照する既存ファイル（関連ロジック）

- `lib/mvp/useUserState.ts` — `updateLastActiveDate` と同様のパターンで `last_card_view_date` を追加
- `components/mvp/DishDetailScreen.tsx` — `open_dish_card` / `bookmark` イベント発火箇所（この箇所に `last_card_view_date` 更新を追加する）
- spec-023の通知オプトイン画面 — 権限リクエスト・NotificationPrefs保存ロジックを共有する

### 新規作成ファイル

```
lib/native/notifications.ts
app/settings.tsx
components/native/SettingsScreen.tsx
components/native/NotificationTimeEditor.tsx
```

`expo-notifications` を新規依存として `package.json` に追加する。

### 通知スケジューリング疑似コード

```ts
// 朝: 毎日繰り返し（時刻変更時は既存スケジュールをキャンセルして再登録）
async function scheduleMorningNotification(time: string) {
  await Notifications.cancelScheduledNotificationAsync(MORNING_NOTIFICATION_ID)
  if (!prefs.morning_enabled) return
  const [hour, minute] = time.split(':').map(Number)
  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_NOTIFICATION_ID,
    content: { title: 'となりごはん', body: '今日のとなりごはん' },
    trigger: { hour, minute, repeats: true },
  })
}

// 夜: last_card_view_date === today のときだけ、その日限りのスケジュールを都度登録
async function scheduleEveningNotificationIfEligible(prefs: NotificationPrefs, lastCardViewDate: string, todayISO: string) {
  await Notifications.cancelScheduledNotificationAsync(EVENING_NOTIFICATION_ID)
  if (!prefs.evening_enabled || lastCardViewDate !== todayISO) return
  const [hour, minute] = prefs.evening_time.split(':').map(Number)
  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_NOTIFICATION_ID,
    content: {
      title: 'となりごはん',
      body: '作りましたか？',
      categoryIdentifier: 'EVENING_RECORD',
    },
    trigger: { hour, minute, repeats: false },
  })
}
```

呼び出しタイミング: `scheduleEveningNotificationIfEligible` は `last_card_view_date` が更新されるたび（＝料理詳細を開く/保存するたび）に再評価する。

### 通知アクションカテゴリ定義

```ts
await Notifications.setNotificationCategoryAsync('EVENING_RECORD', [
  {
    identifier: 'RECORD_MADE',
    buttonTitle: '作った',
    options: { opensAppToForeground: false },
  },
])
```

### ディープリンクハンドラ（app/_layout.tsx内）

```ts
Notifications.addNotificationResponseReceivedListener((response) => {
  const actionId = response.actionIdentifier
  if (actionId === 'RECORD_MADE') {
    // バックグラウンドでrecordMadeを実行、notif_evening_recordを発火
  } else if (response.notification.request.content.categoryIdentifier === 'EVENING_RECORD') {
    // アプリを開き記録モーダルをstep 2から起動、notif_evening_openを発火
  } else {
    // 朝の通知: ホームタブへ遷移、notif_morning_openを発火
  }
})
```

### Parallel Group Declaration

Wave 1（並行可）:
- Set A: `lib/native/notifications.ts`（スケジューリング関数群、useUserStateのnotification_prefsに依存するが独立実装可能）
- Set B: `last_card_view_date` の保存ロジック追加（`lib/native/useUserState.ts` への追加、既存の料理詳細画面のイベント発火箇所への統合）

Wave 2（並行可、Wave 1完了後）:
- Set C: `components/native/NotificationTimeEditor.tsx`（Set Aの型に依存）
- Set D: `components/native/SettingsScreen.tsx` のベース料理編集・about部分（Set Bとは独立）

Wave 3（順次・統合）:
- Set E: `app/settings.tsx`（Set C/Dを統合）
- Set F: `app/_layout.tsx` のディープリンクハンドラ追加（Set Aに依存、通知タップ時のルーティングとrecordMade呼び出しを統合）

## New analytics events

新規イベント: `notif_morning_open`, `notif_evening_record`, `notif_evening_open`。
