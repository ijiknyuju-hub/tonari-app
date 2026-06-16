# App Blueprint: となりごはん

Created: 2026-06-15
Status: Draft (pending owner approval)
Based on: /idea-validator (val-001, 14/20 Conditional Go) + /app-blueprint session

## Vision

**One-line pitch**: 近い料理でレパートリーを広げる
**Target user**: 自炊する20-40代。料理は好きだがマンネリ化している人
**Core action**: 今日のおすすめを見る
**Scale**: 収益化を目指す（ビジネスにする）
**Platform**: PWA for validation → Expo (React Native) for native app

## Core Value Trinity

このアプリの差別化は3つの柱の組み合わせにある。どれか1つでも欠けると価値が崩れる。

1. **近さ** — 自分が今作れる料理から「近い料理」を提案。心理的ハードルが低い
2. **差分理解** — 何が変わるか・何が変わらないかが分かる。「自分にもできる」確信
3. **記録と成長** — 作った記録が蓄積し、レパートリーの成長が可視化される

味の素「未来献立」(2026-04終了)が証明した通り、単純なAI献立提案では差別化できない。

## Screen Map

7画面構成。下部ナビ3タブ + 詳細/リスト/オンボード/設定。

### Primary screens (bottom nav)

1. **ホーム（今日のおすすめ）** — メイン画面。難易度タブ（かんたん/少し広げる/しっかり作る）で切り替え。起点料理から近い料理を1品メインカード + 3品小カードで提案
2. **食材から探す** — 手元の食材からレパートリー内の料理を呼び出す。基本は作ったことがある料理のみ表示
3. **広がりマップ / 図鑑** — レパートリーの成長を可視化。両方をテストして検証。3状態: 作ったことがある / 作りたい / まだ候補

### Secondary screens

4. **カード詳細** — 料理の紹介文、新しく必要な食材、ざっくり手順、参考URL、自分用メモ
5. **作りたいリスト** — ブックマークした料理の一覧。ここから「作った」記録へ
6. **料理選択（初回オンボード）** — プリセットから3-5品選択。ラベルは「作れる料理」ではなく「好きな料理/よく食べるもの」を検討
7. **設定** — アカウント、通知設定など最小限

### Navigation

- Bottom tab: 3タブ（ホーム / 食材 / マップor図鑑）
- Landing: 初回はオンボード（料理選択）→ 直接ホームへ
- Auth: Phase 1は不要（localStorage）。Phase 2でオプションアカウント

## Data Model

### Core entities

#### Dish (料理)
- id, name, photo_url
- description_line1 (味の変化), description_line2 (食べる場面/作りやすさ)
- difficulty: easy | stretch | full
- new_ingredients: string[] (起点料理から追加で必要な食材、3つ程度)
- base_recipe: AI generated rough steps (user editable)
- reference_urls: string[] (user-added links to クラシル, 白ごはん.com, YouTube etc.)
- user_notes: string (user editable memo)
- variations: Variation[] (定番バリエーション、親カード内に収める)

#### Variation (定番バリエーション)
- id, name, description
- parent_dish_id
- can_promote_to_dish: boolean (ユーザーが独立ノード化できる)

#### NearbyRelation (近い料理関係)
- source_dish_id, target_dish_id
- proximity_score: 0.1 - 1.0 (体感ベース手動ラベリング)
- tab_category: easy (0.8-1.0) | stretch (0.5-0.8) | full (0.2-0.5)

#### MadeRecord (作った記録)
- id, dish_id, made_at
- want_to_make_again: great | ok | meh
- user_memo: string
- photo_url?: string (optional)

#### UserState (ユーザー状態)
- selected_base_dishes: dish_id[]
- bookmarked_dishes: dish_id[] (作りたいリスト)
- made_records: MadeRecord[]
- promoted_variations: variation_id[] (独立化したバリエーション)

### Storage strategy

- Phase 1: Static JSON (dishes + relations) bundled in app + localStorage (user state)
- Phase 2: Supabase (PostgreSQL + Auth) for cloud sync
- Phase 3: Same Supabase + subscription billing

### Key design decisions on data

#### Proximity model (近さの定義) — REVISED

**旧モデル (廃止)**: 味付け × 食材 × 調理方法の3変数等重みモデル
**新モデル**: 体感ベースの近さスコア (0.1-1.0)

