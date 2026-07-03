---
goal: native-core-screens
failure_cost: C1
visual_verify: static
turn_limit: 55
---

# Objective

オンボーディング（Welcome→ベース料理選択→通知オプトイン）、ホームタブ（今日のピック・再訪ナッジ・FAB記録モーダル）、食材タブ（チップフィルタ・今すぐ作れる結果）を実装する。3つのspecをまとめた複合Waveで、native v1の主要な日常導線をここで作り切る。

turn_limit根拠: 3 spec・約25ファイルの複合Wave（spec-023約4ファイル、spec-024約9ファイル、spec-025約6ファイル）。multi-spec waveとして55ターンを見積もる。

# Spec Reference

- Spec: `docs/specs/spec-023-onboarding.md`
- Spec: `docs/specs/spec-024-home.md`
- Spec: `docs/specs/spec-025-ingredients-tab.md`

# Dependencies

- [ ] goal 024（native-foundation: Expo基盤・useUserState・theme・3タブ殻が完了していること）

# Design References

`mocks/design-tokens.md` を参照。画像なし。

# Product Context

`docs/blueprint-native-v1.md` §7 Wave 2に対応。オンボーディングからホーム・食材タブまで、ユーザーが初回起動から日常利用に入るまでの一連の導線をこのgoalで完成させる。

# Scope

## spec-023（オンボーディング）

```
app/(onboarding)/welcome.tsx
app/(onboarding)/base-dish-select.tsx
app/(onboarding)/notification-opt-in.tsx
lib/native/dishCategories.ts
```

## spec-024（ホーム）

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

## spec-025（食材タブ）

```
app/(tabs)/ingredients.tsx
components/native/IngredientsTab.tsx
components/native/IngredientChipFilter.tsx
lib/native/ingredientIndex.ts
lib/native/ingredientCategories.ts
```

各specのParallel Group Declarationに従って実装順を決める。spec間の実装順はオンボーディング→ホーム→食材タブを推奨するが、依存関係が独立していれば並行してよい。

# Out of Scope

- レパートリータブ（goal 026）
- 料理帳編集・自作料理・通知（goal 027）
- 写真撮影UI（v1スコープ外）

# Files to Read First

- `AGENTS.md`
- `docs/blueprint-native-v1.md`
- `docs/specs/spec-023-onboarding.md`
- `docs/specs/spec-024-home.md`
- `docs/specs/spec-025-ingredients-tab.md`
- `components/mvp/BaseDishSelector.tsx`（移植元）
- `components/mvp/HomeScreen.tsx`（移植元）
- `components/mvp/IngredientsSearch.tsx`（移植元）
- `components/mvp/IngredientChipFilter.tsx`（移植元）
- `lib/mvp/todaysPick.ts`（移植元）
- `lib/mvp/analytics.ts`

# Implementation Plan

1. spec-023: Welcome画面 → ベース料理選択（15皿カテゴリグリッド）→ 通知オプトインを実装
2. spec-024: todaysPickロジック移植 → ReturnNudge → RecordingModal（3ステップ）→ HomeScreen統合 → FAB
3. spec-025: ingredientIndex移植 → IngredientChipFilter → IngredientsTab統合
4. オンボーディング完了後にタブ画面へ正しく遷移することを確認
5. Lint・TypeScriptビルドを実行

# Verification Requirements

```bash
npx expo start  # オンボーディング完走 → ホーム表示 → 食材タブ操作を手動確認
npm run lint
tsc --noEmit
```

# Stop and Ask Conditions

Stop and ask if:
- goal 024の成果物（useUserState、theme）のインターフェースがspec想定と異なる場合
- 15皿のカテゴリ分けでdata v4未到着によりダミーデータが必要な場合（進めてよいが報告に明記する）
- 無関係なユーザー変更を上書きする必要が生じた場合

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
