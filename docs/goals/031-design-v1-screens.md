---
goal: design-v1-screens
failure_cost: C1
visual_verify: interactive
turn_limit: 50
---

# Objective

Rebuild the web prototype screens to match the approved claude.ai/design canvas
`design/claude-design-v1/import-0715/tonarigohan.dc.html` (imported 2026-07-15 from
project "となりごはん UI設計"). This canvas is the **binding design source** for this
goal — it supersedes `design/claude-design-v1/DESIGN.md` and `mocks/design-tokens.md`
where they conflict (the owner iterated the canvas after those were written).

# Spec Reference

- Spec: `docs/specs/spec-030-experience-design.md` (v2 + v-notes; behavior authority)
- Design: `design/claude-design-v1/import-0715/tonarigohan.dc.html` (visual authority)

# Design source — how to read the canvas

- The file is a design-canvas HTML: each screen is a `<div id="XX">` wrapping an
  iPhone frame (402x874). Inline styles are the ground truth for spacing, color,
  type. `sc-for`/`sc-if`/`{{ }}` are template placeholders — map them to real data.
- **Visible screens are approved; screens with `style="display:none"` (4a, 1b, 2a,
  2e, 2b) are rejected variants. Do not implement them.**
- `x-import image-slot` = photo placeholder. The web prototype has no dish photos:
  use the DishArt generative illustration (port
  `design/claude-design-v1/import-0715/dish-art.jsx` to a TSX component) or the
  文字タイル (first-char tile, see 2i noPhoto branch / 4b diary rows) as designed.

# Screen map (approved canvas id → route)

| Canvas | Screen | Route |
|---|---|---|
| 1a | ホーム（DEAN&DELUCA型: 難易度タブ・HERO・サブリスト） | `app/home` (rebuild `components/mvp/HomeScreen.tsx`) |
| 2i | 探す（検索特化・自分の帳面。作った/ブックマークtab、さっと作れる+食材チップ、1カラムリスト） | `app/search` (new) |
| 4b | 料理帳（作れる料理=ジャンル別・十八番大カード+ランクchip / 日記=時系列） | `app/repertoire` (rebuild) |
| 2c/2f/2g | 料理詳細 — 同一画面のソース別3状態: 動画あり(2c) / URLなし(2f) / レシピサイト(2g) | `app/dish/[id]` (rebuild) |
| 2h | オンボーディング（文字タイル16品） | `app/onboarding` (rebuild) |
| 5a | 今週のセット（編成: ドラフト+入れ替え+買うものプレビュー） | `app/weekset` (new) |
| 5b | 買い物リスト（店頭: 料理チップ・差し替えパネル・グループ別チェックリスト・進捗） | `app/shopping` (new) |

Onboarding note: 2d (実写グリッド) is also visible in the canvas but requires real
photos the web prototype does not have — implement 2h; keep 2d as the native-era
option (record in Not Implemented).

# Binding deviations from the canvas (spec/decisions override)

1. **Home 1a: remove the 「新しく必要」 chip block from the hero** (`optA.hero.hasNeed`).
   Decision `docs/decisions/2026-07-14-tonari-fixed-point-week-set.md`: 買い足し前提の
   提案はホームから退場、週セット編成(5a)にだけ置く。The canvas mock predates this.
2. **Home is two-state** (same decision): 週セットあり → today's pick comes from the
   set, context line 「今週のセットから」, all suggestions must be cookable now;
   週セットなし → the 1a layout as-is (従来推薦).
3. **週セット(5a) has no dates/weekday calendar.** Do not add one (owner hard rule).
4. **週セット/買い物リストの置き場所** (owner GO 2026-07-15,
   `docs/decisions/2026-07-15-tonari-weekset-placement.md`): `/weekset` and
   `/shopping` are full-screen flow routes with **no bottom nav** (header back
   button). Entry lives on Home as a phase state machine, inserted between the
   greeting line and the difficulty tabs, minimal styling with existing tokens only:
   - 未編成 → one-line banner 「今週のセットを組む」 → `/weekset`
   - 編成済み・買い物前 → chip 「買い物リスト のこりN品」 → `/shopping`
   - 買い物完了 → chip disappears; home switches to the セット有り state (deviation 2),
     context line 「今週のセットから」 taps through to `/weekset` (view/adjust)
   The canvas 1a does not draw this entry element — this addition is approved.

# Product Context

固定点昇格（献立決定・買い物の運営コスト削減）を含む主要画面のUIがclaude.ai/designで
確定した。web試作を新デザインに揃え、週セット→買い物リスト→ホーム二状態のループを
初めて動く形にする。

# Scope

## Wave 1 — foundation (tokens, primitives, data layer)

- `app/globals.css` + `app/layout.tsx`: Zen Maru Gothic (headings, via next/font or
  Google Fonts link) + Hiragino Sans / Noto Sans JP body; page bg #FFFFFF, ink
  #1A1A1A, sub #7A7570, accent #DE5528 (replaces #C8531C)
- `components/mvp/DishArt.tsx`: port of
  `design/claude-design-v1/import-0715/dish-art.jsx` (typed props, no `window` export)
- `components/mvp/CharTile.tsx`: 文字タイル (first char, tinted bg — see 2i noPhoto
  branch / 4b diary / 2h onboarding tiles)
