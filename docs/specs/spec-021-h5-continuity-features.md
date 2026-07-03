# Spec 021: H5 Continuity Features (Phase 1)

Approved: 2026-06-19

## What We're Building

Three features that address H5 (the most dangerous failure hypothesis: "1回見て
満足、戻る理由がない"). These are integrated into the existing home screen and
add a new レベルアップ screen. Together they create a continuity loop:
open → browse → record → see growth → come back tomorrow.

## User Story

As a user who found an interesting dish yesterday,
I want to be reminded and encouraged to record my cooking,
so that my repertoire grows visibly and I keep coming back.

## Feature Overview

### Feature A: Home Screen Enhancements

Additions to the existing HomeScreen. The current UI (header, greeting, tabs,
featured card, other cards, bottom nav) stays as-is.

**A1. Return nudge bar** (top of content area, below header)
- Shows only on revisit (last_active_date is yesterday or earlier)
- Text: "昨日の{dish_name}、作りましたか？"
- "作った!" button → records immediately with rating "ok", closes nudge
- "今度ね" button → dismisses nudge for today
- dish_name = yesterday's featured pick (computed from yesterday's date + todaysPick logic)

**A2. Ingredient chip filter** (below "other cards" section)
- Section label: "持っている食材で絞る"
- Chips: all unique ingredients from `new_ingredients` arrays of current relations
- Tap to toggle on (= "I have this"). Active chips are orange, inactive are outline
- Active chip state persists in UserState.available_ingredients[]
- Filter logic: when any chips are active, cards whose new_ingredients are ALL
  in the active set stay fully visible. Cards that need ingredients NOT in the
  active set get hidden from the main sections (featured + other cards).
  If the featured card gets filtered out, the next best match becomes featured.
- If ALL cards are filtered out, show "もう少し食材を追加してみてください"

**A3. Other cards: cross-difficulty display**
- Current: `otherCards` filters by `r.tab === mode` (same difficulty as tab)
- New: `otherCards` shows cards from the SAME source dish across ALL difficulties
  (removing `r.tab === mode` filter), excluding the featured target, sorted by
  proximity descending, limited to 3 cards
- Purpose: show the full breadth of what you can learn from one base dish

### Feature B: FAB Recording Flow

A floating action button for recording "作った" from anywhere on the home screen.

**B1. FAB button**
- Position: bottom-right, above bottom nav (z-index above content)
- Appearance: orange circle with "+" icon and "作った" label below
- Tap → opens recording modal (not a new page)

**B2. Recording modal (3 steps)**

Step 1 — Dish selection:
- Title: "何を作りましたか？"
- List: recent recommendations (today's + yesterday's picks), then bookmarked dishes
- Each as a tappable row. Tap to select and advance.
- Bottom: search icon + "他の料理を探す" → opens text filter over the full dish list

Step 2 — Impression + optional photo:
- Title: "どうでしたか？"
- Photo area: tap to take/select photo (optional, uses browser file input)
- Three emotion buttons: 😋 最高 (great) / 🙂 まあまあ (ok) / 🤔 微妙 (meh)
- Tapping an emotion → advance to step 3

Step 3 — Completion:
- Show: 🎉 + "{dish_name}を記録しました！"
- Show: "レパートリー {N}品" (computed from unique dish IDs in made_records)
- Show: "累計 {M}日目" (computed from unique dates in made_records)
- Show milestone hint if close: "あと{X}品で{milestone}品！"
- "ホームに戻る" button → close modal, refresh home state

**B3. MadeRecord extension**
- Add optional `photo_url?: string` to MadeRecord type (stored as base64 data URL
  in localStorage for Phase 1, migrated to Supabase Storage in Phase 2)

### Feature C: レベルアップ Screen

A new screen showing the user's cooking growth.

**C1. Bottom nav update**
- Change from 3 tabs to 4: ホーム | レベルアップ | 食材 | マップ
- Icon: trophy or chart-bar
- Route: /level-up

**C2. Screen content (top to bottom)**
- Header: "あなたのレパートリー"
- Large number: "{N}品" (unique dishes made)
- Subtitle: "累計 {M}日 料理した"
- Progress bar to next milestone (5, 10, 15, 20, 30, 50, 75, 100)
- Hint: "あと{X}品で{milestone}品"
- Monthly growth chart: simple bar chart showing dishes made per month
- Dish list: all recorded dishes with date and emoji rating
- Bottom: "マップを見る →" link to island map

