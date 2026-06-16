# Spec 018: Data Model v3 + Phase0 Cleanup

Approved: 2026-06-15

## What We're Building

料理データの型定義とJSONスキーマを新しいv3モデルに刷新する。
旧phase0のコード（画面・コンポーネント・ロジック・旧データファイル）を全削除し、
v3データモデルの土台を整える。データの実作（30-50ペアの料理データ）は別goalで行う。

## User Story

As the app owner, I want a clean data foundation with proximity scores and 2-line descriptions,
so that the new home screen (Spec B) can display Notion-spec cards with accurate nearby dish recommendations.

## Data Model Design

### Entity: Dish

```typescript
type Difficulty = 'easy' | 'stretch' | 'full'

type Dish = {
  id: string
  name: string
  photo_url?: string
  variations: Variation[]
}

type Variation = {
  id: string
  name: string
  description: string
  can_promote: boolean
}
```

### Entity: NearbyRelation

```typescript
type NearbyRelation = {
  source: string           // base dish id
  target: string           // nearby dish id (references a Dish)
  proximity: number        // 0.1 - 1.0
  tab: Difficulty          // derived from proximity: easy (0.8-1.0), stretch (0.5-0.8), full (0.2-0.5)
  description_line1: string // 味の変化
  description_line2: string // 食べる場面 or 作りやすさ (tab-dependent)
  new_ingredients: string[] // max 3
  rough_steps?: string[]   // AI-generated, user-editable
  cooking_time_minutes?: number
}
```

### Entity: UserState (localStorage)

```typescript
type MadeRecord = {
  dish_id: string
  made_at: string          // ISO date
  rating: 'great' | 'ok' | 'meh'
  memo?: string
}

type UserState = {
  selected_dishes: string[]     // base dishes the user picked
  bookmarked: string[]          // dish ids in want-to-make list
  made_records: MadeRecord[]
  promoted_variations: string[] // variation ids promoted to independent nodes
}
```

### Description line rules (from Notion spec)

```
easy tab:     line1 = 味の変化, line2 = 作りやすさ
stretch tab:  line1 = 味の変化, line2 = 食べる場面
full tab:     line1 = 完成感・ごちそう感, line2 = 食べる場面
```

Example:
```
line1: "ねぎだれで、唐揚げがさっぱり中華風に。"
line2: "残り物や市販の唐揚げでも作れます。"
```

### JSON file structure

Two files in `data/`:

**data/dishes.json**: All dish entities (base dishes + nearby dishes as flat list)
**data/relations.json**: All NearbyRelation entries

Alternatively, a single `data/v3.ts` that exports both typed arrays for compile-time safety.

### 10 base dishes (confirmed)

1. カレー (curry)
2. 唐揚げ (karaage)
3. チャーハン (fried-rice)
4. 焼きそば (yakisoba)
5. ペペロンチーノ (peperoncino)
6. ナポリタン (napolitan)
7. 肉じゃが (nikujaga)
8. 親子丼 (oyakodon)
9. 麻婆豆腐 (mapo-tofu)
10. オムライス (omurice)

## Scope

### In scope

- Rewrite `types/dish.ts` with v3 types (Dish, NearbyRelation, Variation, UserState, MadeRecord)
- Create data file skeleton (`data/v3.ts` or `data/dishes.json` + `data/relations.json`) with 10 base dishes defined but NO nearby relations yet (empty array placeholder)
- Delete `data/dishCards.ts`, `data/baseDishes.ts`, `data/islandMap.ts`
- Delete all files in `components/phase0/`
- Delete all files in `lib/phase0/`
- Delete routes: `app/recommend/`, `app/saved/`, `app/select/`, `app/legacy/`, `app/share/`
- Update `app/page.tsx` (root route) to redirect to `/home` or show minimal landing
- Update `app/home/page.tsx` and `components/mvp/HomeScreen.tsx` minimally to compile with new types (stub/placeholder is OK — full UI revision is Spec B)
- Update any imports that reference deleted files
- Ensure `npm run build` passes with no type errors

### Out of scope

- Card UI changes (Spec B)
- Dish data creation / 30-50 pairs (separate goal)
- Photo sourcing
- Feedback mechanism (Spec D)
- Recipe detail screen (Spec C)
- New recommendation logic (Spec B)

## Done When

- [x] `types/dish.ts` exports Dish, NearbyRelation, Variation, UserState, MadeRecord types
- [x] Data file exists with 10 base dishes defined (+ 52 target dishes, 52 relations)
- [x] All phase0 files deleted (components/phase0, lib/phase0, old routes, old data files, + 17 dead root-level files)
- [x] `npm run build` passes
- [x] `npm run lint` passes (0 errors, 0 warnings)
- [x] `/home` loads without crashing

## Design References

None (data-only change, no design images needed).

## Technical Notes (for Codex)

### Migration strategy

This is a destructive migration — all phase0 code is deleted. The v2.8 mvp components (`components/mvp/`, `lib/mvp/`) remain but need import updates.

### Files affected

**Delete:**
- `data/dishCards.ts`
- `data/baseDishes.ts`
- `data/islandMap.ts`
- `components/phase0/` (entire directory)
- `lib/phase0/` (entire directory)
- `app/recommend/page.tsx`
- `app/saved/page.tsx`
- `app/select/page.tsx`
- `app/legacy/page.tsx`
- `app/share/page.tsx`
- `app/api/suggest/route.ts` (depends on old types)
- `app/api/og/route.tsx` (depends on old data)

**Rewrite:**
- `types/dish.ts` — new v3 types
- `data/v3.ts` — new data file with 10 base dishes, empty relations

**Update (fix imports):**
- `app/home/page.tsx`
- `components/mvp/HomeScreen.tsx` — replace old recommendDishes/todaysPick with stubs
- `components/mvp/IngredientsSearch.tsx` — update types
- `components/mvp/IslandMap.tsx` — update types
- `lib/mvp/todaysPick.ts` — rewrite for new types
- `lib/mvp/ingredientIndex.ts` — rewrite for new types
- `lib/mvp/useSelectedBaseDishes.ts` — update localStorage key if needed
- `app/page.tsx` — redirect to /home
- `app/layout.tsx` — remove any phase0 references

### Key constraints

- Keep `components/mvp/BottomNav.tsx` unchanged (no phase0 dependencies)
- Keep `components/mvp/VisitTracker.tsx` unchanged
- Keep `lib/mvp/visitTracking.ts` unchanged
- The home screen should compile and render an empty/placeholder state
- localStorage user data format changes: migrate key from `tonari.v28.selectedBaseDishes` to `tonari.v3.selectedDishes` (or keep same key if IDs haven't changed)

### Verification

```bash
npm run lint
npm run build
```

Confirm: `/home` renders without crash (empty state is fine).
