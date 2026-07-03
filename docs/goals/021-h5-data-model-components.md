# Objective

Extend the data model (UserState, MadeRecord) and create standalone UI components
(IngredientChipFilter, ReturnNudge) needed by the H5 continuity features.
This goal produces the building blocks; goal 022 and 023 integrate them.

# Spec Reference

- Spec: `docs/specs/spec-021-h5-continuity-features.md`

# Dependencies

- [x] goal 018 (v3 data model — already completed)
- [x] goal 019 (home card UI — already completed)

# Design References

None. Use existing design tokens from design-system.md (warm cream + orange accent).

# Product Context

H5 (1回見て戻る理由がない) is the most dangerous failure hypothesis for Tonari Gohan.
This goal lays the data and component foundation for the 3-feature continuity system.

# Scope

## Files to create

- `components/mvp/IngredientChipFilter.tsx` — toggleable chip row for food ingredients
- `components/mvp/ReturnNudge.tsx` — nudge bar showing on revisit

## Files to modify

- `types/dish.ts` — add `available_ingredients: string[]` and `last_active_date: string`
  to UserState, add `photo_url?: string` to MadeRecord
- `lib/mvp/useUserState.ts` — persist available_ingredients and last_active_date,
  add helpers: `toggleIngredient(name: string)`, `updateLastActiveDate()`
- `lib/mvp/todaysPick.ts` — export `stableHash` function (currently private)

## Component specs

### IngredientChipFilter

Props:
- `ingredients: string[]` — list of ingredient names to show as chips
- `active: string[]` — currently selected ingredients (from UserState)
- `onToggle: (ingredient: string) => void` — toggle callback

Renders a horizontal scrollable row of pill chips. Active = orange fill + white text.
Inactive = white fill + border + gray text. Uses existing design tokens.

### ReturnNudge

Props:
- `dishName: string` — yesterday's recommended dish name
- `onRecord: () => void` — "作った!" callback
- `onDismiss: () => void` — "今度ね" callback

Renders an amber/warm banner with the dish name, two buttons.
Only rendered when the parent determines the nudge should show.

# Out of Scope

- HomeScreen integration (goal 023)
- FAB recording modal (goal 022)
- レベルアップ screen (goal 022)
- Bottom nav changes (goal 023)

# Files to Read First

- `AGENTS.md`
- `docs/specs/spec-021-h5-continuity-features.md`
- `types/dish.ts`
- `lib/mvp/useUserState.ts`
- `lib/mvp/todaysPick.ts`
- `docs/design-system.md`

# Implementation Plan

1. Read current types/dish.ts and lib/mvp/useUserState.ts to understand existing shape
2. Extend UserState type with available_ingredients and last_active_date fields
3. Extend MadeRecord type with optional photo_url field
4. Update useUserState hook: add toggleIngredient helper, updateLastActiveDate helper,
   ensure new fields have default values ([] and "" respectively)
5. Export stableHash from todaysPick.ts (just change from private to export)
6. Create IngredientChipFilter component with horizontal scroll, toggle state
7. Create ReturnNudge component with amber banner, two buttons
8. Run lint + build to verify

# Verification Requirements

```bash
npm run lint
npm run build
```

# Stop and Ask Conditions

Stop and ask if:
- useUserState hook has a different structure than expected
- localStorage migration is needed for existing UserState data
- design-system.md tokens are missing for the new component styling

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
