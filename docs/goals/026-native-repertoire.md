---
goal: native-repertoire
failure_cost: C1
visual_verify: static
turn_limit: 35
---

# Objective

レパートリータブを実装する。達成ヘッダー（品数+マイルストーン進捗）、マップビュー（react-native-svg移植の島マップ）、料理帳リストビュー、ビュー切替を1つのタブにまとめる。web版で別々だったレベルアップ画面と島マップ画面をここで統合する。

turn_limit根拠: 単一spec・react-native-svg導入を含む約7ファイル。single-spec waveだが新規依存導入とSVG移植の複雑さを考慮しfoundationよりやや多めの35ターンを見積もる。

# Spec Reference

- Spec: `docs/specs/spec-026-repertoire-tab.md`

# Dependencies

- [ ] goal 024（native-foundation）
- [ ] goal 025（native-core-screens: useSelectedBaseDishes等の共有ロジックが先に揃っていることが望ましい）

# Design References

`mocks/design-tokens.md` を参照。画像なし。

# Product Context

`docs/blueprint-native-v1.md` §7 Wave 3に対応。「標準のレベルアップ画面は廃止、達成祝福は記録モーダルへ」というADR-007の決定により、レパートリータブが達成の可視化を一手に引き受ける唯一の場所になる。

# Scope

```
app/(tabs)/repertoire.tsx
components/native/RepertoireTab.tsx
components/native/AchievementHeader.tsx
components/native/IslandMapView.tsx
components/native/CookbookListView.tsx
```

`react-native-svg` を新規依存として `package.json` に追加する。Parallel Group Declarationはspec-026記載のWave 1〜3構成に従う。

# Out of Scope

- 自作料理の作成フォーム（goal 027。本goalは既存CustomDishデータを表示する側のみ実装し、作成導線ボタンは置くが遷移先は未実装でよい — スタブ遷移として報告する）
- 料理詳細の編集モード起動（goal 027）
- 静的座標ベースの島レイアウト刷新（v1スコープ外、簡易グリッドのまま）

# Files to Read First

- `AGENTS.md`
- `docs/blueprint-native-v1.md`
- `docs/specs/spec-026-repertoire-tab.md`
- `components/mvp/LevelUpScreen.tsx`（移植元）
- `components/mvp/IslandMap.tsx`（移植元）
- `lib/mvp/analytics.ts`

# Implementation Plan

1. `react-native-svg` を導入
2. AchievementHeader（品数・累計日数・マイルストーン進捗バー）を実装
3. IslandMapView（ノード状態3分類・自作料理エリア）をSVGで実装
4. CookbookListView（月別チャート・一覧・自作バッジ）を実装
5. ビュー切替コントロールでRepertoireTabに統合
6. Lint・TypeScriptビルドを実行

# Verification Requirements

```bash
npx expo start  # レパートリータブでマップ⇄リスト切替を手動確認
npm run lint
tsc --noEmit
```

# Stop and Ask Conditions

Stop and ask if:
- react-native-svgの導入でNew Architecture関連の互換性問題が出た場合
- goal 025の成果物（useSelectedBaseDishes等）のインターフェースが想定と異なる場合
- 無関係なユーザー変更を上書きする必要が生じた場合

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
