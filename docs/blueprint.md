# App Blueprint: となりごはん

Created: 2026-06-15
Updated: 2026-06-19 (val-003 反映, H5対策統合, Phase計画再編)
Status: Approved
Based on: /idea-validator (val-003, 18/25 Conditional Go) + /app-blueprint session

## Vision

**One-line pitch**: 今作れる料理から「次の一品」が見つかるアプリ
**Target user**: 自炊する20-40代。料理は好きだがマンネリ化している人
**Core action**: 「今日のとなりごはん」を開く
**Scale**: 収益化（ビジネスにする）
**Platform**: スマホのブラウザ（モバイルWeb → 将来ネイティブ）

### Messaging Strategy (Dual-Pitch)

| Stage | Message | Purpose |
|-------|---------|---------|
| Phase 1-2 (〜100人) | 機能訴求「今作れる料理から、次の一品が見つかる」 | CTR重視。具体的に何ができるか |
| Phase 3+ (1,000人〜) | 感情訴求「レシピを探すんじゃなくて、レパートリーを育てる」 | ブランディング。記憶の核 |

Phase 1-2の広告・LP・紹介文は全て機能訴求を使う。
感情訴求はユーザーが自然にその体験に到達してから（口コミ・ブランディング段階）。

## Value Core (5 Layers)

| Layer | Content |
|-------|---------|
| 1. Function | 作った料理を記録でき、それをもとに近い料理をおすすめしてくれる |
| 2. Behavior | 「今日ちょっと別の料理にチャレンジしてみるか」と思う |
| 3. Value | 料理レパートリーが無理なく増える。冷蔵庫を見たときに「あれが作れるな」と自然にいくつも浮かぶ |
| 4. Emotion | 「探さなくても出てくる」「これなら作れそう」。レパートリーが増えた実感 |
| 5. Memory | レシピを探すんじゃなくて、自分のレパートリーを育てるアプリ |

Translation quality: Natural (user自身が言語化)

**How to apply:**
- 新機能は5層のどこに効くか確認してから追加する
- LP・広告コピーは Phase に応じたメッセージ戦略に従う
- 感情の核「探さなくても出てくる」「これなら作れそう」がUI体験の判断基準
- 行動の核「ちょっと別の料理にチャレンジ」が起きない機能は優先度を下げる

### Core Value Trinity

1. **近さ** — 「今の自分」から遠くない料理だけ提案する
2. **差分理解** — 何が違うか（新食材、味の変化）を一目で伝える
3. **記録と成長** — 作った料理が蓄積され、レパートリーの広がりが見える

## Screen Map (9 screens)

### Entry Flow
- **LP** — 機能訴求メッセージ。「今作れる料理から、次の一品が見つかる」
- **料理選択（オンボーディング）** — 3ステップ: 好み → レベル → 最初の料理

### Core Loop
- **ホーム** [H5強化] — 「今日のとなりごはん」(日替わり) + ストリークカウンター + **食材クイック選択**（「今ある食材」チップ → おすすめをフィルター） + おすすめ横スクロール + クイック記録FAB
- **カード詳細** — 紹介文2行 + 新食材3つ + 保存/作った記録
- **おすすめ一覧** — 難易度3タブ (かんたん/少し広げる/しっかり作る)

### Bottom Tabs (3 items)
- **食材から探す** — 冷蔵庫にあるものでフィルター → おすすめ
- **作りたいリスト** — 保存した料理一覧。作ったらチェック → 記録
- **島マップ** [H5強化] — 作った/作れる/未踏の3色。成長可視化 + 次の予告

### H5 Continuity Screens
- **週次ダイジェスト** [新規] — 今週の料理まとめ + 来週のおすすめ予告。PWA通知 → ホーム誘導
- **レベルアップ** [新規] — 連続日数 + レベル表示 + レパートリー成長グラフ。「統計」ではなく「成長の実感」を見せる画面

### Navigation
- Bottom tab: 3 items (ホーム / 食材 / マップ)
- レベルアップ: ホーム内からアクセス (ストリークカウンタータップ)
- 週次ダイジェスト: PWA通知 or ホーム内バナー