旧モデルの問題: 変数の重みが均一で、ユーザーの体感難易度と合わない。
例: 「醤油→カレールウ」は1変数変化だが、実際は玉ねぎ炒め+煮込みが加わり「かんたん」ではない。

新モデルは以下の要素を総合的に考慮して手動スコアリング:
- 味付けの変化幅
- 食材の変化幅
- 調理方法の変化幅
- 追加工程数
- 新食材の入手しやすさ
- 片付けコスト（揚げ物の油処理など）
- 必要な器具

3変数モデルは参考枠組みとして残すが、最終スコアは人間の体感判定。

#### Arrange concept (アレンジ) — ABOLISHED

アレンジと近い料理の2層構造を廃止。全て「近い料理」に一本化。

- 唐揚げ → 油淋鶏 = 近い料理 (proximity 0.7)
- 唐揚げ → 塩唐揚げ = 親カード内の定番バリエーション

定番バリエーション（塩味、おろしポン酢など）は親カード内に収め、
ユーザーが望めば独立ノードに昇格できる設計。

Rationale:
- アレンジと近い料理の境界が曖昧だった
- ユーザーはこの区別を気にしない
- データモデルとUIが簡素化される
- 難易度タブ（かんたん/少し広げる/しっかり作る）がカテゴリ分けを担う

#### Card display — REVERTED to Notion spec

おすすめカードの表示項目 (Notion「おすすめ画面仕様書」準拠):

**表示する:**
1. 写真
2. 難易度ラベル (かんたん / 少し広げる / しっかり作る)
3. 料理名
4. 紹介文2行 (1行目: 味の変化 / 2行目: 食べる場面 or 作りやすさ)
5. 新しく必要な食材 (3つ程度)
6. ブックマークボタン (右上)

**表示しない:**
- 工程量 (「+1工程」は出さない)
- 「変わるところ」(3変数差分の表示は廃止)
- 作りたいリストに追加テキスト

紹介文ルール:
```
かんたん: 1行目=味の変化, 2行目=作りやすさ
少し広げる: 1行目=味の変化, 2行目=食べる場面
しっかり作る: 1行目=完成感・ごちそう感, 2行目=食べる場面
```

例:
```
ねぎだれで、唐揚げがさっぱり中華風に。
残り物や市販の唐揚げでも作れます。
```

#### Recipe as entry point (レシピの位置づけ)

レシピは課金対象ではなく「入口ツール」:
- AI出力でざっくり手順を自動生成 → ユーザーが自由に編集
- ユーザーが参考URLを貼れる（お気に入りレシピサイトへの導線）
- 役割: どんな料理か知る + 調べるハードルを下げる

段階:
1. プリセット料理のざっくり手順 (AI生成)
2. ユーザーがメモ・手順を編集可能
3. 参考URLを貼れる
4. (将来) 外部URLからカード自動生成

### Data collection pipeline

Phase 1のデータ作成は以下の手順:

1. **AI候補生成**: 起点料理ごとに「作れる人が次に作れそうな料理10個」をAIに出させる
2. **オーナー仕分け**: 「自明すぎる / 発見感ある / 遠すぎる」の3段階。近さスコアを手動で付与
3. **AI紹介文下書き**: Notion紹介文ルール（1行目:味変化 / 2行目:場面）でAIに生成 → オーナー編集
4. **知人テストで補正**: カードに「この提案どう？」フィードバックボタン。5-10人のテストで近さスコアを補正

Phase 1の目標データ量: 10起点料理 × 3-5近い料理 = 30-50ペア (厚く作り込み)

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js (App Router) + Tailwind CSS | 既存実装活用。PWA対応 |
| State | localStorage | Phase 1はDB不要 |
| Hosting | Vercel (free tier) | 既存デプロイ済み |
| Analytics | GA4 (PIIなし) | 7イベント計測 |
| Future DB | Supabase (PostgreSQL + Auth) | Phase 2で導入 |
| Future Native | Expo (React Native) | Phase 3でネイティブ化 |
| Future Auth | Apple/Google Sign-in via Supabase Auth | Phase 2でオプション導入 |

ADRs: see docs/decisions/

## Design System

