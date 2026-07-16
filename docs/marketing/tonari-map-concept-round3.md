# マップ コンセプト画像 round3 — 白地図 vs 地形図 vs 古地図

spec-030 v2「地図」節の実装前判定。5案全滅（路線図・星座・庭・街・放射グラフ、2026-07-03）を受けた仮説転換ラウンド。

## 判定の目的

撤退線判定: **「眺めたい・シェアしたい」と思えなければ v1 は地図なし**（spec-030 §地図末尾）。round3 の 3 枚を並べて、少なくとも 1 枚がこの基準を通過するか。全滅なら地図なし方向に確定し、成長サマリ 1 行で代替する。

## 4条件（オーナー言語化・変更不可）

1. 自分の形をしている
2. 時間が刻まれている
3. 見るたび発見がある
4. 絵として美しい

## 5案の失敗の再診断（round1-2）

`mocks/concept/gpt/`（metro / constellation）、`mocks/concept/gpt2/`（garden / town / web）。5 案の共通反省: **様式から発想してデータを後付けした**（乗り物→星座→植物→建物→抽象図形）。正しい順序は逆で、データの形（自分の料理が中心・方向を持たない・近いものが近くにある）から先に決めて様式の皮をかぶせる。

具体の却下理由:
- 路線図 = 線が「方向・進路の固定」を暗示 → レパートリーの縦横無尽性と矛盾
- 星座 = 夜空のトーンがアプリの温かみと合わない、眺めたいと思えない
- 庭 = 料理と植物の対応が恣意的（唐揚げがなぜ橙の花？）、覚えにくい
- 街 = 店舗のバリエーションが料理特徴と結びつかず装飾止まり
- 放射グラフ = 星座に近い抽象さ、自分の形が伝わらない

## データの土台（変更不可・ADR-009）

- 近さスコアの2次元投影で配置。軸に意味なし、近いものが近くにある
- 地形は事前計算・固定出荷（ユーザー利用中に動かない）
- 描くのは自分のレパートリー+スコア圏内のフロンティア。全カタログ 150-200 皿ではない
- 探索の 2 機構: 点灯（調味料「持ってる」で解放）+ 海岸線バッジ（あと 1 食材）

## 3 仮説

すべて A5〜正方形 1024×1024、俯瞰、無地〜地の紙質のみ。

### A: 白地図の塗り絵（spec-030 v2 仮置き方針）

**仮説**: 成長可視化を「隠す→現す」ではなく「線画→彩色」で表現すれば、霧・fog of war の陰鬱さを避けつつ「時間が刻まれる」を成立させられる。

```
An overhead cartographic illustration of a personal cookbook world map.
All dishes are drawn as simple hand-inked line-art icons on cream paper,
grouped into 4-5 loose islands separated by faint water. About 15-20 dishes
are visible in the center-left area, filled with soft watercolor color and
tiny food photographs, while the surrounding ~40 dishes remain uncolored
line-art outlines with their names in small handwritten Japanese labels.
Two or three of the line-art dishes near the colored ones have a small
circular gold coastline badge (meaning "one ingredient away"). No roads,
no railways, no constellations, no plants growing out of dishes, no
buildings. The layout does not suggest any direction or progression —
dishes are placed by similarity, not by sequence. Warm cream paper texture,
faint compass rose in the corner as decoration only. Aesthetic reference:
old hand-drawn recipe journals, illustrated field guides, botanical maps
of the 19th century — but for home cooking. Square 1024x1024.
```

### B: 地形図（等高線ベース）

**仮説**: 系統=大陸、皿=標高点や集落。「自分の版図」を色面ではなく高低差で表現すれば、彩色皿の写真依存を消せる（写真様式が未確定でも成立）。