### Key UX Decisions
- 写真大型カード + 横スクロール（料理アプリの標準パターン）
- クイック記録 = FABボタン → 写真 or レシピ選択 → 完了（2-3タップ）
- 親指フレンドリー: 頻繁な操作（保存/記録/ナビ）は画面下部40-50%に集中
- オンボーディングは3-4ステップで初期価値を見せる（説明ではなくデモ）
- **ホーム食材フィルター**: 「材料ないじゃん」→閉じる を防ぐ最重要UX。ホーム上部に食材チップ（よく使う食材5-8個）を配置し、選択するとおすすめが「今作れるもの」に絞られる。食材タブへの完全遷移は不要 — ホームで完結させる

## Data Model

### Entities

- **Dish**: id, name, photo, difficulty (easy/stretch/full), variations[]
- **Variation**: id, name, description (親Dish内の定番バリエーション。独立化可能)
- **NearbyRelation**: source_dish_id, target_dish_id, proximity_score (0.1-1.0), tab, description_line1, description_line2, new_ingredients[]
- **MadeRecord**: dish_id, made_at, want_to_make_again (great/ok/meh)
- **UserState**: selected_dishes[], bookmarked_dishes[], made_records[], promoted_variations[], streak_current, streak_best, last_active_date, level, available_ingredients[]

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

#### Recipe as entry point (レシピの位置づけ)

レシピは課金対象ではなく「入口ツール」:
- AI出力でざっくり手順を自動生成 → ユーザーが自由に編集
- ユーザーが参考URLを貼れる（お気に入りレシピサイトへの導線）
- 役割: どんな料理か知る + 調べるハードルを下げる

### Data collection pipeline

Phase 1のデータ作成は以下の手順:

1. **AI候補生成**: 起点料理ごとに「作れる人が次に作れそうな料理10個」をAIに出させる
2. **オーナー仕分け**: 「自明すぎる / 発見感ある / 遠すぎる」の3段階。近さスコアを手動で付与
3. **AI紹介文下書き**: Notion紹介文ルール（1行目:味変化 / 2行目:場面）でAIに生成 → オーナー編集
4. **知人テストで補正**: カードに「この提案どう？」フィードバックボタン。5-10人のテストで近さスコアを補正

Phase 1の目標データ量: 10起点料理 × 3-5近い料理 = 30-50ペア (厚く作り込み)

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

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js (App Router) + Tailwind CSS | 既存実装活用。PWA対応 |
| State | localStorage | Phase 1はDB不要 |
| Hosting | Vercel (free tier) | 既存デプロイ済み |
| Analytics | GA4 (PIIなし) | 7イベント計測 |
| Future DB | Supabase (PostgreSQL + Auth) | Phase 2で導入 |
| Future Native | Expo (React Native) | Phase 4でネイティブ化 |
| Future Auth | Apple/Google Sign-in via Supabase Auth | Phase 2でオプション導入 |

ADRs: see docs/decisions/

### PWA considerations (from research)

- Service worker: `next-pwa` or Serwist for offline support
- Manifest.json for installability
- PWA notification (Phase 2): 週次ダイジェスト配信用
- Reference: AjayKanniyappan/nextjs-pwa-template (Lighthouse 100, MIT)

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

## Competitive Landscape (val-003)

| Name | MAU | Price | Strength | Weakness vs Tonari |
|------|-----|-------|----------|-------------------|
| クラシル | 3600万 | Freemium | 動画レシピ最大級5万件 | 好み学習・レパートリー拡張なし |
| Cookpad | 3200万↓ | ¥308/月 | レシピ270万品 | 衰退中。「レパートリー」機能を試みて失敗 |
| Delish Kitchen | 5600万 | ¥480/月 | デリッシュAI導入開始 | AI学習データ不足 |
| me:new | 100万 | Freemium | 1週間献立自動作成 | レシピ数少、レパートリー拡張目的でない |
| pecco | 不明 | 無料+広告 | 冷蔵庫管理+AI提案 | バグ多い、広告過多 |
| ChatGPT | — | 無料/$20 | 柔軟な対話型提案 | 毎回プロンプト必要、履歴なし |