- `components/mvp/RankChip.tsx`: 作った/定番/十八番 chips + dot markers (colors from
  4b: 定番 #D3A051 on #F8F1E2 border #E6D4AE; 作った outline dot #C7C1BA; 十八番
  #DE5528 stamp circle)
- `components/mvp/BottomNav.tsx`: rebuild — 3 tabs ホーム/探す/料理帳 with the canvas
  SVG icons (home/search/open-book), active #DE5528, inactive #7A7570
- `lib/mvp/genre.ts`: genre taxonomy (7 boxes: ごはんもの/麺類/主菜(肉)/主菜(魚)/
  主菜(卵・豆腐)/副菜・おとも/汁もの) + mapping for existing dish data
- `lib/mvp/rank.ts`: rank derivation from record counts (作った→定番→十八番) +
  last-made relative-date formatting
- `lib/mvp/useWeekSet.ts`, `lib/mvp/useShoppingList.ts`: week-set state +
  shopping-list derivation (localStorage, same pattern as existing hooks)

## Wave 2 — entry screens

- `app/onboarding/` + screen component: canvas 2h (文字タイル16品)
- `app/home/` + `components/mvp/HomeScreen.tsx`: canvas 1a, two-state (deviations
  1-2), photo slots → DishArt
- `app/search/` + `components/mvp/SearchScreen.tsx`: canvas 2i (new route)

## Wave 3 — cookbook and detail

- `app/repertoire/` + `components/mvp/RepertoireScreen.tsx`: canvas 4b (作れる料理 /
  日記 tabs)
- `app/dish/[id]/` + `components/mvp/DishDetailScreen.tsx`: canvas 2c/2f/2g as
  source-type states

## Wave 4 — week-set flow

- `app/weekset/` + `components/mvp/WeekSetScreen.tsx`: canvas 5a (no bottom nav,
  header back)
- `app/shopping/` + `components/mvp/ShoppingListScreen.tsx`: canvas 5b (no bottom
  nav, header back)
- Flow wiring per deviation 4: home phase-state entry (banner/chip between greeting
  and difficulty tabs) → `/weekset` / `/shopping`; 5a CTA → `/shopping`; shopping
  all-done → home セット有り state; home two-state reads the week-set store; detail
  作った → record + rank update

# Data / derivation rules

- 週セット draft: 5 dishes from the user's repertoire (定番=least-recently-made
  regulars first, 欲望=bookmarks, 新顔=0–2 bridge dishes with `新しく必要` chips as
  designed in 5a). Simple heuristics are fine — no AI at runtime.
- 買い物リスト = union of set dishes' ingredients minus a fixed 常備品 list
  (調味料ベースのデフォルト定数で可). Grouped in 5b by dish-count or category as in
  the mock (group dot colors), each row shows source dish + optional qty.
- 店頭差し替え(5b panel): candidates = other repertoire dishes; pick ones whose
  ingredient diff vs current list is minimal; re-derive list instantly on swap.
- Detail states: no attached URL → 2f; attached YouTube URL → 2c (photo/video
  carousel hero + video list, main video switchable); attached site URL → 2g
  (link-out chip, no video swipe). URL attach/edit is a universal field (spec §料理帳 5).

# Out of Scope

- 地図 (`app/map`, IslandMap) — untouched
- 外部キャプチャのAI照合、推測通知、月次カード、収益/Pro導線
- ネイティブ移植、カタログ拡充（既存 `data/` 資産をそのまま使う）
- `app/ingredients`, `app/custom-dish`, `app/level-up` は壊さない最小調整のみ

# Files to Read First

- `AGENTS.md`
- `design/claude-design-v1/import-0715/tonarigohan.dc.html` (full read; large)
- `docs/specs/spec-030-experience-design.md`
- `docs/decisions/2026-07-14-tonari-fixed-point-week-set.md`
- `docs/decisions/2026-07-13-tonari-search-card-and-cookbook-structure.md`
- `lib/mvp/useDishLibrary.ts`, `lib/mvp/useUserState.ts`, `components/mvp/BottomNav.tsx`

# Implementation Plan

1. Port DishArt + shared primitives (rank chip, 文字タイル, bottom nav 3 tabs
   ホーム/探す/料理帳 with the canvas SVG icons).
2. Data layer: genre/rank/last-made derivations; week-set + shopping stores.
3. Screens in dependency order: onboarding(2h) → home(1a two-state) → search(2i) →
   repertoire(4b) → detail(2c/2f/2g) → weekset(5a) → shopping(5b).
4. Wire flows: onboarding→home; home header entry →weekset; weekset CTA→shopping;
   detail 作った button → record + rank update.
5. `npm run lint` + `npm run build`; fix all errors.

# Verification Requirements

```bash
npm run lint
npm run build
```

Plus interactive check (visual_verify: interactive): dev server, click through
onboarding→home→weekset→shopping swap/check-off, search filter chips, repertoire
tab switch, detail 作った.

# Stop and Ask Conditions

- the canvas conflicts with spec-030 beyond the three listed deviations
- existing `lib/mvp` data shapes cannot support a derivation without breaking
  other screens
- uncommitted user changes would need to be overwritten

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