```
An overhead topographic map illustration of a personal cooking territory.
The map shows 4-5 continents (cuisine families: Japanese / Chinese-Korean /
Western / Ethnic / etc.) rendered with subtle contour lines and muted
earth-tone shading. Each continent has 10-20 small settlement markers
(dishes) placed by similarity, with tiny Japanese labels. About 15-20
settlements in the user's territory are marked with warm ochre filled
circles and a slightly bolder label — the rest are hollow circles with
thinner labels. Two or three hollow markers adjacent to filled ones have
a tiny gold outline (coastline badge). The map has faint elevation gradients
around clusters of filled markers, as if the "known" area rises slightly
from the surrounding plane, giving a sense of a personal territory being
mapped. No roads, no explicit paths between markers. Aesthetic reference:
old survey maps, USGS topographic sheets, Tolkien-style hand-drawn maps —
but for home cooking, not fantasy. Cream paper with subtle grid, small
compass rose in the corner. Square 1024x1024.
```

### C: 古地図（大航海時代スタイル）

**仮説**: 5 案（乗り物・天体・植物・建物・抽象図形）の外側の領域。標本箱・古地図・押し花帳のカテゴリから、**古地図**を選ぶ。「未知の海」「発見された島」の文法が「見るたび発見がある」に直結する。

```
An illustration in the style of a 17th-century hand-drawn sea chart, but
mapping a home cook's dish repertoire instead of geography. The composition
shows a warm parchment background with 4-5 named islands (cuisine families
in playful pseudo-Latin), each holding 10-20 tiny illustrated dishes.
About 15-20 dishes on the two nearest islands are drawn in full color with
small food photographs pasted in, while the rest are drawn as pale sepia
outline sketches with handwritten labels. Two or three sepia outlines near
the colored ones have a tiny compass-rose stamp beside them (coastline
badge). Between islands is soft blue-gray ocean with a faint stylized
"sea monster" doodle in the corner and a decorative compass rose. No modern
roads, no railways, no constellations. The layout does not suggest a
sequential journey — islands sit as neighbors, not as a route. Aesthetic
reference: Willem Blaeu sea charts, illustrated recipe manuscripts, Studio
Ghibli map illustrations. Warm and inviting, not gloomy or gothic. Square
1024x1024.
```

## 診断軸（3 秒判定）

各画像に対してオーナーが 4 条件+以下を確認:

- **主語がはっきりしている**（何のアプリの画像か 3 秒で伝わる）
- **色面の階層がある**（彩色皿と線画皿のコントラストが機能している）
- **方向性を暗示しない**（矢印・路線・道・時系列の階段状配置がない）
- **AI 臭チェックリスト不該当**: 等サイズグリッド反復 / バッジ多用 / 中央揃え一辺倒 / 装飾的シンボルの乱立

## 撤退ルール

- **round3 の予算 = 3 仮説（A/B/C）**。round4（イラスト）の予算枠と独立
- 3 枚とも 4 条件を満たさず「眺めたい・シェアしたい」に到達しなければ、**マップ v1 なし方向を確定**（spec-030 § 撤退線の発動）
- 少なくとも 1 枚が通過したら、その方向で追加調整（配色・密度・ズーム段）を round4-map として実施

## 保存先

`tonari-app/mocks/concept/gpt3/map-whitemap.png`（A）
`tonari-app/mocks/concept/gpt3/map-topographic.png`（B）
`tonari-app/mocks/concept/gpt3/map-oldchart.png`（C）

## 2026-07-08 A/B/C 判定結果

- **A 不採用**: プロンプトが効かず、全皿線画のまま（「作った皿だけ彩色」が反映されなかった）。案の核が実装されていないため案自体の評価不能
- **B 部分採用**: 「自分の版図」の可視化は3案で最強。ただし探索誘発が弱い（●が多すぎて○=未挑戦と◉=あと1食材が埋没、系統境界のブリッジ皿が強調されていない、ズーム段がない）
- **C 不採用**: 個別料理をイラストで描く方式は 150-200 皿+ユーザー追加で構造的に破綻。「地図である必然性」への疑義も残る

## D/E 追加仮説（round3 継続）

Bの探索誘発を強化する2方向を追試。両方失敗なら**マップ v1 なし方向を確定**（spec-030 § 撤退線）。

### D: 地形図 + 白地図彩色 + 古地図紙質（B+C 混合）