**Market gap**: 「自分が作った料理」を起点にレパートリーを育てるアプリは市場に0。
Cookpadの「レパートリー」機能失敗 = コンセプトが非自明である証拠。

### UX Patterns Referenced (from research)

| Pattern | Adopted/Avoided | Reason |
|---------|----------------|--------|
| 大型カード + 横スクロール | Adopted | Kitchen Stories/Delish Kitchen標準。写真が食欲をそそる |
| 1タップロギング (FAB) | Adopted | 記録の摩擦最小化。Ate/FoodViewパターン |
| ストリーク (Duolingo型) | Adopted | 最強の継続モチベーション。H5対策の中核 |
| 3ステップオンボード | Adopted | America's Test Kitchen: MAU 3倍の事例 |
| 競争的ランキング | Avoided | ストレス増加。料理は競争ではない |
| リスト表示のみ | Avoided | 写真が小さくなり食欲を刺激しない |

## Failure Hypotheses (from val-003)

Most dangerous layer: **継続（H5）**
Existing behavior to replace: 我慢して同じ5-10品を回す / ChatGPTに聞く / SNSで偶然見る

| ID | Hypothesis | Layer | Kill Signal | Danger | Countermeasure |
|----|-----------|-------|-------------|--------|---------------|
| H1 | ChatGPTで十分、アプリ不要 | 機能 | 「ChatGPTと同じ」と感じる | 🟡 | 記録蓄積 + 成長可視化でChatGPTにない価値 |
| H2 | 「作った記録」を続けない | 行動 | 2週目の記録率10%以下 | 🟡 | FABで2タップ記録。ストリーク心理で継続 |
| H3 | 近い料理に新しさがない | 価値 | 「作ってみたい」率10%以下 | 🟢 | 紹介文2行で「味の変化」を伝える。知人テスト補正 |
| H4 | 便利でも達成感がない | 感情 | マップを「ふーん」で閉じる | 🟢 | 島マップの未踏予告 + ストリーク達成感 |
| H5 | 1回見て満足、戻らない | 継続 | 2回目開封率20%以下 | 🔴 | 日替わりおすすめ + 週次通知 + ストリーク |

### H5 Countermeasure Design

```
日替わりサイクル:
  開く → 「今日のとなりごはん」を見る → (気になったら) 保存/記録
  → ストリークカウンター更新 → 翌日また開く

週次サイクル:
  PWA通知「今週の料理まとめ」→ 開く → ダイジェスト確認
  → 来週のおすすめ予告 → ホームへ

成長サイクル:
  記録が溜まる → 島マップの色が増える → 未踏エリアが見える
  → 「次はあっちに行きたい」→ 新しい料理に挑戦
```

## Reachability Strategy (val-003 Weak Point)

Score: 2/5. 改善が必要。

### Combined Strategy (A + B + C)

| Priority | Action | Channel | Timeline | Expected |
|----------|--------|---------|----------|----------|
| 1 (即時) | LP・紹介文を機能訴求に変更 | Web | Week 1 | CTR改善 |
| 2 (Week 2) | 北大の知人・サークルで10人に触ってもらう | 直接 | Week 2-3 | 最初の10人 |
| 3 (Week 4) | note.comで開発日記開始 | note.com | Week 4- | 有機流入開始 |
| 4 (ongoing) | 料理系ニッチコミュニティで存在感 | X/コミュニティ | ongoing | 50→100人 |

### Key insight from research
「フォロワー必須」は反証済み。AudioPenは0フォロワーから$15K/月。
Build in Publicは10日で1,000人の事例あり。ニッチ×一貫性が鍵。

## Delivery Phases

### Phase 1: PWA検証版 + H5ループ — 近い料理の魅力と再訪ループを同時証明

**Period**: 2-3 weeks
**Screens**: ホーム(H5強化), カード詳細, おすすめ一覧, 作りたいリスト, 食材から探す, 島マップ(H5強化)
**H5 features**: 日替わりおすすめ(日付seed), ストリークカウンター, クイック記録FAB
**Data**: 10起点料理を厚く (各3-5近い料理 + 定番バリエーション)
**Tech**: Next.js PWA, localStorage, static JSON, GA4, Vercel free

