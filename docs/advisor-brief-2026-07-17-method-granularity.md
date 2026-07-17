# Advisor brief: primary_method granularity in the proximity scorer

Spec: `docs/specs/spec-032-catalog-mass-production.md`
Scorer: `scripts/proximity_281.py`
Related decision (out of scope, do not revisit): `docs/decisions/2026-07-17-tonari-proximity-directionality.md`

## Scoring mechanism (facts)

`score = 0.50 * seasoning_dice + 0.33 * ingredient_dice + 0.17 * method_dice`
(`scripts/proximity_281.py:31,175`; ingredient axis is IDF- and role-weighted, main=1.5/coat=1.0/sub=0.7/bind=0.6).

A recommendation is gated on `score >= 0.30 AND len(evidence) >= 2` (`scripts/proximity_281.py:142-155`).
`evidence(a, b)` returns up to three grounds: `main:<shared main ingredient>`, `method:<shared primary_method>`,
and `pattern:<shared seasonings>×<shared primary_method>` (only added when `primary_method` also matches).
Each dish has exactly one `primary_method` string (e.g. `焼く`, `煮る`, `炒める`, `茹でる`), assigned upstream
in `data/vocab/dish-v4-281.json`. There is no finer sub-category under `焼く`.

## Four flagged pairs from the human review pass (facts, raw data)

Manual review of the 75 gate-changed TOP1 recommendations (`docs/proximity-281-report.md` §5) flagged 4 pairs
as questionable out of the human's own read of the food logic. Raw ingredient/seasoning data for each dish:

**だし巻き卵 → ちくわの磯辺焼き** (score 0.31, evidence: `method:焼く` / `pattern:醤油×焼く`)
- だし巻き卵: ingredients=[卵(main)], seasonings=[だし,みりん,薄口醤油], methods=[焼く], primary_method=焼く
- ちくわの磯辺焼き: ingredients=[ちくわ(main),青のり(sub),小麦粉(coat)], seasonings=[醤油], methods=[焼く], primary_method=焼く

**サムギョプサル → 鯛の塩焼き** (score 0.31, evidence: `method:焼く` / `pattern:塩×焼く`)
- サムギョプサル: ingredients=[豚バラ肉・厚切りブロック(main),サンチュ(sub),にんにく(sub),えごまの葉(sub)], seasonings=[ごま油,コチュジャン,塩], methods=[焼く], primary_method=焼く
- 鯛の塩焼き: ingredients=[鯛(main)], seasonings=[塩], methods=[焼く], primary_method=焼く

**あんかけ焼きそば → ガパオライス** (score 0.30, evidence: `method:焼く` / `pattern:オイスターソース×焼く`)
- あんかけ焼きそば: ingredients=[豚肉(sub),イカ(sub),白菜(sub),にんじん(sub),きくらげ(sub),片栗粉(thicken),中華蒸し麺(base)] — no `main`-role ingredient tagged, seasonings=[オイスターソース,醤油,鶏がらスープ], methods=[焼く,炒める,煮る], primary_method=焼く
- ガパオライス: ingredients=[ごはん(base),鶏ひき肉(main),バジル(main),パプリカ(sub),玉ねぎ(sub),卵(sub)], seasonings=[にんにく,オイスターソース,ナンプラー,唐辛子], methods=[炒める,焼く], primary_method=焼く

**ポテトサラダ ⇄ 中華春雨サラダ** (score 0.42, evidence: `method:茹でる` / `pattern:酢×茹でる`)
- ポテトサラダ: ingredients=[じゃがいも(main),きゅうり(sub),にんじん(sub),玉ねぎ(sub),ハム(sub),ゆで卵(sub)], seasonings=[マヨネーズ,塩こしょう,酢], methods=[茹でる,和える], primary_method=茹でる
- 中華春雨サラダ: ingredients=[春雨(main),きゅうり(sub),ハム(sub),錦糸卵(sub)], seasonings=[ごま油,砂糖,酢,醤油,鶏がらスープの素], methods=[茹でる,和える], primary_method=茹でる

## Working hypothesis (not yet validated)

Three of the four (だし巻き卵/ちくわ, サムギョプサル/鯛, あんかけ焼きそば/ガパオライス) share a pattern:
`primary_method=焼く` is a single coarse bucket covering very different hand-techniques (rolling an omelette
in a makiyaki pan, coating and pan-frying a fish-paste tube, table-grilling sliced pork belly, salt-grilling a
whole fish, wok-frying noodles then ladling a starch-thickened sauce over them). Combined with one shared
common seasoning token (醤油, 塩, or オイスターソース — all high-frequency across the 281-dish catalog), this
produces a `pattern:` evidence string that looks like two independent grounds but may actually be one weak
signal (common seasoning) riding on an over-broad method bucket.

The fourth pair (ポテトサラダ/中華春雨サラダ) looks different: no `main`-role ingredient match, but both dishes
share two `sub`-role ingredients (きゅうり, ハム) and an identical method *set* (茹でる+和える, not just
primary_method). The evidence function only ever credits `main`-role matches or primary_method matches — it
never credits sub-role ingredient overlap. This pair might be a case of the evidence function under-crediting
a genuinely reasonable connection, not a case of the scorer over-crediting a bad one.

## Question for the advisor

1. Is the "焼く is too coarse" diagnosis for the first three pairs correct, or is there a simpler/different
   explanation in the data above?
2. If the diagnosis holds, what is the minimal correct fix — split `primary_method` into finer buckets,
   discount common seasonings (weight by corpus frequency beyond the existing IDF, or exclude a short
   stoplist like 塩/醤油 from `pattern:` credit specifically), require 2+ shared seasoning tokens for
   `pattern:` evidence, or something else? Give the smallest change that would plausibly fix these three
   without new false negatives on the known-good pairs already validated (`docs/proximity-281-report.md` §1).
3. Should sub-role ingredient overlap ever count toward `evidence()`, given the fourth pair? If yes, at what
   threshold, and does it also apply to the other 74 gate-changed rows or should it be scoped narrower?
4. Is this worth a scorer change now (spec-032 is still pre-Phase-B), or should these 4 pairs just be
   handled as manual overrides and the systemic question deferred?

Do not propose or make any code edits. Answer these four questions only.