**C3. Milestones**
- Fixed list: [5, 10, 15, 20, 30, 50, 75, 100]
- Find the next milestone above current count
- Display as progress bar fill percentage

## Screen Layout

### Home (modified)

```
[EXISTING: Header]
[NEW: Return nudge bar — only on revisit]
[EXISTING: Greeting]
[EXISTING: Difficulty tabs]
[EXISTING: Section header + 他の起点にする]
[EXISTING: Featured card]
[EXISTING: Other cards — NOW cross-difficulty, max 3]
[──── divider ────]
[NEW: "持っている食材で絞る" + ingredient chips]
[EXISTING: Bottom nav — NOW 4 tabs]
[NEW: FAB floating button — bottom-right]
```

### FAB Modal

```
Step 1:            Step 2:           Step 3:
┌──────────┐      ┌──────────┐      ┌──────────┐
│ 何を作り  │      │ どうでし  │      │    🎉     │
│ ましたか？│      │ たか？   │      │ 油淋鶏を  │
│           │      │          │      │ 記録！    │
│ ○ 油淋鶏  │      │ [📷写真]  │      │          │
│ ○ 親子丼  │      │          │      │ レパート  │
│ ○ チキン…  │      │ 😋 🙂 🤔  │      │ リー13品  │
│           │      │          │      │ 累計29日  │
│ 🔍他の料理 │      │          │      │ あと2品！ │
└──────────┘      └──────────┘      └──────────┘
```

### レベルアップ Screen

```
┌───────────────────────┐
│ あなたのレパートリー    │
│                       │
│        13品           │
│    累計29日 料理した    │
│                       │
│ [████████░░] あと2品   │
│            で15品     │
│                       │
│ 📊 月別レパートリー     │
│ [bar chart]           │
│                       │
│ 作った料理一覧          │
│ 6/19 油淋鶏 😋         │
│ 6/17 親子丼 🙂         │
│ 6/15 カレー 😋         │
│ ...                   │
│                       │
│ マップを見る →          │
└───────────────────────┘
```

## Interaction Flow

