# Spec 020: Onboarding (Base Dish Selection Flow)

Approved: 2026-06-16

## What We're Building

A 2-screen onboarding flow for first-time users. Screen 1 welcomes the user
and explains how the app works. Screen 2 lets them select base dishes they
can cook from a grid of 10 emoji-illustrated cards. Once they pick at least
one dish and tap "explore," they land on the home screen with personalized
recommendations. Returning users skip onboarding entirely.

## User Story

As a first-time user,
I want to tell the app what I can already cook,
so that it shows me nearby dishes I can try next.

## Screen Layout

### Screen 1 — Welcome

```
┌──────────────────────────────┐
│                              │
│           🍳                 │
│   となりごはんへようこそ       │
│                              │
│   いつもの料理から             │
│   「ちょっと広げる」           │
│   新しいレシピに出会えます。   │
│                              │
│   ┌──────────────────────┐   │
│   │ 🧑‍🍳 よく作る料理を選ぶ │   │
│   │ → あなたに近い料理が   │   │
│   │   見つかる             │   │
│   │ ♡ 少しずつレパートリー │   │
│   │   が広がる             │   │
│   └──────────────────────┘   │
│                              │
│   [ はじめる ]  (orange btn)  │
│                              │
└──────────────────────────────┘
```

### Screen 2 — Base Dish Selection

```
┌──────────────────────────────┐
│ 作れる料理を選んでください     │
│ よく作る料理を選ぶと、        │
│ あなたに近い料理が見つかります。│
│                              │
│ [🍛カレー] [🍗唐揚げ] ← pinned│
│ ─────────────────────────── │
│ ┌──────┐  ┌──────┐          │
│ │ 🍛   │  │ 🍳   │          │
│ │カレー │  │ﾁｬｰﾊﾝ │          │
│ └──────┘  └──────┘          │
│ ┌──────┐  ┌──────┐          │
│ │ 🍗   │  │ 🌶️  │          │
│ │唐揚げ│  │麻婆   │          │
│ └──────┘  └──────┘          │
│ ... (2 cols × 5 rows)        │
│                              │
│ 2つ選択中                     │
│ [あなたのとなりごはんを探す]   │
└──────────────────────────────┘
```

- Grid: 2 columns × 5 rows, all 10 dishes visible without scrolling
- Selected cards: orange border + warm background (#FFF7ED)
- Unselected cards: light border, white background
- Pinned area: selected dishes as small chips above the grid
- Proceed button: orange when 1+ selected, gray/disabled when 0

## Interaction Flow

1. First visit → selectedDishes is empty → show Welcome screen
2. Tap "はじめる" → navigate to Selection screen
3. Tap a card → toggle selection (orange border + pinned chip appears)
4. Tap again → deselect (border reverts, chip removed)
5. 1+ selected → "探す" button turns orange and becomes tappable
6. Tap "あなたのとなりごはんを探す" → save to localStorage → navigate to Home
7. Next visit → selectedDishes exists → skip onboarding, show Home directly

## Scope

### In scope

- Welcome screen component (app intro + "はじめる" button)
- Base dish selection screen (10 cards in 2×5 grid)
- Card tap to select/deselect with orange visual feedback
- Selected dishes pinned as chips above grid
- Selection count display ("Nつ選択中")
- Proceed button (disabled at 0, enabled at 1+)
- Save selected dishes to localStorage via existing useSelectedBaseDishes
- First-visit detection (selectedDishes empty → show onboarding)
- Route to onboarding screens (e.g., /onboarding or /welcome)
- Settings screen entry point for changing base dishes later

### Out of scope

- Skip button (bypassing selection)
- Animation or screen transition effects
- "おかえりなさい" returning user message
- "全部選ぶ" / "リセット" buttons
- Real food photos (emoji placeholders only)
- Push notifications
- Server-side data / user accounts

## Done When

- [ ] First visit shows welcome screen
- [ ] "はじめる" navigates to selection screen
- [ ] All 10 dish cards render in 2-column grid
- [ ] Tapping a card toggles selection with visual feedback
- [ ] Selected dishes appear as pinned chips above grid
- [ ] 0 selected → button disabled; 1+ selected → button enabled
- [ ] Tapping "探す" saves to localStorage and navigates to home
- [ ] Second visit skips onboarding and shows home directly
- [ ] Settings screen has entry point to change base dishes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Design References

None (emoji-based wireframe mockups provided in spec-alignment session).

## Technical Notes (for Codex)

### Files to create

- `components/mvp/WelcomeScreen.tsx` — welcome/intro screen
- `components/mvp/BaseDishSelector.tsx` — card grid selection screen
- `app/onboarding/page.tsx` — onboarding route (or 2-step flow in one route)

### Files to modify

- `app/page.tsx` or `components/mvp/HomeScreen.tsx` — add first-visit check:
  if selectedDishes is empty, redirect to /onboarding
- Settings area (if exists) — add "ベース料理を変更する" link

### Files to read (no changes)

- `data/v3.ts` — dishes array (10 base dishes with id, name, emoji)
- `types/dish.ts` — Dish type definition
- `lib/mvp/useSelectedBaseDishes.ts` — existing hook for selectedDishes state
- `components/mvp/HomeScreen.tsx` — understand current empty state logic
- `app/globals.css` — existing styles, orange accent (#f97316)

### Key constraints

- Use existing `useSelectedBaseDishes` hook — do not create new storage
- The 10 base dishes come from `data/v3.ts` (dishes array, filter by isBase or equivalent)
- Mobile-first: 375px logical width target
- Card grid must fit all 10 dishes without scrolling on standard mobile viewport
- Emoji placeholders for dish icons (same approach as Home screen cards)
- Orange accent color (#f97316) consistent with Home screen design
- First-visit detection: check if `tonari.v3.selectedDishes` in localStorage is empty/missing

### Verification

```bash
npm run lint
npm run build
npm run dev  # manual check: onboarding flow, selection, home redirect
```
