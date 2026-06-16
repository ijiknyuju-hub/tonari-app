# Objective

Implement the home screen card UI for Tonari Gohan: a food-app-style layout
with a large featured card, horizontal-scroll small cards, difficulty labels,
bookmark/made buttons, and a dish detail screen.

# Spec Reference

- Spec: `docs/specs/spec-019-home-card-ui.md`

# Dependencies

- [x] Goal 018 (v3 data model cleanup) — completed

# Design References

None (code-based design from spec wireframes). Reference style: food app with
large featured card at top, smaller cards in horizontal scroll, orange (#f97316)
as primary accent, difficulty colored tags on each card.

# Product Context

This is the core browsing experience for Tonari Gohan. Users open the app to
discover new dishes they can make from ones they already cook. The card UI
replaces the previous single-featured-card home screen with a full browsable
card layout that encourages exploration ("面白そう、広がる！" feeling).

# Scope

## Create
- `components/mvp/NearbyDishCard.tsx` — card component (large/small via `variant` prop)
- `components/mvp/DishDetailScreen.tsx` — detail view with ingredients + steps
- `app/dish/[id]/page.tsx` — Next.js route for detail screen

## Modify
- `components/mvp/HomeScreen.tsx` — new card layout (featured + horizontal scroll)
- `app/globals.css` — difficulty label colors, card styles

# Out of Scope

- Real food photos (placeholders only — emoji on colored background)
- Push notification for "made it" reminders
- Onboarding / base dish selection flow
- Memo, photo recording, or editing on detail screen
- 広がりマップ screen content
- 食材から探す screen content
- Animation or transitions
- Server-side storage or user accounts

# Files to Read First

- `AGENTS.md`
- `README.md`
- `docs/specs/spec-019-home-card-ui.md` — approved spec with full layout details
- `data/v3.ts` — 52 relations with all fields populated
- `types/dish.ts` — NearbyRelation, Difficulty, Dish type definitions
- `lib/mvp/useUserState.ts` — bookmark/made record hooks
- `lib/mvp/useSelectedBaseDishes.ts` — selected base dish IDs
- `lib/mvp/todaysPick.ts` — daily featured pick logic
- `components/mvp/HomeScreen.tsx` — current home screen to replace

# Implementation Plan

1. Read spec and all listed files to understand current state
2. Add CSS custom properties for difficulty labels to `app/globals.css`:
   - かんたん: outlined orange (border #f97316, white bg)
   - 少し広げる: solid orange (#f97316 bg, white text)
   - しっかり作る: solid red (#ef4444 bg, white text)
3. Create `components/mvp/NearbyDishCard.tsx`:
   - `variant: 'featured' | 'compact'` prop
   - Featured: left photo placeholder + right info area (label, name, desc, ingredients, buttons)
   - Compact: vertical card ~150px wide (photo, label, name, desc, ingredients)
   - Bookmark icon (toggle via prop callback)
   - "Made it" button (record via prop callback)
   - "See details" button/link → dish detail route
4. Create `components/mvp/DishDetailScreen.tsx`:
   - Full dish info: name, difficulty label, description, ingredients, rough steps, cooking time
   - Bookmark + made buttons (same hooks)
   - Back navigation
5. Create `app/dish/[id]/page.tsx` — route that renders DishDetailScreen
6. Update `components/mvp/HomeScreen.tsx`:
   - Section header: "この前作った『{baseDish}』から広げる" + "他の起点にする"
   - Featured card (today's pick via todaysPick.ts)
   - "他にもこんな広げ方があります" section
   - Small cards in horizontal scroll (filtered by tab + selected base dishes)
   - Empty state when no matches
   - Bottom nav with 3 tabs (今日のおすすめ active, others placeholder)
7. Run verification

# Verification Requirements

```bash
npm run lint
npm run build
```

Manual check with `npm run dev`:
- `/home` loads and displays featured card + small cards
- Tab switching filters cards correctly
- Bookmark toggle saves and persists on reload
- "Made it" records and persists on reload
- "See details" navigates to detail screen
- Detail screen shows ingredients, steps, cooking time
- Detail screen bookmark/made buttons work
- Empty state appears when no cards match current filter
- Bottom nav renders correctly

# Stop and Ask Conditions

Stop and ask if:
- the spec conflicts with existing code structure
- unrelated user changes would need to be overwritten
- the current HomeScreen.tsx has diverged significantly from expected state
- implementation requires new npm packages not currently installed
- routing structure conflicts with existing app routes

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