1. User opens app → sees featured card (today's pick)
2. If revisiting: nudge bar asks "昨日のXX作った？" → tap "作った!" = instant record
3. User scrolls down → sees other cards (3, across all difficulties)
4. User selects ingredient chips → cards update to show only what they can make
5. User taps FAB → selects dish → picks emotion → sees growth update
6. User taps レベルアップ tab → sees full repertoire + milestones + chart

## Scope

### In scope

- Return nudge bar component (home screen)
- Ingredient chip filter component + filter logic (home screen)
- Cross-difficulty other cards (home screen)
- FAB button (home screen)
- Recording modal (3-step: dish select → emotion + photo → completion)
- MadeRecord.photo_url field (optional, base64 localStorage)
- UserState.available_ingredients[] field
- UserState.last_active_date field
- レベルアップ screen (/level-up route)
- Milestone progress calculation
- Monthly bar chart (simple, no library — CSS bars or inline SVG)
- Bottom nav: 4 tabs
- Track new events: fab_record, nudge_record, nudge_dismiss

### Out of scope

- Weekly digest / PWA notifications (Phase 2)
- Free-text ingredient input (chips only, from existing data)
- Photo gallery view
- Badge/title/achievement system
- Level-up animation
- Streak reset logic (no reset — cumulative only)
- "あと少し買えば作れる" near-miss section
- Stats bar on home screen (stats live on レベルアップ only)

## Done When

- [ ] Return nudge shows on revisit with yesterday's dish name
- [ ] "作った!" on nudge records and dismisses
- [ ] Ingredient chips toggle and persist across reload
- [ ] Active chips filter featured + other cards correctly
- [ ] Other cards show max 3 from same source across all difficulties
- [ ] FAB is visible and tappable on home screen
- [ ] Recording modal completes in 3 taps (dish → emotion → done)
- [ ] Completion screen shows correct repertoire count and milestone
- [ ] レベルアップ screen shows repertoire count, days, progress bar, chart
- [ ] Bottom nav has 4 tabs, レベルアップ tab navigates to /level-up
- [ ] fab_record and nudge_record events fire correctly
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Design References

No design images. Reference: existing HomeScreen design tokens (warm cream + orange
accent from design-system.md). New components follow the same visual language.

## Competitive Research (from blueprint Phase 1.5)

### Similar Implementations
- **Duolingo**: streak counter is the #1 retention driver. No reset → reduces anxiety
- **Ate (food logging)**: FAB-based photo logging, 1-2 tap flow. Users praise simplicity
- **Kitchen Stories**: card-based browsing with ingredient filter. Filter is additive (select what you have)

### UX Patterns Applied
- FAB recording: adopted from Ate/FoodView pattern — lowest friction logging
- Ingredient chip filter: subtractive model (start with all, filter down) based on user preference
- Milestone progress: adopted from fitness apps (Strava/Nike Run Club) — next goal visibility drives continuation

## Technical Notes (for Codex)

### UserState extension

```ts
// Add to types/dish.ts UserState:
available_ingredients: string[]
last_active_date: string  // "2026-06-19" ISO date
```

MadeRecord extension:
```ts
// Add to types/dish.ts MadeRecord:
photo_url?: string  // base64 data URL, optional
```

### Derived computations (do not store, compute from made_records)

```ts
const repertoireCount = new Set(state.made_records.map(r => r.dish_id)).size
const cumulativeDays = new Set(state.made_records.map(r => r.made_at.slice(0, 10))).size
const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]
const nextMilestone = MILESTONES.find(m => m > repertoireCount) ?? 100
const remaining = nextMilestone - repertoireCount
```

### Ingredient chip data source

Extract unique ingredients from relations that match selected base dishes:
```ts
const allIngredients = relations
  .filter(r => selectedBaseDishIds.includes(r.source))
  .flatMap(r => r.new_ingredients)
const uniqueIngredients = [...new Set(allIngredients)]
```

### Return nudge logic

```ts
const today = new Date().toISOString().slice(0, 10)
const showNudge = state.last_active_date && state.last_active_date < today
// Yesterday's pick: todaysPick(selectedIds, mode, yesterdayISO)
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
```

### Key files to modify

- `types/dish.ts` — UserState + MadeRecord extension
- `lib/mvp/useUserState.ts` — add available_ingredients, last_active_date persistence
- `components/mvp/HomeScreen.tsx` — nudge bar, chip filter, cross-difficulty otherCards, FAB
- `components/mvp/BottomNav.tsx` — 4th tab
- `lib/mvp/todaysPick.ts` — export stableHash for nudge yesterday calculation

### New files to create

- `components/mvp/IngredientChipFilter.tsx` — chip toggle component
- `components/mvp/ReturnNudge.tsx` — nudge bar component
- `components/mvp/RecordingModal.tsx` — 3-step FAB modal
- `components/mvp/RecordCompletion.tsx` — step 3 completion display
- `app/level-up/page.tsx` — レベルアップ screen page
- `components/mvp/LevelUpScreen.tsx` — screen component

### Files to read (no changes)

- `data/v3.ts` — dishes, relations arrays
- `lib/mvp/analytics.ts` — trackEvent function
- `lib/mvp/todaysPick.ts` — daily pick logic
- `docs/design-system.md` — color tokens

### Parallel Group Declaration

Wave 1 (parallel):
- Set A: types/dish.ts + lib/mvp/useUserState.ts (data model extension)
- Set B: components/mvp/IngredientChipFilter.tsx + components/mvp/ReturnNudge.tsx (standalone components)

Wave 2 (parallel):
- Set C: components/mvp/RecordingModal.tsx + components/mvp/RecordCompletion.tsx (FAB flow)
- Set D: app/level-up/page.tsx + components/mvp/LevelUpScreen.tsx (new screen)

Wave 3 (sequential — integration):
- Set E: components/mvp/HomeScreen.tsx (integrates A1, A2, A3, B1)
- Set F: components/mvp/BottomNav.tsx (adds 4th tab)

### New analytics events

```ts
trackEvent('fab_record', { dish_id, rating })
trackEvent('nudge_record', { dish_id })
trackEvent('nudge_dismiss', {})
trackEvent('open_level_up', {})
trackEvent('ingredient_filter_toggle', { ingredient, active: boolean })
```
