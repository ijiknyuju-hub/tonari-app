# Objective

Polish the Home screen (今日のおすすめ) to closely match the attached concept design image (decision 002 design-first pipeline; visual reference `mocks/concept/home.webp`).

# Product Context

Copy source of truth: `mocks/home.md` — do NOT take text from the image (image text may be unreliable); the copy in mocks is authoritative.
Tokens: `mocks/design-tokens.md` / `app/globals.css` (`--tn-*`).

The functional skeleton from goals 012-013 works. This goal is visual only: spacing, hierarchy, card composition, iconography, alignment with the concept image.

# Scope

Visual adjustments to `components/mvp/HomeScreen.tsx` (and `app/globals.css` shared classes if needed):

- Header: centered app title `となりごはん` (no menu/bell)
- Greeting block: large bold greeting + sub line, per image proportions
- Mode tabs: 3 equal cards in a row; selected = accent border + accent-soft bg + accent title; unselected = white card; title bold + small sub text, centered
- Featured block: light-bulb mark + `{起点料理}から広げる` heading row with `いつもの料理から、少し変えてみませんか？` beside/below; `起点を変更` as outlined pill on the right (wire it to `/select`)
- Featured card: photo placeholder block on the left/top with おすすめ！ badge overlay; tags row (mode tag); title large; shortCopy; the 3 detail rows (変わるところ / 工程量 / 新しく必要な食材) in an inset `--tn-surface-soft` block with small leading icons; `詳しく見る` outlined pill + bookmark square button on the right
- Secondary cards: horizontal 3-card row that scrolls horizontally if needed at 375px (or stacked grid — match the image feel), each with photo placeholder, mode tag overlay, bookmark, title, 2-line copy, 工程量 row + circled chevron
- Bottom two blocks side by side (作りたいリスト / 最近作った料理) with icons and `一覧を見る >` links, list items as soft inset rows
- Keep all existing behavior: mode switching, daily pick, save toggle, detail modal, links, analytics

# Out of Scope

- Any logic/data changes
- New screens, events, dependencies
- おすすめ条件 button, carousel dots, menu/bell (still deferred)
- Real photos (placeholders stay, but style them like photo areas)

# Files to Read First

- `mocks/home.md`, `mocks/design-tokens.md`
- `components/mvp/HomeScreen.tsx`, `app/globals.css`
- the attached image (concept design)

# Implementation Plan

1. Compare the current HomeScreen against the attached image; list gaps.
2. Restyle smallest-diff-first.
3. Run verification.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

Confirm by code reasoning: no behavior changes (same handlers/props), 375px no horizontal overflow (except an intentional horizontally scrollable card row), all copy identical to mocks/home.md.

# Stop and Ask Conditions

Stop and ask if matching the image requires changing component structure in a way that breaks the modal or analytics wiring.

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

日本語文字列はUTF-8を維持すること。文言は画像からコピーせず mocks/home.md を使うこと。