**What's already built**: v2.8 goals 012-017 completed (tokens, nav, home, made-tracking, ingredients, map, design)

**Remaining work**:
- Revise data model: abolish arrange concept, implement proximity scores
- Revise card display: revert to Notion spec (紹介文2行 + 新食材)
- Add daily recommendation algorithm (date seed + unrecorded priority)
- Add home ingredient chip filter (「今ある食材」→ おすすめフィルター)
- Add streak counter to home screen
- Add quick-record FAB button
- Create dish data via AI pipeline (10 base × 3-5 nearby = 30-50 pairs)
- Write 紹介文 for all pairs (AI draft + owner edit)
- Source photos (free stock priority, AI-generated for gaps)
- Add feedback button for proximity validation
- Production deploy of revised version

**Go criteria**: 知人10-20人テスト (北大ネットワーク活用)
- **2回目開封率 ≥ 20%** (H5検証 — 最重要指標)
- return_visit率 20%+ (8日後再訪)
- 平均保存数 0.5+
- マップ/図鑑閲覧 30%+
- 「この提案どう？」で 👍 70%+

### Phase 2: 継続利用Web版 — アカウント + DB + 一般公開 + 到達可能性改善

**Period**: 3-4 weeks
**Added screens**: 週次ダイジェスト(新規), レベルアップ(新規), LP(機能訴求), オンボーディング改善
**Data**: 30起点料理に拡充, ユーザーによる料理追加機能
**Tech**: Supabase (DB + Auth), Apple/Google Sign-in, PWA notification
**Reachability**: note.com開発日記開始 + 北大ネットワーク10→50人

**Go criteria**: 50-100人一般公開
- 週2回以上のアクティブユーザー率 ≥ 30%
- 作った記録 平均12件以上/ユーザー (ロックイン閾値)
- 週次ダイジェスト開封率 ≥ 40%

### Phase 3: 収益化 — 広告テスト + データ拡充

**Period**: 4-6 weeks
**Features**: 広告テスト(食品系のみ), 料理データ30→50起点, Push通知, 成長レポート(月次)
**Revenue**: 広告テスト開始 (食品・キッチン用品のみ)

**Go criteria**: MAU 100+
- 広告CTR測定
- サブスク設計の判断材料が揃う
- 開発費回収ライン見積もり

### Phase 4: ネイティブアプリ — 課金 + 成長

**Platform**: Expo (React Native) で iOS/Android
**Revenue model**: 月350-500円サブスク (再訪確認後に設計)
- 無料: 基本おすすめ + 広告あり
- 有料: マップ有料エリア開放 + 成長アーカイブ + チャレンジ提案 + 広告なし

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
- ストリーク記録 (途切れさせたくない心理)

### Monetization timeline

1. Phase 1: 完全無料 (コスト≈0円/月)
2. Phase 2: 完全無料 + PWA通知 (コスト≈0円/月, Supabase free tier)
3. Phase 3: 広告テスト (食品系ネイティブ広告のみ。月数千円規模の検証)
4. Phase 4: サブスク (再訪週2回以上が確認されてから設計)
5. 将来: 食品B2Bデータ販売の可能性 (MAU 10,000+, 蓄積1年+)

### Key revenue decision

課金対象を「情報制限」から「成長体験の広さ」に変える:
- NG: レシピ詳細を有料にする (ChatGPTで代替される)
- OK: 島マップの有料エリア開放 / 成長アーカイブ / チャレンジ提案

## Risk Register