Source: mocks/design-tokens.md (derived from owner's concept images, 2026-06-12)
Mood: 温かみ・手作り感 (warm cream + orange accent)

### Colors
- Background: #FAF6EF (warm cream)
- Surface: #FFFFFF (cards)
- Surface soft: #F7F0E6 (inset blocks)
- Text: #2B2520 (warm near-black)
- Text sub: #8A8178
- Accent: #E8702A (orange)
- Accent soft: #FDEBDD
- Tag easy: bg #E5F2DC / text #4E7C36
- Tag stretch: bg #FBE9C8 / text #9A6B1F
- Tag full: bg #FDE0D5 / text #B14A22
- Border: #EDE5DA

### Shape
- Card radius: 20px, chips: full round
- Shadows: very soft (0 6px 18px rgba(43,37,32,0.06))
- Buttons: outlined pill (white bg, accent border, accent text)

### Typography
- Headings: black weight, warm near-black
- Body: 14-16px, relaxed leading
- Caption: small, text-sub

## Delivery Phases

### Phase 1: PWA検証版 — 近い料理の魅力を証明

**Screens**: ホーム, カード詳細, 作りたいリスト, 食材から探す, マップ/図鑑, 設定(minimal)
**Data**: 10起点料理を厚く (各3-5近い料理 + 定番バリエーション)
**Tech**: Next.js PWA, localStorage, static JSON, GA4, Vercel free
**What's already built**: v2.8 goals 012-017 completed (tokens, nav, home, made-tracking, ingredients, map, design)

**Remaining work**:
- Revise data model: abolish arrange concept, implement proximity scores
- Revise card display: revert to Notion spec (紹介文2行 + 新食材)
- Create dish data via AI pipeline (10 base × 3-5 nearby = 30-50 pairs)
- Write 紹介文 for all pairs (AI draft + owner edit)
- Source photos (free stock priority, AI-generated for gaps)
- Add feedback button for proximity validation
- Production deploy of revised version

**Go criteria**: 知人10-20人テスト
- return_visit率 20%+ (8日後再訪)
- 平均保存数 0.5+
- マップ/図鑑閲覧 30%+
- 「この提案どう？」で 👍 70%+

### Phase 2: 継続利用Web版 — アカウント + DB + 一般公開

**Added screens**: 料理選択(オンボード改善), LP(マーケ用)
**Data**: 30起点料理に拡充, ユーザーによる料理追加機能
**Tech**: Supabase (DB + Auth), Apple/Google Sign-in, Push notification (PWA)
**Revenue**: 広告テスト開始 (食品・キッチン用品のみ)

**Go criteria**: 50-100人一般公開
- 週2回以上のアクティブユーザー率
- 作った記録 平均12件以上/ユーザー (ロックイン閾値)

### Phase 3: ネイティブアプリ — 課金 + 成長

**Platform**: Expo (React Native) で iOS/Android
**Revenue model**: 月350-500円サブスク (再訪確認後に設計)
- 無料: 基本おすすめ + 広告あり
- 有料: マップ/図鑑エリア拡張 + 成長アーカイブ + チャレンジ提案 + 広告なし
- 年額オプション (約20%引き) を追加

**Revenue NOT from**: レシピ詳細 (ChatGPTに3秒で代替される)
**Revenue FROM**: 蓄積された成長体験 (マップ、履歴、自分で育てたレシピ集)

**Target**: MAU 5,000 × 1% conversion × 400円 = 月20,000円 (開発費回収ライン)
**Timeline**: 18-24ヶ月で開発費回収を目標

## Revenue Strategy

### Why cooking apps struggle with monetization

- Cookpad premium < 10% at peak, shifted to ad-centric
- クラシル 480円/month premium, conversion rate estimated 1-3%
- 味の素「未来献立」shut down 2026-04
- ChatGPT offers free recipe suggestions as substitute

### Our differentiation for monetization

The only thing ChatGPT cannot replicate: **accumulated personal growth data**.
- 作った記録の蓄積 (12件超でロックイン感覚)
- 島マップ/図鑑の成長可視化 (捨てたくない感情)
- 自分で育てたレシピカード (編集・メモ・URL)
- 成長レポート (月次・年次の変化)

### Monetization timeline

1. Phase 1: 完全無料 (コスト≈0円/月)
2. Phase 2: 広告テスト (食品系ネイティブ広告のみ。月数千円規模の検証)
3. Phase 3: サブスク (再訪週2回以上が確認されてから設計)
4. 将来: 食品B2Bデータ販売の可能性 (MAU 10,000+, 蓄積1年+)

### Key revenue decision

課金対象を「情報制限」から「成長体験の広さ」に変える:
- NG: レシピ詳細を有料にする (ChatGPTで代替される)
- OK: 島マップの有料エリア開放 / 成長アーカイブ / チャレンジ提案

## Competitive Landscape

| App | Users | Weakness vs Tonari |
|-----|-------|--------------------|
| me:new | 4.2/5 (16K reviews) | Limited variety. No gradual expansion |
| pecco | 500K DL | Ingredient-first, no skill-up |
| クラシル | 44M DL | Passive search. No "next step for you" |
| Cookpad | 40M MAU | Too many choices. No rut-escape path |
| ChatGPT | — | No records. No habit. No growth visualization |

Market gap: No existing app combines nearby-dish recommendation + growth tracking + personalized recipe cards.

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| 「近さ」が体感と合わない | Critical | AI候補→オーナー仕分け→知人フィードバックの3段階補正 |
| 10品で「自分の料理がない」 | High | 初期品目を30人アンケートから逆算。入口ラベルを「好きな食べ物」に変更検討 |
| 紹介文が「作りたい」を刺激しない | High | Notion紹介文ルール厳守。AI下書き+人間編集。A/Bテスト |
| 静的JSONの枯渇 (3-4ヶ月) | Medium | Phase 2でユーザー追加機能。「作った除外」ロジックで体感パターン倍増 |
| ChatGPT代替 | Structural | 情報ではなく体験（蓄積×可視化×成長実感）で差別化 |
| 課金率 < 1% | High | 再訪確認前にサブスク設計しない。広告+ネイティブ広告で緩衝 |

## Architecture Notes (for implementation)

### Folder structure (existing)
```
tonari-app/
  app/                    # Next.js App Router routes
  components/phase0/      # Phase 0 MVP components (to be revised)
  lib/phase0/             # Phase 0 logic and types
  data/                   # Static dish data JSON
  mocks/                  # Design spec source of truth
    home.md
    ingredients-search.md
    design-tokens.md
    concept/              # Reference images
  docs/
    specs/
    goals/
    decisions/
    operations/
    validations/
    blueprint.md          # This file
  public/
```

### Key implementation changes needed
1. Revise `data/` structure: add proximity_score, remove arrange/nearby distinction
2. Revise card components: align with Notion spec (紹介文2行 + 新食材)
3. Add feedback mechanism (👍/👎 on cards)
4. Add "作った記録を除外して次を出す" logic for daily recommendation
5. Photo assets: source and add to public/

### Data JSON schema (target)
```json
{
  "dishes": [
    {
      "id": "karaage",
      "name": "唐揚げ",
      "photo": "/photos/karaage.jpg",
      "variations": [
        {"id": "shio-karaage", "name": "塩唐揚げ", "description": "..."}
      ]
    }
  ],
  "relations": [
    {
      "source": "karaage",
      "target": "yurinchi",
      "proximity": 0.7,
      "tab": "stretch",
      "description_line1": "ねぎだれで、唐揚げがさっぱり中華風に。",
      "description_line2": "残り物や市販の唐揚げでも作れます。",
      "new_ingredients": ["長ねぎ", "酢", "ごま油"]
    }
  ]
}
```

## References

- Validation: docs/validations/val-001-tonari-gohan-revalidation.md
- Spec v2.7: docs/specs/tonari-gohan-spec-v2.7.md
- Spec v2.8 draft: docs/specs/tonari-gohan-spec-v2.8-draft.md
- Design tokens: mocks/design-tokens.md
- Notion方針整理メモ: https://app.notion.com/p/377415560fcf814da47cf4ffd0626a5a
- Notionおすすめ画面仕様書: https://app.notion.com/p/8917b81f56d149cab5f26830d7276ea2
- Decision 001: docs/decisions/ (Claude=orchestration, Codex=implementation)
- Decision 002: docs/decisions/ (near-complete MVP validation)
