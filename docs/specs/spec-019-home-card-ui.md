# Spec 019: Home Screen Card UI

Approved: 2026-06-16

## What We're Building

Home screen card UI for Tonari Gohan. Users browse dish recommendation cards
with food-app-style layout: a large featured card ("today's pick") at the top,
followed by smaller cards in a horizontal scroll. Each card shows a difficulty
label, dish name, description, required new ingredients, a bookmark button,
and a "see details" button. Tapping "see details" opens a detail screen with
full ingredient list and cooking steps.

## User Story

As a user who wants to expand their cooking repertoire,
I want to browse recommended nearby dishes in a visually appealing card format,
so that I can discover interesting new dishes and save ones I want to try.

## Screen Layout

### Home Screen (top to bottom)

```
[Header: ≡  となりごはん  🔔]
[Greeting: おはようございます / 今日のおすすめはこちら]
[Tabs: かんたん | 少し広げる | しっかり作る]
[Section: この前作った『X』から広げる  (他の起点にする)]
[Featured card: large, with placeholder image + label + name + desc + ingredients + 詳しく見る]
[Section: 他にもこんな広げ方があります]
[Small cards: horizontal scroll, 2-3 visible at once]
[Bottom nav: 今日のおすすめ | 広がりマップ | 食材から探す]
```

### Featured Card (large)

```
┌──────────────────────────────────────┐
│  ┌────────────┐   [label: かんたん]  │
│  │            │                      │
│  │  PHOTO     │   油淋鶏  ✦         │
│  │ placeholder│                      │
│  │   🍗      │   ねぎだれで、唐揚げ │
│  │  🔖       │   がさっぱり中華風に。│
│  └────────────┘                      │
│                  新しく必要: 長ねぎ…  │
│  [✓ 作ったことある]  [詳しく見る  ›] │
└──────────────────────────────────────┘
```

- Left half: placeholder image area (emoji + pale background)
- Bookmark icon overlaid on image top-right corner
- Right half: difficulty label (colored), dish name, description, new ingredients
- Bottom: "made it" button + "see details" CTA (orange)

### Small Card (horizontal scroll)

```
┌──────────┐
│ [label]🔖│
│  PHOTO   │
│ placeholder
│          │
│ チキン南蛮 │
│ 甘酢と…   │
│ 新しく必要│
└──────────┘
```

- Compact vertical card, ~150px wide
- Difficulty label top-left, bookmark icon top-right
- Tapping the card body or area goes to detail screen

### Detail Screen

```
[← 戻る]
[Dish name (large)]
[Difficulty label]
[Description]
[材料リスト: 新しく必要なもの]
[ざっくり手順: numbered steps]
[調理時間]
[作りたい ♡ button]  [作った ✓ button]
```

Simple single-column layout showing all NearbyRelation data.

### Difficulty Labels (colored tags on cards)

- かんたん: outlined orange (#f97316) — white background, orange border + text
- 少し広げる: solid orange (#f97316) — orange background, white text
- しっかり作る: solid red (#ef4444) — red background, white text

## Interaction Flow

1. Open app → greeting + "かんたん" tab selected by default → featured card visible
2. Browse: scroll down for small cards, horizontal swipe to see more
3. Tab switch: tap "少し広げる" or "しっかり作る" to change difficulty filter
4. Bookmark: tap 🔖 icon on any card → saved to "作りたい" list (localStorage)
5. Made it: tap "作ったことある" button → recorded in localStorage, checkmark shown
6. Details: tap "詳しく見る" (featured) or tap small card → detail screen
7. Detail screen: view ingredients + steps, bookmark or record from there too

## Scope

### In scope

- Home screen card layout (featured + horizontal scroll small cards)
- NearbyDishCard component (large and small variants)
- Difficulty tab filtering (existing mode selector, restyled to match design)
- Difficulty color labels on cards
- Bookmark toggle (using existing useUserState hooks)
- "Made it" button (using existing useUserState hooks)
- "See details" → detail screen with ingredients, steps, bookmark, made buttons
- "Other starting point" button (switches base dish context)
- Section headers ("この前作った『X』から広げる", "他にもこんな広げ方があります")
- Photo placeholders (emoji + colored background, no real photos)
- Bottom navigation bar (3 tabs, only "今日のおすすめ" active for now)
- Empty state when no matches for current tab
- Data stored in localStorage via existing hooks

### Out of scope

- Real food photos (added later)
- "Made it" push notification / reminder
- Onboarding / first-time base dish selection flow
- Memo, photo recording, editing features on detail screen
- 広がりマップ screen implementation
- 食材から探す screen implementation
- Animation / transitions
- Server-side data / user accounts

## Done When

- [ ] Home screen shows featured card + small cards in horizontal scroll
- [ ] Difficulty tabs filter displayed cards correctly
- [ ] Difficulty color labels appear on each card
- [ ] Bookmark toggle works and persists across reload
- [ ] "Made it" button records and persists across reload
- [ ] "See details" navigates to detail screen with full info
- [ ] Detail screen shows ingredients, rough steps, cooking time
- [ ] Detail screen has working bookmark + made buttons
- [ ] "Other starting point" button switches base dish
- [ ] Empty state displays when no cards match
- [ ] Bottom nav renders (今日のおすすめ active, others placeholder)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Design References

No design images. Reference: user-provided mockup screenshot (food app style
with large featured card, horizontal scroll small cards, orange accent color,
difficulty labels as colored tags).

## Technical Notes (for Codex)

### Files to create

- `components/mvp/NearbyDishCard.tsx` — card component (large + small variants via prop)
- `components/mvp/DishDetailScreen.tsx` — detail screen component
- `app/dish/[id]/page.tsx` — detail page route (or modal, TBD by implementer)

### Files to modify

- `components/mvp/HomeScreen.tsx` — replace current layout with card UI
- `app/globals.css` — add difficulty label colors, card styles

### Files to read (no changes)

- `data/v3.ts` — dishes array, relations array (52 entries with all fields)
- `types/dish.ts` — NearbyRelation, Difficulty, Dish types
- `lib/mvp/useUserState.ts` — toggleBookmark, recordMade hooks
- `lib/mvp/useSelectedBaseDishes.ts` — get user's selected base dish IDs
- `lib/mvp/todaysPick.ts` — daily featured pick logic

### Key constraints

- All data is static import from `data/v3.ts` — no API calls needed
- State is localStorage only via existing hooks — no server needed
- Photo placeholders: use emoji (🍛🍗🍝 etc.) on pale colored background
- Mobile-first: 375px logical width target
- Cards must work without JavaScript-heavy interactions (no drag, no complex gestures)
- Keep existing BottomNav component structure, just update labels/icons if needed
- Detail screen routing: prefer `app/dish/[targetId]/page.tsx` using Next.js app router

### Verification

```bash
npm run lint
npm run build
npm run dev  # manual check: /home displays cards, detail screen works
```
