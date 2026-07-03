---
goal: native-cookbook-notifications
failure_cost: C1
visual_verify: interactive
turn_limit: 55
---

# Objective

料理帳編集機能（DishOverride層による食材/手順/メモの上書き、自作料理作成フォーム）と、2本のローカル通知（朝「今日のとなりごはん」・夜「作りましたか？」、アクションボタン直接記録、ディープリンク）、設定画面を実装する。native v1の個人化・継続利用機能をまとめて完成させる最後の機能Wave。

turn_limit根拠: 2 spec・約16ファイルの複合Wave。通知の権限フロー・アクションボタン・ディープリンクは実機検証が必要な相互作用が多く（visual_verify: interactive）、foundationやrepertoireより手戻りコストが高いため55ターンを見積もる。

# Spec Reference

- Spec: `docs/specs/spec-027-cookbook-editing.md`
- Spec: `docs/specs/spec-028-notifications-settings.md`

# Dependencies

- [ ] goal 024（native-foundation）
- [ ] goal 025（native-core-screens: 料理詳細画面遷移・イベント発火箇所が先に存在すること）
- [ ] goal 026（native-repertoire: 料理帳リストからの自作料理作成導線ボタンが先に存在すること）

# Design References

`mocks/design-tokens.md` を参照。画像なし。通知の実発火・アクションボタン挙動は実機/シミュレータでの操作確認が必須（M6: interactive）。

# Product Context

`docs/blueprint-native-v1.md` §7 Wave 4に対応。ADR-007の核心的な理由「デイリー通知だけがH5（戻る理由がない）に直接効き、webでは不可能」に対応する機能。料理帳編集と自作料理は「記憶」層（レパートリーを育てる感覚）を強化する。

# Scope

## spec-027（料理帳編集）

```
app/dish/[id].tsx
app/custom-dish/new.tsx
components/native/DishDetailScreen.tsx
components/native/DishEditForm.tsx
components/native/CustomDishForm.tsx
lib/native/dishOverrides.ts
```

## spec-028（通知・設定）

```
lib/native/notifications.ts
app/settings.tsx
components/native/SettingsScreen.tsx
components/native/NotificationTimeEditor.tsx
```

`expo-notifications` を新規依存として `package.json` に追加する。各specのParallel Group Declarationに従う。spec-027を先に実装し、`last_card_view_date` トラッキング（spec-028 Feature B）が依存する「料理詳細を開く」イベント発火箇所を確定させてからspec-028に進むことを推奨する。

# Out of Scope

- 自作料理の削除・写真添付（v1スコープ外）
- サーバープッシュ通知（ローカル通知のみ）
- データエクスポート機能（ADR-007により対象外）

# Files to Read First

- `AGENTS.md`
- `docs/blueprint-native-v1.md`
- `docs/specs/spec-027-cookbook-editing.md`
- `docs/specs/spec-028-notifications-settings.md`
- `components/mvp/DishDetailScreen.tsx`（移植元）
- `lib/mvp/useUserState.ts`（移植元）

# Implementation Plan

1. `lib/native/dishOverrides.ts` マージロジック + useUserStateへのsaveDishOverride/resetDishOverride/addCustomDish追加
2. DishEditForm・DishDetailScreen編集モード統合
3. CustomDishForm実装
4. `expo-notifications` 導入、通知権限リクエスト・スケジューリング関数実装
5. `last_card_view_date` トラッキングを料理詳細画面のイベント発火箇所に統合
6. 通知アクションカテゴリ・ディープリンクハンドラを `app/_layout.tsx` に実装
7. SettingsScreen（通知時刻・ベース料理編集・about）実装
8. 実機/シミュレータで通知の発火・アクションボタン・ディープリンクを操作確認
9. Lint・TypeScriptビルドを実行

# Verification Requirements

```bash
npx expo start
npm run lint
tsc --noEmit
```

手動確認（実機またはシミュレータ、M6: interactive）:
- 編集モードで保存→再表示→リセットの一連の動作
- 自作料理の作成→料理帳リスト/マップへの反映
- 朝通知のスケジュール登録とタップ時のホーム遷移
- 夜通知が「カードを見た日のみ」発火する条件分岐
- 夜通知のアクションボタンでの直接記録
- 夜通知タップでの記録モーダルstep2起動
- 設定画面での通知時刻変更が実スケジュールに反映されること

# Stop and Ask Conditions

Stop and ask if:
- expo-notificationsのiOS/Android権限フローで解決不能な差異が出た場合
- goal 025/026の成果物（イベント発火箇所、料理帳リスト導線）が想定と異なる場合
- 無関係なユーザー変更を上書きする必要が生じた場合

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
