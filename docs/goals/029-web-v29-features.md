---
goal: web-v29-features
failure_cost: C1
visual_verify: interactive
turn_limit: 50
---

# Objective

Web版（Next.js）にネイティブv1の機能セットを実装し、友人デモ用の「ほぼ完成品」に引き上げる。ADR-008の決定に基づく。機能仕様の正本はネイティブ用spec（spec-026/spec-027）と blueprint-native-v1.md §3-4 — RN固有の記述（expo-router、AsyncStorage、react-native-svg）を Next.js の対応物（app router、localStorage、既存SVG）に読み替えて実装する。

# Scope

## 1. タブ統合 4→3（食材 / ホーム / レパートリー）

- `components/mvp/BottomNav.tsx` を3タブに変更: 食材（/ingredients）、ホーム（/home）、レパートリー（/repertoire 新規）
- `/level-up` と `/map` は `/repertoire` に統合。旧ルートは `/repertoire` へリダイレクト
- レパートリー画面構成（spec-026準拠、blueprint §3）:
  - 達成ヘッダー: 作った料理数（大きな数字）+ 次のマイルストーン進捗バー（[5,10,15,20,30,50,75,100]）
  - ビュー切替: マップ ⇄ 料理帳リスト（セグメントコントロール、状態はlocalStorageに保持）
  - マップビュー: 既存 IslandMap.tsx を移設（自作料理用の「自作」エリアを追加）
  - 料理帳リストビュー: 作った・保存済み・自作の全料理。各行 = 料理名+状態バッジ+最終記録日。タップで詳細へ
- LevelUpScreen.tsx の月別チャート・料理一覧は料理帳リストビューに吸収。マイルストーン祝福は記録モーダルの完了ステップに残す（既存実装確認）

## 2. 料理帳編集（DishOverride層、spec-027読み替え）

- 型追加（types/dish.ts）: `DishOverride { dish_id, ingredients_override?, steps_override?, memo?, updated_at }`
- localStorage: `dish_overrides` キーに `Record<string, DishOverride>`（useUserState.tsパターン踏襲、独立フックでよい）
- 料理詳細画面（DishDetailScreen.tsx）に編集モード: 鉛筆アイコン→ 材料（行単位の追加/削除/編集）、手順（同様）、メモ（自由テキスト1欄）→ 保存
- 表示時マージ: overrideがあれば材料・手順はoverrideを優先表示し、「自分流に編集済み」バッジを表示。正本データ（data/v3.ts）は不変
- 編集リセット（元に戻す）ボタンを編集モード内に置く

## 3. 自作料理（CustomDish、spec-027読み替え）

- 型追加: `CustomDish { id: `custom-${timestamp}`, name, ingredients[], steps[], attached_base_dish_id?, created_at }`
- localStorage: `custom_dishes` キー
- 作成フォーム: レパートリータブの料理帳ビューに「+ 自分の料理を追加」ボタン → フォーム（名前必須、材料・手順は任意複数行、ベース料理の紐付けは任意セレクト）
- 島マップ配置: attached_base_dish_id 指定時はそのベース島クラスタ付近、未指定時は「自作」エリア
- 自作料理も「作った」記録可能（MadeRecord.dish_id にCustomDish.idを許容）

## 4. 計測イベント追加

`dish_edit_save`, `custom_dish_create`, `cookbook_view_toggle`, `open_repertoire`（analytics.ts既存パターンで）

# Out of scope

- 通知（ネイティブ専用）
- UI全面磨き（次goal 030で実施。このgoalは既存デザイントークンの範囲で機能を組む）
- オンボーディングの15皿化（データv4合流後）
- Web版のPWA化・オフライン対応

# Done when

- [ ] 3タブで全画面が到達可能、/level-up と /map はリダイレクト
- [ ] レパートリータブ: 達成ヘッダー+ビュー切替+両ビューが動作
- [ ] 料理詳細で材料・手順・メモを編集→保存→リロード後も保持→リセット可能
- [ ] 自作料理を追加→料理帳リストと島マップに表示→「作った」記録可能
- [ ] 既存機能（今日のピック、ナッジ、チップ、FAB記録、祝福）にリグレッションなし
- [ ] `npm run lint` / `npm run build` パス
- [ ] 新規4イベントが発火

# References

- tonari-app/docs/blueprint-native-v1.md §3（画面マップ）§4（データモデル）
- tonari-app/docs/specs/spec-026-repertoire-tab.md / spec-027-cookbook-editing.md（RN→Next.js読み替え）
- tonari-app/docs/decisions/008-web-v29-demo-first.md
