# Blueprint: Tonari Gohan Native v1（Expo移植）

作成: 2026-07-03
位置づけ: web v2.8を土台にしたネイティブv1の全体設計図。スコープの正本は `docs/decisions/007-native-v1-scope.md`（ADR-007）。本ドキュメントはそこからの派生であり、スコープを再定義しない。

## 1. ビジョン

となりごはんは、すでに作れる料理を起点に「少し変えれば作れる次の一品」を提案し、作った記録を積み重ねることでレパートリーを育てるアプリである。web版で検証したコアループ（選ぶ→見る→保存する→作る→再訪する）はそのまま持ち込み、ネイティブ化で得られる最大の武器はローカル通知——「今日はこれ」を毎朝届け、「作りましたか」を毎晩尋ねる、サーバー不要の2本の通知である。

v1は機能を増やすフェーズではない。島マップとレベルアップ画面を「レパートリー」という1つのタブに統合し、料理カードを自分の言葉で書き換えられる個人の料理帳（cookbook）に育てる。写真もログインもクラウド同期もない。育てる感覚を、端末の中だけで完結させる。

## 2. 価値の核（5層）

| 層 | 内容 |
|---|---|
| 機能 | 作った料理を記録し、近い料理をおすすめする |
| 行動 | 今日ちょっと別の料理にチャレンジする |
| 価値 | レパートリーが無理なく増える |
| 感情 | 探さなくても出てくる・これなら作れそう |
| 記憶 | レシピを探すんじゃなくて、自分のレパートリーを育てるアプリ |

ネイティブ移植で追加する4要素（2本の通知・個人の料理帳・自作料理・レパートリータブ統合）は、すべてこの5層のどこかに直接効く。通知は「行動」（毎日戻ってくる理由）を、料理帳編集と自作料理は「記憶」（自分のものになっていく感覚）を強化する。新機能の議論が出たら、まずこの5層のどこに効くかを確認してから採否を判断する。

## 3. 画面マップ

```
App
├─ Onboarding（初回のみ / スキップ不可の3画面のうち最後だけ任意スキップ可）
│  ├─ Welcome
│  ├─ ベース料理選択（15皿・カテゴリ見出し付き縦スクロールグリッド・3列）
│  └─ 通知オプトイン（朝・夜の時刻設定、両方ともスキップ可）
│
├─ Tabs（3タブ）
│  ├─ 食材（Ingredients）
│  │  └─ 食材チップフィルタ + 「今すぐ作れる」結果一覧
│  │
│  ├─ ホーム（Home）
│  │  ├─ 今日のとなりごはん（日付シード固定ピック）
│  │  ├─ 再訪ナッジバー（前回訪問が前日以前のときのみ表示）
│  │  ├─ その他のカード（同じ起点料理・全難易度）
│  │  └─ FAB「作った」→ 記録モーダルへ
│  │
│  └─ レパートリー（Repertoire）
│     ├─ 達成ヘッダー（作った料理数 + 次のマイルストーンまでの進捗バー）
│     ├─ ビュー切替（マップ ⇄ 料理帳リスト）
│     ├─ マップビュー（島SVG。作った=領土 / 作れる=足場 / 未踏=霞み。自作料理は専用「自作」エリア）
│     └─ 料理帳リストビュー（作った・保存済み・自作の全料理。タップで詳細へ）
│
├─ オーバーレイ（モーダル / スタック画面）
│  ├─ 料理詳細画面（通常表示）
│  ├─ 料理詳細・編集モード（食材/手順/メモを上書き。正本データは不変）
│  ├─ 自作料理作成フォーム（名前・食材・手順 → 料理帳 + 島マップへ）
│  ├─ 記録モーダル（3ステップ：料理選択 → 感想 → 完了 + マイルストーン祝福）
│  └─ 設定画面（通知時刻編集、ベース料理編集、about）
│
└─ 通知（expo-notifications・サーバーなし・端末ローカルのみ）
   ├─ 朝「今日のとなりごはん」（ユーザー設定時刻）→ ホームタブ（今日のピック表示状態）へディープリンク
   └─ 夜「作りましたか？」（その日カードを見た/保存した日のみ発火）
      ├─ アクションボタンタップ → アプリを開かず直接「作った」記録（rating: ok）
      └─ 通知本体タップ → 記録モーダルをステップ2から開く（対象料理は自動確定）
```