**仮説**: Bの3状態塗り分け構造を骨に、未挑戦○を青系フロンティアとして強調+古地図の紙質で観賞価値を底上げ。料理絵はなしの地図記号のみ。

```
An overhead topographic map on aged parchment paper, mapping a home cook's dish repertoire.
The map shows 5 continents (Japanese / Chinese-Korean / Western / Ethnic / Sweets & Bread)
rendered with subtle brown contour lines and muted earth-tone shading. Each continent has
15-20 small dish markers with tiny Japanese labels. THREE MARKER STATES with strong visual
hierarchy:
(1) MASTERED dishes: warm ochre filled circles, bold black label, slightly larger — sparse,
    ~10-15 total across the whole map
(2) FRONTIER dishes: pale blue-teal hollow circles with dotted outlines, thinner labels in
    faded ink — these should feel like "unexplored coastline that beckons", visually
    prominent as a group, ~40 total. NOT埋没.
(3) ONE-INGREDIENT-AWAY dishes: hollow circles with a bright gold radiant halo/glow around
    them, as if lit from within, ~5-8 scattered across frontier zones. These are the
    invitation to explore — must be immediately eye-catching.
The parchment has visible fiber texture, subtle water stains at edges, a decorative compass
rose in the upper right (Willem Blaeu style), and a small hand-drawn sea monster silhouette
in one corner as playful ornament. Bottom-left has a small legend box with the three marker
states illustrated. NO food illustrations — the map speaks in cartographic symbols only.
Aesthetic: 17th-century sea chart meets modern topographic survey. Warm, inviting, worth
framing. Square 1024x1024.
```

### E: B のズームアップ版（近景 = フロンティアが押し寄せる感）

**仮説**: 遠景で「自分の版図」を見せるBに対し、近景で「次はどこへ行こう」の感情そのものを絵として立ち上がらせられるか。

```
An overhead topographic map, zoomed in to show one small region of a personal cooking
territory — as if looking at a detailed section of a larger map. The frame shows ~25 dish
markers arranged by similarity on faintly contoured warm earth-tone terrain. THREE MARKER
STATES:
(1) MASTERED dishes: 4-5 warm ochre filled circles in the center-left with clear bold Japanese
    labels (e.g., 肉じゃが, 味噌汁, 卵焼き, 唐揚げ, カレー)
(2) FRONTIER dishes: 15-18 pale blue-teal hollow circles with dotted outlines, arrayed
    around and beyond the mastered cluster — these should visually dominate the frame,
    creating a "sea of possibilities pressing in" feeling. Faded Japanese labels
    (e.g., 麻婆豆腐, グラタン, ガパオライス, プルコギ, ハンバーグ, オムライス, タコライス, ピビンパ,
    青椒肉絲, 回鍋肉, パエリア, リゾット, タイカレー, etc.)
(3) ONE-INGREDIENT-AWAY dishes: 2-3 hollow circles with bright gold radiant glow, positioned
    just past the mastered cluster's edge. A tiny hand-inked speech bubble points to one,
    saying "あと1つ食材があれば" in small handwritten Japanese. These are the invitation.
Subtle terrain contour lines run through the region. A faint tiny "you are here" marker
sits at the center of the mastered cluster. Top-left corner has a small inset showing where
this zoomed region sits in the larger world map (a tiny overview thumbnail). Warm parchment
texture, aged look, but the frontier area feels bright and open, not dark or ominous.
Aesthetic: field notebook + topographic map, personal and exploratory. Square 1024x1024.
```

## 保存先（D/E 追記）

`tonari-app/mocks/concept/gpt3/map-hybrid.png`（D）
`tonari-app/mocks/concept/gpt3/map-zoom.png`（E）

## D/E 判定（2026-07-08 続き）

- **方向確定**: D=遠景 / E=近景 の2階層で v1 マップ採用。撤退線は回避
- **質の課題**: 「開きたくなる／共有したくなる」の閾値未達
  - 地質図寄りで感情的な引き込みが弱い（●の中がフラット、料理を暗示しない）
  - 装飾要素の密度と配置が平板、細部の意外性がない
  - 色温度が羊皮紙一色で統一されすぎ、色相の豊かさがない
  - タイポの階層が単調で「観賞作品」の顔になっていない
  - E は中央●が「団地の丸」に見え、○は「未着手のTodo」に見える

