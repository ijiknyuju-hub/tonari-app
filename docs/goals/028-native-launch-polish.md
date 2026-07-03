---
goal: native-launch-polish
failure_cost: C1
visual_verify: static
turn_limit: 30
---

# Objective

全機能実装後の仕上げ作業。アプリアイコン・スプラッシュ画面、ストア掲載用スクリーンショット素材、EASビルドプロファイルの本番設定、クローズドテスト提出準備を行う。specファイルは存在しない——本goalに直接タスクを列挙する。

turn_limit根拠: コード実装ではなく素材生成・設定ファイル調整・提出作業が中心のため、goal 024と同程度の30ターンを見積もる。

# Spec Reference

なし。参照ドキュメント:
- `docs/blueprint-native-v1.md`（§6 デザインシステム、§7 デリバリーウェーブ）
- `../docs/specs/tonari-reboot-plan-2026-07.md`（M4/M5マイルストーン、クローズドテスト12人×14日の要件）
- メインリポジトリ `docs/goals/014-marketing-foundation.md`（ストア素材の構成パターン参照。SleepWellの3枚組——価値の約束/使用シーン/信頼——と同様の型で作成する）

# Dependencies

- [ ] goal 024（native-foundation）
- [ ] goal 025（native-core-screens）
- [ ] goal 026（native-repertoire）
- [ ] goal 027（native-cookbook-notifications）

すべての機能実装が完了し、実機でコアループが通しで動作することが前提。

# Design References

`mocks/design-tokens.md` を参照。アプリアイコン・スプラッシュはこのトークンの配色（`--tn-bg` 暖かいクリーム色 + `--tn-accent` オレンジ）で作成する。

# Product Context

`docs/blueprint-native-v1.md` §7 Wave 5に対応。メインリポジトリのマイルストーンM4（品質ライン照合・クローズドテスト完走）〜M5（両ストア公開）の直前作業。テスター12人確保の代替経路（相互テストコミュニティ、iOS先行公開）は`../docs/specs/tonari-reboot-plan-2026-07.md`のリスク対応に従う——本goalの担当範囲外（対人ステップは友人協議・テスター募集であり、実装作業ではない）。

# Scope

## タスク一覧（inline、spec不要）

1. **アプリアイコン・スプラッシュ画面**
   - design-tokens.mdの配色に基づくアイコン（1024x1024）とスプラッシュ画面を作成し `app.json` / `assets/` に配置
   - iOS/Android両方の解像度バリエーションをExpoのプリセットに従い生成

2. **ストア掲載用スクリーンショット素材**
   - 縦向き、日本語優先、3〜5枚組（メインリポジトリgoal 014のSleepWell実例と同型: 価値の約束＋ホーム画面 / 使用シーン＋料理詳細or記録モーダル / 信頼＋「データは端末の中だけ」）
   - コピーは `.claude/rules/writing-style.md` のAIスロップ禁止ルールに従う（短い断定文、誇張表現なし）
   - `docs/marketing/store-assets-native-v1.md` としてコピー+構成仕様を先に文書化してから画像生成に進む

3. **EASビルドプロファイル本番設定**
   - `eas.json` に `development` / `preview` / `production` の3プロファイルを整備
   - iOS: Apple Developer登録情報（$99/年、メインリポジトリADR記載）に紐づくbundle identifierとprovisioning設定
   - Android: keystore生成、Play Console向けAABビルド設定

4. **クローズドテスト提出準備**
   - Google Play Consoleクローズドテスト（12人×14日、個人アカウント）の提出チェックリスト作成
   - TestFlight配布設定（iOSはテスター人数ゲートなし、任意）
   - `../docs/specs/tonari-reboot-plan-2026-07.md` M3の「コアループが実機で動いた時点で提出し、14日カウントを実装と並走させる」方針に従い、提出は本goal完了を待たず可能な限り前倒しする

# Out of Scope

- 友人協議・テスター募集そのもの（対人ステップ、本人の担当範囲）
- 課金機能・広告（ADR-007により対象外）
- Web版（Next.js）の追加開発

# Files to Read First

- `AGENTS.md`
- `docs/blueprint-native-v1.md`
- `mocks/design-tokens.md`
- `../docs/specs/tonari-reboot-plan-2026-07.md`
- `../docs/goals/014-marketing-foundation.md`（ストア素材構成の参照実例）
- `../docs/decisions/2026-07-03-tonari-native-expo.md`

# Implementation Plan

1. アプリアイコン・スプラッシュ画面を作成し `app.json` に反映
2. `docs/marketing/store-assets-native-v1.md` にスクリーンショット構成・コピーを文書化
3. スクリーンショット画像を実機/シミュレータのアプリ画面から生成
4. `eas.json` の3プロファイルを整備
5. iOS/Android提出情報（bundle id、keystore等）を準備
6. クローズドテスト提出チェックリストを作成し、提出を実行

# Verification Requirements

```bash
eas build --profile preview --platform all  # ビルドが通ること
```

ストア素材はpreview_screenshot等での視覚確認（M6: static）。実際のストア提出結果は人間が最終確認する（C3相当の外部公開行為のため、提出実行前に一度報告し確認を挟むことを推奨）。

# Stop and Ask Conditions

Stop and ask if:
- Apple Developer / Play Consoleアカウント情報が未整備でビルド・提出ができない場合
- ストア提出（公開ボタンを押す操作）そのものを実行する直前——外部公開はhard gate 2（external-write gate）の対象であり、C3相当の判断を伴うため人間の承認を得てから進める
- クローズドテスト12人が友人ネットワークで確保できない場合（`../docs/specs/tonari-reboot-plan-2026-07.md`のリスク対応へ差し戻す）

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
