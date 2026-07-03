# Objective

Integrate all H5 continuity features into the HomeScreen and BottomNav.
This is the final integration goal: wire up the components from goal 021
and modal from goal 022 into the existing home screen.

# Spec Reference

- Spec: `docs/specs/spec-021-h5-continuity-features.md`

# Dependencies

- [x] goal 021 (data model + IngredientChipFilter + ReturnNudge components)
- [x] goal 022 (RecordingModal + LevelUpScreen)

# Design References

None. Components already follow design-system.md.

# Product Context

This goal wires everything together into a cohesive home experience.
After this, the full H5 continuity loop is live:
open → nudge → record → filter → browse → FAB record → see growth → come back.

# Scope

## Files to modify

- `components/mvp/HomeScreen.tsx` — main integration point:
  1. Add ReturnNudge below header (with show/dismiss logic)
  2. Add IngredientChipFilter below "other cards" section
  3. Change otherCards logic: remove `r.tab === mode` filter, limit to 3
  4. Apply ingredient filter to featured + other cards
  5. Add FAB button (fixed position, opens RecordingModal)
  6. Track last_active_date on mount
  7. Compute yesterday's dish for nudge

- `components/mvp/BottomNav.tsx` — add 4th tab:
  - Label: "レベルアップ"
  - Icon: chart-bar or trophy (use existing icon pattern)
  - Route: /level-up
  - Position: 2nd tab (ホーム | レベルアップ | 食材 | マップ)

- `lib/mvp/analytics.ts` — add new event names if needed

## Integration details

### Return nudge logic in HomeScreen

```
const today = dateISO
const yesterday = compute from dateISO - 1 day
const showNudge = state.last_active_date !== '' && state.last_active_date < today
const yesterdayDish = todaysPick(selectedBaseDishIds, mode, yesterday)
```

On mount: call `updateLastActiveDate()` to set today as last active.

### Ingredient filter logic in HomeScreen

```
const activeIngredients = state.available_ingredients
const hasFilter = activeIngredients.length > 0

// Filter function: does this relation only need ingredients the user has?
const matchesFilter = (r: NearbyRelation) =>
  !hasFilter || r.new_ingredients.every(i => activeIngredients.includes(i))

// Apply to featured pick
const filteredFeatured = matchesFilter(featured) ? featured : fallbackPick(...)

// Apply to other cards
const filteredOtherCards = otherCards.filter(matchesFilter)
```

### Cross-difficulty other cards

Change line ~47 in HomeScreen.tsx:
```
// Before:
r.tab === mode &&
// After:
// (removed — show all difficulties from same source)
```

And add `.slice(0, 3)` limit.

### FAB integration

```tsx
const [showRecordModal, setShowRecordModal] = useState(false)

// In JSX, before BottomNav:
<button className="fab-button" onClick={() => setShowRecordModal(true)}>
  + 作った
</button>
{showRecordModal && <RecordingModal onClose={() => setShowRecordModal(false)} />}
```

### Analytics

Wire these events:
- `nudge_record` — when user taps "作った!" on nudge
- `nudge_dismiss` — when user taps "今度ね"
- `ingredient_filter_toggle` — when user taps a chip

# Out of Scope

- New component creation (done in goals 021 + 022)
- Data model changes (done in goal 021)
- レベルアップ screen content (done in goal 022)

# Files to Read First

- `AGENTS.md`
- `docs/specs/spec-021-h5-continuity-features.md`
- `components/mvp/HomeScreen.tsx` (current implementation)
- `components/mvp/BottomNav.tsx`
- `components/mvp/IngredientChipFilter.tsx` (from goal 021)
- `components/mvp/ReturnNudge.tsx` (from goal 021)
- `components/mvp/RecordingModal.tsx` (from goal 022)
- `lib/mvp/useUserState.ts` (after goal 021)
- `lib/mvp/todaysPick.ts`

# Implementation Plan

1. Read all component files from goals 021 and 022
2. Read current HomeScreen.tsx and plan insertion points
3. Add ReturnNudge integration (show logic + callbacks)
4. Modify otherCards: remove tab filter, add slice(0, 3)
5. Add IngredientChipFilter integration (below other cards, with filter logic)
6. Apply ingredient filter to featured + other cards
7. Add FAB button + RecordingModal state
8. Update BottomNav with 4th tab
9. Wire analytics events
10. Run lint + build

# Verification Requirements

```bash
npm run lint
npm run build
npm run dev  # manual check: home shows all new features, FAB opens modal
```

# Stop and Ask Conditions

Stop and ask if:
- Components from goal 021/022 have different prop interfaces than expected
- HomeScreen structure has changed since spec was written
- Ingredient filter causes all cards to be hidden in default state

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
