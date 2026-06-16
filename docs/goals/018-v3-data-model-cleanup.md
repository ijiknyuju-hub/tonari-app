# Objective

Rewrite the dish data model to v3 (proximity scores, 2-line descriptions, variations) and delete all phase0 legacy code. The app should compile and /home should render an empty state.

# Spec Reference

- Spec: `docs/specs/spec-018-data-model-v3.md`

# Dependencies

None (this is the foundation for all subsequent Phase 1 work).

# Design References

None (data-only change).

# Product Context

Blueprint: `docs/blueprint.md` (2026-06-15)
Decisions: `docs/decisions/003-proximity-model-v3.md`, `docs/decisions/004-abolish-arrange-concept.md`

Tonari Gohan is shifting from a diff-based card model (changedPoints, reusableSkills) to a body-feel proximity model (0.1-1.0 score, 2-line descriptions per Notion spec). This goal lays the data foundation. All old phase0 code that depends on the old DishCard type is deleted. The mvp components are updated to compile with new types but UI revision happens in a separate goal.

# Scope

1. **Rewrite `types/dish.ts`** with v3 types:
   - `Dish`: id, name, photo_url?, variations[]
   - `Variation`: id, name, description, can_promote
   - `NearbyRelation`: source, target, proximity (0.1-1.0), tab (easy|stretch|full), description_line1, description_line2, new_ingredients[], rough_steps?, cooking_time_minutes?
   - `MadeRecord`: dish_id, made_at, rating (great|ok|meh), memo?
   - `UserState`: selected_dishes[], bookmarked[], made_records[], promoted_variations[]
   - `Difficulty`: 'easy' | 'stretch' | 'full'

2. **Create `data/v3.ts`** exporting:
   - `dishes: Dish[]` — 10 base dishes with empty variations (data creation is a separate goal):
     curry, ginger-pork, fried-rice, yakisoba, peperoncino, napolitan, nikujaga, oyakodon, mapo-tofu, omurice
   - `relations: NearbyRelation[]` — empty array (populated in separate goal)

3. **Delete phase0 files:**
   - `data/dishCards.ts`, `data/baseDishes.ts`, `data/islandMap.ts`
   - `components/phase0/` (entire directory)
   - `lib/phase0/` (entire directory)
   - `app/recommend/page.tsx`, `app/saved/page.tsx`, `app/select/page.tsx`
   - `app/legacy/page.tsx`, `app/share/page.tsx`
   - `app/api/suggest/route.ts`, `app/api/og/route.tsx`

4. **Update `app/page.tsx`**: redirect to `/home`

5. **Fix mvp imports** — update these files to compile with new types:
   - `components/mvp/HomeScreen.tsx` — replace recommendDishes/todaysPick calls with stubs that read from `data/v3.ts`. Show "まだ料理データがありません" when relations is empty.
   - `lib/mvp/todaysPick.ts` — rewrite signature for new types. Return null when no relations exist.
   - `lib/mvp/ingredientIndex.ts` — rewrite for new Dish type.
   - `components/mvp/IngredientsSearch.tsx` — update types.
   - `components/mvp/IslandMap.tsx` — update types.

6. **Keep unchanged**: `components/mvp/BottomNav.tsx`, `components/mvp/VisitTracker.tsx`, `lib/mvp/visitTracking.ts`, `lib/mvp/useSelectedBaseDishes.ts` (unless it imports deleted types).

# Out of Scope

- Card UI redesign (Spec B / goal 019+)
- Creating the 30-50 nearby dish relations data (separate goal)
- Photo sourcing
- Feedback buttons
- Recipe detail screen
- New recommendation algorithm

# Files to Read First

- `AGENTS.md`
- `docs/specs/spec-018-data-model-v3.md`
- `docs/blueprint.md` (Data Model section)
- `types/dish.ts` (current types to understand what's changing)
- `data/dishCards.ts`, `data/baseDishes.ts` (understand current data)
- `components/mvp/HomeScreen.tsx` (main file needing import fixes)
- `lib/mvp/todaysPick.ts`, `lib/mvp/ingredientIndex.ts`

# Implementation Plan

1. Read all files listed above. Understand current import graph.
2. Rewrite `types/dish.ts` with v3 types.
3. Create `data/v3.ts` with 10 base dishes and empty relations.
4. Delete all phase0 files (data, components, lib, routes, API routes).
5. Update `app/page.tsx` to redirect to `/home`.
6. Fix all broken imports in mvp components/lib. Replace old logic with stubs.
7. Ensure HomeScreen renders an empty state gracefully when relations is empty.
8. Run verification.

# Verification Requirements

```bash
npm run lint
npm run build
```

If `npm run typecheck` is defined, also run that. Report `skipped: script missing` if not.

Behavior to confirm:
- `/home` renders without crash (empty state with "まだ料理データがありません" or similar)
- `/map` and `/ingredients` still render their placeholder screens
- No TypeScript errors
- No references to deleted files remain

# Stop and Ask Conditions

Stop and ask if:
- A file outside the listed scope imports from phase0 (unexpected dependency)
- `components/mvp/HomeScreen.tsx` cannot be reasonably stubbed without a full rewrite
- The build fails for reasons unrelated to this migration

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
