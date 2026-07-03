---
goal: web-v29-ui-overhaul
failure_cost: C1
visual_verify: static
turn_limit: 45
---

# Objective

Web v2.9 全画面にspec-029のUIオーバーホールを適用する。機能変更なし・見た目のみ。goal-029（機能実装）の完了後に実行すること（同じファイル群を触るため並行禁止）。

# Scope

spec-029-ui-overhaul-web.md の Core Directives 1〜7 と Screen-by-screen application を、以下の対象に適用:

- components/mvp/ 全コンポーネント（HomeScreen, NearbyDishCard, DishDetailScreen, IslandMap, BottomNav, IngredientChipFilter, ReturnNudge, RecordingModal, BaseDishSelector, WelcomeScreen, 及びgoal-029で追加されたRepertoire系）
- app/ 各ルートのレイアウト余白
- グローバルCSS/トークン定義（accent #C8531C への置換を含む）
- マイルストーン祝福モーダル（spec-029 §6。goal-029の記録フローに接続）

# Out of scope

- 機能・データ層・イベントの変更
- オンボーディングの15皿化
- mocks/design-tokens.md の直接編集（実装完了後にオーナー確認を経て正本反映）

# Done when

spec-029 の Done When チェックリスト全項目 + `npm run lint` / `npm run build` パス。

# References

- docs/specs/spec-029-ui-overhaul-web.md（binding）
- docs/decisions/008-web-v29-demo-first.md
- mocks/design-tokens.md（現行正本）
