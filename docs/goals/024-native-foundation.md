---
goal: native-foundation
failure_cost: C1
visual_verify: static
turn_limit: 30
---

# Objective

Expoプロジェクトを新規構築し、3タブ（食材/ホーム/レパートリー）のナビゲーション殻、デザイントークンのRNテーマ化、AsyncStorage状態層、data v4読み込みの受け口を実装する。native v1の全Waveが積み上がる土台であり、この段階では各タブの中身は空のプレースホルダーでよい。

turn_limit根拠: 単一spec・基盤構築のみ（既存ロジックの複雑な移植はまだ発生しない）で、ファイル数は10前後（spec-022 Technical Notes参照）。single-spec waveとして30ターンを見積もる。

# Spec Reference

- Spec: `docs/specs/spec-022-native-foundation.md`

# Dependencies

None（native v1の最初のgoal）。

# Design References

`mocks/design-tokens.md` を参照。画像なし。

# Product Context

`docs/blueprint-native-v1.md` §7 Wave 1に対応。メインリポジトリの実装スプリント（`../docs/specs/tonari-reboot-plan-2026-07.md` M3）の最初の一歩。以降のWave 2〜4はすべてこのgoalの成果物の上に積まれる。

# Scope

spec-022 の Technical Notes に列挙されたファイルをすべて実装する:

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

Parallel Group Declarationはspec-022記載のWave 1〜3構成に従う。

# Out of Scope

- 各タブの実際のUI（Wave 2以降）
- 通知（spec-028、goal 027）
- 料理帳編集・自作料理（spec-027、goal 027）
- data v4本体（プレースホルダーとして `data/v3.ts` を使う）

# Files to Read First

- `AGENTS.md`
- `docs/blueprint-native-v1.md`（§3 画面マップ、§4 データモデル、§6 デザインシステム、§8 アーキテクチャ方針）
- `docs/specs/spec-022-native-foundation.md`
- `mocks/design-tokens.md`
- `data/v3.ts`
- `types/dish.ts`
- `lib/mvp/useUserState.ts`（移植元）

# Implementation Plan

1. Expoプロジェクトを初期化（TypeScript template、SDK 55+、New Architecture有効）
2. expo-router導入、`app/(tabs)/_layout.tsx` に3タブを定義
3. `lib/native/theme.ts` にdesign-tokens.mdの値を移植
4. `types/native.ts` にDishOverride/CustomDish/NotificationPrefsを定義
5. `lib/native/useUserState.ts` をAsyncStorageベースで実装（既存フィールド + 新規3キー）
6. `lib/native/dishData.ts` で `data/v3.ts` をre-export
7. `eas.json` / `app.json` の雛形作成
8. 3タブのプレースホルダー画面を作成し、タブ間遷移を確認
9. Lint・TypeScriptビルドを実行

# Verification Requirements

```bash
npx expo start  # 起動確認、3タブが表示・遷移できること
npm run lint
tsc --noEmit
```

`npm run typecheck` が定義されていなければ `skipped: script missing` と報告する。

# Stop and Ask Conditions

Stop and ask if:
- Expo SDK 55のNew Architecture有効化で解決不能な依存関係コンフリクトが出た場合
- spec-022と既存コード（web版）の間で矛盾が見つかった場合
- 無関係なユーザー変更を上書きする必要が生じた場合

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