## D'/E' 追加仮説（round4-map、質の底上げ）

3方向の指示強化:
1. **参照作家を明示**: 安野光雅「旅の絵本」/ Nate Padavick (They Draw & Cook) / Studio Ghibli map illustrations
2. **細部密度**: 山影に小動物・旅人シルエット、海に船・魚・波紋、大陸内に小さな家・木・畑
3. **料理の暗示復活**: ●の中に淡い料理シルエット（グラデーション）、○の縁に淡いグロー、海岸線に食材の欠片（唐辛子・ハーブ・貝殻）

### D': 遠景改善（Dの質底上げ）

```
An overhead illustrated world map on aged parchment, mapping a home cook's dish repertoire.
Aesthetic references, in this order of priority: (1) Mitsumasa Anno's "Anno's Journey" picture
book maps — soft watercolor, tiny scenes hidden throughout, gentle Japanese sensibility;
(2) Studio Ghibli map illustrations from Kiki's Delivery Service and Howl's Moving Castle —
warm color palette, hand-painted feel; (3) Nate Padavick's "They Draw & Cook" illustrated
food maps — playful ingredient icons integrated into terrain.

The map shows 5 continents (Japanese / Chinese-Korean / Western / Ethnic / Sweets & Bread)
with RICH VARIED COLOR PALETTES — not a single earth-tone: Japanese=soft moss green with
pale pink cherry blossom accents, Chinese-Korean=warm terracotta red with saffron highlights,
Western=butter yellow with sage green, Ethnic=deep spice-orange with turmeric gold,
Sweets & Bread=warm rose-pink with cream. Each continent has its own coloristic personality.

THREE MARKER STATES (visual hierarchy must be immediate):
(1) MASTERED (~10-15 across all continents): warm ochre filled circles with a FAINT DISH
    SILHOUETTE visible inside each (a tiny hint of the actual dish — a curry pot outline,
    a bowl, a plate — rendered as translucent watercolor wash inside the circle). Bold hand-
    written Japanese label beneath, slightly larger typography.
(2) FRONTIER (~40 total): pale blue-teal hollow circles with dotted outlines, with a very
    SUBTLE OUTER GLOW that makes them feel inviting rather than blank. Faded handwritten
    labels.
(3) ONE-INGREDIENT-AWAY (~5-8): hollow circles with BRIGHT GOLDEN RADIANT HALO/GLOW as if
    lit from within — must be the most eye-catching element on the entire map.

DETAIL DENSITY (this is critical — the map must reward close inspection):
- Small hand-drawn scenes scattered throughout: tiny travelers walking coastal paths, small
  animals (a fox in the Japanese continent's forest, a panda near the Chinese-Korean coast,
  sheep in the Western continent's meadows), tiny fishing boats between islands, seabirds
  in the sky
- Food fragments as decorative scatter along coastlines and paths: small chili peppers,
  herbs, shells, wheat sheaves, mushrooms — rendered as tiny hand-drawn ornaments
- Small terrain features inside each continent: little hills, groves of trees, streams,
  a lighthouse, a distant mountain range
- Between continents: soft blue-gray sea with wave patterns, a stylized sea creature
  (whale or friendly sea serpent) as playful ornament, a small sailing ship

TYPOGRAPHY hierarchy:
- Title top-left in hand-lettered display serif: "わが家の料理地図"
- Continent names in decorative handwritten script with small decorative flourishes
- Dish labels in gentle hand-printed Japanese, subtle enough not to overwhelm
- Small tagline "食は、旅である。" as a subtle ribbon or handwritten note

Compass rose top-right in Willem Blaeu style. Legend box bottom-left explaining the three
marker states with tiny illustrated examples. Warm parchment texture with visible fiber, edge
water stains, occasional tea-colored spots for age. The overall feeling: this is not a
functional map but a beloved journal page you'd frame and put on a wall.

Square 1024x1024.
```