## 4. データモデル

既存の `types/dish.ts` を土台に、太字の3型を新規追加する。フィールド名は既存の命名規則（snake_case、ISO日付文字列、`dish_id` 参照）を踏襲する。

### Dish（既存・不変）

```
id: string
name: string
photo_url?: string
variations: Variation[]
```

写真は使わない（絵文字/デザイントークンで代替）。`photo_url` は既存互換のため残すが native v1 では未使用。

### NearbyRelation（既存・不変）

```
source: string        // 起点となる dish_id
target: string         // 提案先の dish_id
proximity: number
tab: 'easy' | 'stretch' | 'full'
description_line1: string
description_line2: string
new_ingredients: string[]
rough_steps?: string[]
cooking_time_minutes?: number
```

正本データ（data v4）は不変。編集はすべて DishOverride 層で行う。

### UserState（既存拡張なし・確認用）

```
selected_dishes: string[]
bookmarked: string[]
made_records: MadeRecord[]
promoted_variations: string[]
available_ingredients: string[]
last_active_date: string
```

native v1では新規フィールドを追加しない。追加の状態（上書き・自作料理・通知設定）は下記3型として独立のAsyncStorageキーに分離する（UserStateを肥大化させない）。

### **DishOverride**（新規）

ユーザーが料理詳細の編集モードで保存する上書き情報。dish_idをキーにしたレコードとしてAsyncStorageに保存する（`dish_overrides: Record<string, DishOverride>`）。

```
dish_id: string
ingredients_override?: string[]
steps_override?: string[]
memo?: string
updated_at: string    // ISO日時
```

正本の `NearbyRelation.new_ingredients` / `rough_steps` は変更しない。表示時に override があれば override を優先してマージする。

### **CustomDish**（新規）

ユーザーが自作料理作成フォームから追加する料理。`custom_dishes: CustomDish[]` としてAsyncStorageに保存する。

```
id: string              // 生成ID（例: `custom-${timestamp}`）
name: string
ingredients: string[]
steps: string[]
attached_base_dish_id?: string   // 指定時: そのベース料理の島クラスタ付近に配置
created_at: string      // ISO日時
```

`attached_base_dish_id` が未指定の場合、島マップの固定「自作」エリアに配置する（近さグラフには接続しない）。料理帳リストと島マップの両方に表示される。作った記録・保存もdish_id相当のキーとしてCustomDish.idを使う（MadeRecord.dish_idはDish.idまたはCustomDish.idのいずれかを指しうる、と定義を広げる）。

### **NotificationPrefs**（新規）

`notification_prefs` としてAsyncStorageに単一オブジェクトで保存する。

```
morning_enabled: boolean
morning_time: string      // "HH:mm" 24時間形式
evening_enabled: boolean
evening_time: string      // "HH:mm" 24時間形式
```

オンボーディングの通知オプトイン画面と設定画面の両方から読み書きする単一の正本。

*スキーマ詳細について: DishOverride / CustomDish / NotificationPrefs の3型はADR-007に逐語的な定義がなく、既存の命名規則に沿って本ドキュメントでフィールドレベルの詳細を埋めた。プロダクト判断ではなく実装可能にするための最小限のスキーマ補完であることを明記する。*

## 5. 技術スタック

Expo（React Native、SDK 55+、New Architecture）、expo-router、TypeScript。iOS・Androidを単一コードベースから、EASクラウドビルドで配布する（開発機がWindowsでMacを持たないため、Mac不要のiOSビルド経路はEASのみ）。

判断根拠:
- スコープ・機能決定: [`docs/decisions/007-native-v1-scope.md`](decisions/007-native-v1-scope.md)（ADR-007）
- 技術選定（Expo vs Flutter vs dual-native）: [`../docs/decisions/2026-07-03-tonari-native-expo.md`](../../docs/decisions/2026-07-03-tonari-native-expo.md)（メインリポジトリADR）

## 6. デザインシステム

トークン定義: [`mocks/design-tokens.md`](../mocks/design-tokens.md)（色・角丸・タイポグラフィ・ボタン様式・ボトムナブ）。