| Risk | Severity | Mitigation | Status |
|------|----------|------------|--------|
| H5: 1回見て戻らない | Critical | 日替わり + ストリーク + 週次通知。Phase 1で2回目開封率を計測 | Phase 1で検証 |
| 「近さ」が体感と合わない | Critical | AI候補→オーナー仕分け→知人フィードバックの3段階補正 | Phase 1で検証 |
| 到達可能性 (2/5) | High | note.com + 北大ネットワーク + 機能訴求LP | Phase 2で改善 |
| 10品で「自分の料理がない」 | High | 初期品目を30人アンケートから逆算 | Phase 1で検証 |
| 紹介文が「作りたい」を刺激しない | High | Notion紹介文ルール厳守。AI下書き+人間編集 | Phase 1で検証 |
| 静的JSONの枯渇 (3-4ヶ月) | Medium | Phase 2でユーザー追加機能 | Phase 2 |
| ChatGPT代替 | Structural | 蓄積×可視化×成長実感で差別化 | ongoing |
| 課金率 < 1% | High | 再訪確認前にサブスク設計しない | Phase 4 |
| H2: 記録が続かない | Medium | FAB 2タップ記録 + ストリーク心理 | Phase 1で検証 |

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

### Key implementation changes for Phase 1
1. Revise `data/` structure: add proximity_score, remove arrange/nearby distinction
2. Revise card components: align with Notion spec (紹介文2行 + 新食材)
3. Add daily recommendation algorithm (date seed + unrecorded dishes priority)
4. Add home ingredient chip filter (top area, filters recommendations)
5. Add streak counter component (home screen header area)
6. Add FAB button for quick record (bottom-right, above nav bar)
6. Add feedback mechanism (👍/👎 on cards)
7. Add "作った記録を除外して次を出す" logic
8. Photo assets: source and add to public/
9. PWA manifest + service worker setup

### H5 implementation specifics

**Daily recommendation algorithm:**
```
1. Get today's date as seed
2. Filter: dishes user hasn't recorded yet
3. Prioritize: dishes near user's most recent records
4. Deterministic shuffle with date seed (same recommendation all day)
5. Show top 1 as "今日のとなりごはん"
```

**Streak logic:**
```
1. On each "作った" record, check last_active_date
2. If last_active_date === yesterday → streak_current++
3. If last_active_date === today → no change
4. Else → streak_current = 1
5. Update streak_best = max(streak_best, streak_current)
```

**Level system:**
```
Level = floor(sqrt(total_made_records * 2))
- 0 records → Lv.0
- 2 records → Lv.2
- 8 records → Lv.4
- 18 records → Lv.6
- 32 records → Lv.8
Next level threshold shown: "あと{n}品でLv.{next}!"
```

**Home ingredient filter:**
```
1. Show 5-8 ingredient chips on home (top, scrollable)
2. Chips = frequently used ingredients from user's made_records
   + common staples (卵, 鶏肉, 豚肉, 豆腐, etc.) for new users
3. User taps chips for "今ある食材"
4. Daily recommendation + おすすめ list filters to dishes
   where new_ingredients ⊆ available_ingredients
5. If no match: show nearest match with "あと{ingredient}があれば作れる"
6. available_ingredients persisted in UserState (sticky between sessions)
```

## Name Strategy

Current: となりごはん (Tonari Gohan)
Decision: Phase 2のLP作成時に再検討。

- Phase 1-2（機能訴求段階）: 機能が伝わる名前が有利
  - 候補: つぎごはん, レパ活, etc.
- Phase 3+（感情訴求段階）: 記憶に残る名前が有利
  - 「となりごはん」の「隣（となり）」は「近い料理」のメタファーとして有効

名前変更はピボットCの「機能訴求メッセージ」と合わせて検討すると効果的。

## References

- Validation: docs/validations/val-003-tonari-gohan.md (18/25 Conditional Go)
- Validation (legacy): docs/validations/val-001-tonari-gohan-revalidation.md (14/20)
- Spec v2.7: docs/specs/tonari-gohan-spec-v2.7.md
- Spec v2.8 draft: docs/specs/tonari-gohan-spec-v2.8-draft.md
- Design tokens: mocks/design-tokens.md
- Notion方針整理メモ: https://app.notion.com/p/377415560fcf814da47cf4ffd0626a5a
- Notionおすすめ画面仕様書: https://app.notion.com/p/8917b81f56d149cab5f26830d7276ea2
- Decision 001-006: docs/decisions/