### E': 近景改善（Eの質底上げ）

```
An overhead illustrated zoomed-in view of one region of a personal cooking territory, drawn
in the style of Mitsumasa Anno's picture book maps meets Studio Ghibli's Kiki's Delivery
Service map illustrations. Warm hand-painted watercolor feel, soft varied color palette
(NOT monochrome parchment), gentle Japanese sensibility, tiny scenes hidden throughout for
close inspection.

The frame shows a small region with ~25 dish markers on softly contoured terrain that has
subtle color variation — warm ochre where the user's mastered dishes cluster, cooler pale
sage-blue in the surrounding frontier area. A tiny inset map top-left shows "料理の世界地図"
with a red rectangle marking "this region" (現在地付近を拡大中).

THREE MARKER STATES with clear visual weight:
(1) MASTERED (4-5 dishes in the center cluster): warm ochre filled circles, each containing
    a FAINT WATERCOLOR SILHOUETTE OF THE ACTUAL DISH (肉じゃが shows a bowl with root
    vegetables outlined, 味噌汁 shows a small bowl with rising steam, 卵焼き shows layered
    rectangles, 唐揚げ shows scattered chunks, カレー shows a plate with mound). Bold black
    handwritten labels. A small red flag with 現在地 marker sits between them.
(2) FRONTIER (18-20 dishes): pale blue-teal hollow circles with dotted outlines, with a very
    SUBTLE GLOW around the edge — these should feel like "an invitation, not a checklist".
    Faded handwritten labels: 麻婆豆腐, グラタン, ガパオライス, プルコギ, ハンバーグ, オムライス,
    タコライス, ピビンパ, 青椒肉絲, 回鍋肉, パエリア, リゾット, タイカレー, ラザニア, 豚の角煮,
    フォー, ブイヤベース, 酢豚, etc.
(3) ONE-INGREDIENT-AWAY (2-3 dishes): hollow circles with BRIGHT GOLDEN RADIANT HALO,
    positioned just past the mastered cluster's edge. A small hand-inked speech bubble
    points to ラザニア, saying "あと1つ食材があれば" in casual handwritten Japanese.

DETAIL DENSITY (the region must reward close inspection):
- Tiny travelers walking narrow paths connecting the mastered cluster to frontier dishes —
  as if the user's future journey is subtly implied
- Small hand-drawn scenery scattered around: little trees, mushrooms, wildflowers, a small
  stream winding through, distant mountain silhouettes at the frame edges
- Food fragments as decorative scatter: a tiny chili pepper near an ethnic dish, a small
  herb sprig near a Western dish, a mushroom near a Japanese dish
- Small hand-drawn birds in the sky, a squirrel near a tree, a rabbit near the meadow

TYPOGRAPHY:
- Handwritten tag "料理は、冒険だ。味わった数だけ、地図は広がる。" as a small paper note pinned
  to the map, positioned bottom-right
- Small legend box top-left below the inset map showing the three states
- Small scale bar bottom-left, compass rose small in lower-left

Color palette: warm ochre center, cool sage-blue frontier, muted forest green terrain
variations, soft cream parchment as base — but NOT flat, with tonal variety throughout.
Feels like a hand-painted picture book spread you want to keep looking at.

Square 1024x1024.
```

## 保存先（D'/E' 追記）

`tonari-app/mocks/concept/gpt3/map-hybrid-v2.png`（D'）
`tonari-app/mocks/concept/gpt3/map-zoom-v2.png`（E'）

## D'/E' 判定（2026-07-08 続き）

- **E' 採用方向**: 中央●5つが主役として明確に立っていて階層が生きている、細部密度も装飾ではなく機能している。近景はこれで v1 実装可能ライン
- **D' 不採用**: 「うるさい・料理に目がいかない」。5大陸を等価に装飾したため主役（料理●）が背景に沈んだ。「見るたび発見」を装飾で満たそうとしたのが構造的誤り
- **仮説修正**: 「また見たい」の生成源は装飾ではなく**自分の変化**（新しく昇格・新しく光った皿）。静的画像で「発見」を作ろうとすると必ず装飾過多になる。遠景はこの仮説修正を反映した F 案を試す