RN移植の方針: CSS変数はRNに存在しないため、`lib/native/theme.ts` にトークン名をそのまま引き継いだプレーンなJSオブジェクト（例: `theme.colors.accent`, `theme.radius.card`）を1つ定義し、各コンポーネントは `StyleSheet.create` にこのオブジェクトを渡して参照する。色・角丸・余白の値は design-tokens.md の値をそのまま数値化する（`rem` はデバイスのbase font sizeに対する相対値をやめ、固定px値に変換する）。新しいスタイリングライブラリは追加しない（NativeWind等の導入判断は本ドキュメントのスコープ外・v1では不要）。

## 7. デリバリーウェーブ

メインリポジトリのマイルストーン表（[`../docs/specs/tonari-reboot-plan-2026-07.md`](../../docs/specs/tonari-reboot-plan-2026-07.md)）のM3（実装スプリント、院試終了後〜9/15）にWave 1〜4が対応し、Wave 5はM5（10月中旬公開）の直前作業にあたる。

| Wave | 内容 | 対応spec | 対応goal |
|---|---|---|---|
| Wave 1 | Expoプロジェクト基盤・3タブナビゲーション・テーマ・ストレージ層 | spec-022 | goal-024 |
| Wave 2 | オンボーディング・ホーム・食材タブ | spec-023, spec-024, spec-025 | goal-025 |
| Wave 3 | レパートリータブ（達成ヘッダー・マップ・料理帳リスト） | spec-026 | goal-026 |
| Wave 4 | 料理帳編集・自作料理・通知・設定 | spec-027, spec-028 | goal-027 |
| Wave 5 | 仕上げ・ストア素材・クローズドテスト提出 | なし（タスク列挙） | goal-028 |

## 8. Codex向けアーキテクチャ方針

フォルダ構成案（expo-router file-based routing前提）:

```
app/
├─ (onboarding)/
│  ├─ welcome.tsx
│  ├─ base-dish-select.tsx
│  └─ notification-opt-in.tsx
├─ (tabs)/
│  ├─ _layout.tsx           // 3タブのbottom tab navigator定義
│  ├─ ingredients.tsx
│  ├─ home.tsx
│  └─ repertoire.tsx
├─ dish/[id].tsx             // 料理詳細（通常表示 + 編集モード切替）
├─ custom-dish/new.tsx       // 自作料理作成フォーム
├─ settings.tsx
└─ _layout.tsx                // ルートレイアウト、通知ディープリンクのハンドリング

components/native/
├─ IngredientChipFilter.tsx   // components/mvp/IngredientChipFilter.tsx の移植
├─ ReturnNudge.tsx            // components/mvp/ReturnNudge.tsx の移植
├─ RecordingModal.tsx         // components/mvp/RecordingModal.tsx の移植
├─ IslandMap.tsx              // components/mvp/IslandMap.tsx の react-native-svg 移植
├─ BottomNav.tsx              // expo-router Tabsに置き換わるため設計時に要否確認
├─ AchievementHeader.tsx      // components/mvp/LevelUpScreen.tsx の該当部分を分離移植
├─ CookbookList.tsx           // 新規
├─ DishEditForm.tsx           // 新規
└─ CustomDishForm.tsx         // 新規

lib/native/
├─ theme.ts                   // §6のトークン移植先
├─ useUserState.ts             // lib/mvp/useUserState.ts のAsyncStorage移植 + dish_overrides/custom_dishes/notification_prefs
├─ notifications.ts            // expo-notifications スケジューリング・パーミッション・ディープリンクハンドラ
├─ todaysPick.ts               // lib/mvp/todaysPick.ts のロジック移植（日付シードは不変）
└─ analytics.ts                // lib/mvp/analytics.ts の移植 + 新規イベント

data/
└─ （既存 data/v3.ts をそのまま共有。data v4 到着後はファイル差し替えのみで合流。web版・native版で重複させない）
```

`components/mvp/` と `lib/mvp/` はweb版として残し、`native/` サフィックスの並行ディレクトリを新設する。ロジック（todaysPick、analytics、データ整形）はできるだけ純粋関数のまま `lib/` 直下に共通化できないか実装時に検討してよいが、v1では移植コストを優先し複製から始めてよい（共通化はv1.1以降の判断）。