## F 追加仮説（round4-map 継続、背景ミニマル・料理主役）

背景の建物・動物・旅人・食材の飾りを全排除し、料理●を主役に返す。装飾はコンパスローズ・凡例・タイトルのみ。

### F: 遠景ミニマル

```
An overhead illustrated world map on aged parchment, mapping a home cook's dish repertoire.
The design philosophy is RESTRAINT and CLARITY: the dishes are the subject, everything else
supports.

The map shows 5 continents (Japanese / Chinese-Korean / Western / Ethnic / Sweets & Bread)
as simple flat organic shapes with only subtle color fills — each continent has its own
soft color: Japanese=soft moss green, Chinese-Korean=warm terracotta red, Western=butter
yellow, Ethnic=deep spice-orange, Sweets & Bread=warm rose-pink. NO buildings, NO animals,
NO travelers, NO food fragments scattered on terrain, NO windmills or lighthouses or castles,
NO decorative scenery of any kind on the continents. Just clean colored land shapes.

The sea between continents is uniform soft blue-gray with the gentlest wave pattern — no
sea creatures, no ships, no islands, no compass details in the water.

THREE MARKER STATES (these are now the visual protagonists):
(1) MASTERED (~10-15 across all continents): warm ochre filled circles, LARGER than in
    previous versions (about 8% of continent width each), each containing a CLEAR
    watercolor illustration of the actual dish — a bowl of miso soup with rising steam,
    a plate of karaage chicken chunks, a curry plate, a small tonkatsu on a plate, etc.
    The illustrations should be immediately readable (not faded, not abstract). Bold
    handwritten Japanese label directly beneath.
(2) FRONTIER (~30 total): pale blue-teal hollow circles with dotted outlines, SMALLER
    than mastered (about 5% of continent width), quiet and secondary. Simple faded
    handwritten labels. No glow — they should feel like a quiet possibility, not compete
    with mastered dishes.
(3) ONE-INGREDIENT-AWAY (only 3-4 total across all 5 continents): hollow circles with
    BRIGHT GOLDEN RADIANT HALO, positioned as clear invitations. Sparse — these are
    special, not decorative.

TYPOGRAPHY: Title top-left "わが家の料理地図" in hand-lettered display serif with a small
"食は、旅である。" tagline. Continent names in gentle handwritten script inside each
continent, no decorative flourishes. Dish labels in clean hand-printed Japanese.

Small compass rose top-right (simple, elegant, not ornate). Legend box bottom-left showing
the three marker states with tiny examples. Warm parchment texture with subtle fiber and
soft edge shading — the parchment is the canvas, not a decorated surface.

Aesthetic reference: Rifle Paper Co. illustrated maps (clean, elegant, subject-first),
Japanese regional tourism maps (simple color-coded regions), the illustration style of
"Guri and Gura" picture books (food as protagonist). The overall feeling: a clean,
elegant map where the dishes are the story and everything else stays out of the way.

Square 1024x1024.
```

## 保存先（F 追記）

`tonari-app/mocks/concept/gpt3/map-minimal.png`（F）

## F 判定（2026-07-08 続き）

- **F 不採用**: 「ひどい・ただのカタログ」。装飾を全排除したら地図でも発見でもなく、料理カタログ/メニュー表になった
- **副作用の言語化**: (1) 「マップ」感消失（位置=近さの意味が消えた）(2) 等サイズグリッド反復のAI臭 (3) 上下左右対称構図 (4) ○フロンティアが薄すぎ (5) 座標に意味が読めない
- **仮説の再修正**: 装飾を全排除するのは行き過ぎ。**「装飾は最小限だが1大陸に1個の象徴だけ残す」中間狙い**と、**「地形図の意味的骨格+料理イラスト」の融合案**の両方を試す

## G/H 追加仮説（round4-map 継続）

### G: F 改善（対称崩し・意味配置・○強調・装飾は象徴1個ずつ）

**仮説**: F の骨格（大陸単色+料理イラスト主役）を維持しつつ、カタログ化の副作用を修正する。

```
An overhead illustrated world map on aged parchment, mapping a home cook's dish repertoire.
Design philosophy: dishes are the protagonist, but the map must feel like a MAP, not a
catalog page. Restraint AND meaningful geography.

The map shows 5 continents (Japanese / Chinese-Korean / Western / Ethnic / Sweets & Bread)
as flat colored organic shapes with STRONGLY VARIED SILHOUETTES — each continent must have
a distinctly different shape (not all clouds/blobs): Japanese=a long curved archipelago
shape running vertically; Chinese-Korean=a large angular landmass with a peninsula extending
south; Western=a rounded compact continent with bays; Ethnic=an elongated horizontal landmass
with island fragments; Sweets & Bread=a small round island cluster. NOT the same blob repeated
5 times. Colors: Japanese=soft moss green, Chinese-Korean=warm terracotta red, Western=butter
yellow, Ethnic=deep spice-orange, Sweets & Bread=warm rose-pink.

The 5 continents should be ARRANGED ASYMMETRICALLY — not in a neat grid. Some overlap in
proximity, some far apart, some rotated. Break the top-left / top-right / center / bottom-left
/ bottom-right symmetry that ruins the previous version.

MEANINGFUL PLACEMENT WITHIN EACH CONTINENT: dishes are placed by similarity, not in a grid.
Rice-based dishes cluster together, soup-based dishes cluster elsewhere, fried dishes cluster
in a third area. The clustering should be visible — you can see "the rice country" and "the
noodle country" within a continent. NO evenly spaced grid layouts.

MINIMAL BUT MEANINGFUL DECORATION: exactly ONE symbolic icon per continent, tiny and placed
naturally as if it belongs — Japanese has a single small Mt. Fuji silhouette at the top,
Chinese-Korean has a single tiny great wall section along one edge, Western has a single small
church spire, Ethnic has one small palm tree, Sweets & Bread has one small croissant-shaped
hill. NO animals, NO travelers, NO food fragments scattered on terrain, NO ships or sea
creatures. ONE symbol per continent, that's it.

THREE MARKER STATES:
(1) MASTERED (~10-12 across all continents): warm ochre filled circles, LARGE (about 7% of
    continent width), each containing a CLEAR watercolor illustration of the actual dish.
    Bold handwritten Japanese label.
(2) FRONTIER (~25-30 total): pale blue-teal hollow circles, MEDIUM SIZE (about 5% of
    continent width — NOT tiny, they need presence), with dotted outlines and a very SUBTLE
    outer glow so they read as "possibility" not "empty slot". Faded handwritten labels.
    These should feel like real presence, not afterthoughts.
(3) ONE-INGREDIENT-AWAY (only 3-4 total): hollow circles with BRIGHT GOLDEN RADIANT HALO.
    Sparse and precious.

TYPOGRAPHY: Title top-left "わが家の料理地図" hand-lettered display serif, tagline
"食は、旅である。". Continent names in gentle handwritten script. Dish labels clean.
Small compass rose top-right. Legend bottom-left.

Sea between continents: soft blue-gray with minimal wave pattern. NO ornaments in the water.

Aesthetic: Rifle Paper Co. maps + Japanese regional tourism poster maps + Anno Mitsumasa's
restraint. Elegant, subject-first, but unmistakably a MAP with geography, not a menu.

Square 1024x1024.
```

### H: 地形図骨格 + 料理イラスト融合（B×F）

**仮説**: B の等高線・地形の意味的骨格を残し、●の中に F の料理イラストを埋める。地形図の「自分の版図」感 + 料理イラストの「食べ物っぽさ」の両立。

```
An overhead topographic map illustration on aged parchment, mapping a home cook's dish
repertoire. This combines two ideas: the semantic geography of a real topographic map (dishes
placed by similarity, terrain that means something), AND clear watercolor dish illustrations
inside the markers so food remains the visual subject.

The map shows 5 continents (Japanese=soft moss green, Chinese-Korean=terracotta red,
Western=butter yellow, Ethnic=spice-orange, Sweets & Bread=rose-pink) rendered with SUBTLE
CONTOUR LINES (thin, low-contrast brown lines like a topographic survey map) that create
a sense of terrain and elevation. Each continent has distinct silhouette shapes (NOT identical
blobs) arranged asymmetrically on the page.

MEANINGFUL GEOGRAPHY: dishes cluster by similarity within each continent (rice dishes together,
soup dishes together, etc.). The contour lines flow around clusters, as if the "known area"
rises like a hill from the surrounding plain. This creates the sense that geography has meaning
without needing decorative props.

THREE MARKER STATES:
(1) MASTERED (~10-12 total): warm ochre filled circles, LARGE (about 7% of continent width),
    each containing a CLEAR watercolor illustration of the actual dish (miso soup, karaage,
    gyoza, ramen, curry, hamburger, omelet-rice, green curry, pancake, cheesecake, etc.).
    Bold handwritten Japanese label.
(2) FRONTIER (~25-30 total): pale blue-teal hollow circles, MEDIUM SIZE (about 5% of
    continent width), with dotted outlines and subtle outer glow. Faded handwritten labels.
(3) ONE-INGREDIENT-AWAY (3-4 total): hollow circles with BRIGHT GOLDEN RADIANT HALO. Sparse.

NO buildings, NO animals, NO travelers, NO scattered food fragments, NO sea creatures. The
ONLY decoration is: (a) the contour lines themselves (they ARE the decoration and the meaning
simultaneously), (b) a small compass rose top-right, (c) a legend box bottom-left, (d) a small
scale-bar. The parchment texture and contour lines together should create richness without
adding scenery props.

TYPOGRAPHY: Title top-left "わが家の料理地図" with tagline "食は、旅である。". Continent names
in gentle handwritten script. Dish labels clean handwritten Japanese.

Sea between continents: soft blue-gray with faint wave pattern, no ornaments.

Aesthetic: USGS topographic survey map meets Anno Mitsumasa picture book — geographic meaning
achieved through terrain rendering, not scenery decoration. Food illustrations inside markers
provide the emotional pull.

Square 1024x1024.
```

## 保存先（G/H 追記）

`tonari-app/mocks/concept/gpt3/map-refined.png`（G）
`tonari-app/mocks/concept/gpt3/map-topo-dish.png`（H）

## G/H 判定とオーナー保留（2026-07-08）

- G/H で「作った料理イラストが解放される」表現と非対称大陸は好評価。ただし「これが受ける未来が想像つかない・観賞用としてはみるに堪えない」でオーナー保留。撤退線発動圏内のまま次セッションへ。

## 判定形式の変更（2026-07-12、round: map-motion）

- **決定**: 静的画像ラウンド終了。判定器を fake-data 動きプロトタイプに変更（decision: `docs/decisions/2026-07-12-tonari-map-motion-judgment.md`）
- **根拠**: F/D'/G/H の探索で「また見たい」の生成源＝自分の変化（時間）と確定済み。静的画像はこれを原理的に写せず、撤退線の判定器として不成立だった
- **プロト構成**: E'（承認済み画質）を土台に固定し、変化レイヤーのみ SVG/JS で追加——W1: 回鍋肉上陸（彩色ブルーム）/ W2: オイスターソース購入→青椒肉絲・酢豚が金色点灯 / W3: 青椒肉絲上陸 / W4: 唐揚げ十八番昇格（一度だけ発声の原則準拠）/ 際の伸び（魯肉飯・担々麺出現）/ 最後に H 俯瞰へズームアウト
- **成果物**: `mocks/concept/motion/map-motion-proto.html`（要ローカルサーバ or 同階層画像）/ `map-motion-proto-standalone.html`（単体版、画像埋込 960KB）
- **判定基準**: この変化の早回しで「眺めたい・シェアしたい」が立つか。立たなければ撤退確定（成長サマリ1行、v1.x で実データ再訪）
- **既知の継ぎ目**: 近景E'と俯瞰Hで習得皿のデータが不整合（別々の既存素材のため）。判定対象は変化の感情であり、整合は実装時に解消
