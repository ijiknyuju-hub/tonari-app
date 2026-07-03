# Objective

Build the FAB recording modal (3-step: dish select → emotion + photo → completion)
and the レベルアップ screen (/level-up). These are standalone screens/modals that
use the data model from goal 021.

# Spec Reference

- Spec: `docs/specs/spec-021-h5-continuity-features.md` (Features B and C)

# Dependencies

- [x] goal 021 (data model extension — UserState.available_ingredients, MadeRecord.photo_url)

# Design References

None. Follow existing design-system.md tokens. Warm cream background, orange accent,
soft shadows, 20px card radius.

# Product Context

FAB enables frictionless recording (H2 countermeasure: "記録が続かない").
レベルアップ screen makes growth visible (H4 countermeasure: "達成感がない").
Together they form the reward side of the continuity loop.

# Scope

## Files to create

- `components/mvp/RecordingModal.tsx` — 3-step FAB modal
- `components/mvp/RecordCompletion.tsx` — step 3 completion display (or inline in RecordingModal)
- `app/level-up/page.tsx` — page route
- `components/mvp/LevelUpScreen.tsx` — screen component

## RecordingModal spec

Modal overlay (not a page route). Three steps in internal state:

Step 1 — Dish selection:
- Show recent recommendations (use todaysPick for today + yesterday)
- Show bookmarked dishes
- Each as a row with dish name + emoji
- Tapping selects and advances to step 2
- "他の料理を探す" at bottom opens text filter over all dishes

Step 2 — Impression + photo:
- Large photo area (tap → browser file input, capture="camera" attribute)
- Photo is optional — skip is fine
- Three emotion buttons: 😋 最高 (great) / 🙂 まあまあ (ok) / 🤔 微妙 (meh)
- Tapping emotion → calls recordMade with the selected dish + rating + photo
- Advances to step 3

Step 3 — Completion:
- 🎉 icon + "{dish_name}を記録しました！"
- Repertoire count: unique dish IDs in made_records
- Cumulative days: unique dates in made_records
- Milestone hint: next milestone from [5, 10, 15, 20, 30, 50, 75, 100]
- "ホームに戻る" button → close modal

## LevelUpScreen spec

Full screen accessed via bottom nav tab.

Top to bottom:
1. Header text: "あなたのレパートリー"
2. Large number: "{N}品" — unique dishes in made_records
3. Subtitle: "累計 {M}日 料理した"
4. Progress bar: fill = current / next_milestone. Text: "あと{X}品で{milestone}品"
5. Monthly bar chart: group made_records by month, show count per month as CSS bars
   (inline styled divs, no chart library)
6. Dish list: all unique dishes with most recent made_at date and rating emoji
7. "マップを見る →" link to /map

Use only CSS for the bar chart — no external libraries.

## Analytics events

- `fab_record` with { dish_id, rating }
- `open_level_up` on page load

# Out of Scope

- HomeScreen FAB button placement (goal 023 integrates it)
- Bottom nav 4th tab (goal 023)
- Return nudge (goal 021)
- Photo gallery / full-screen photo view
- Level-up animation

# Files to Read First

- `AGENTS.md`
- `docs/specs/spec-021-h5-continuity-features.md`
- `types/dish.ts` (after goal 021 extension)
- `lib/mvp/useUserState.ts` (after goal 021 extension)
- `lib/mvp/todaysPick.ts`
- `data/v3.ts` — for dish names in recording flow
- `docs/design-system.md`

# Implementation Plan

1. Read updated types and useUserState after goal 021
2. Create RecordingModal with 3-step internal state machine
3. Create LevelUpScreen with derived computations (repertoire, days, milestones)
4. Create simple CSS bar chart for monthly growth
5. Create page route at app/level-up/page.tsx
6. Wire analytics events
7. Run lint + build

# Verification Requirements

```bash
npm run lint
npm run build
```

Manual verification (via dev server):
- Navigate to /level-up directly → screen renders with current data
- RecordingModal can be tested by importing into a temp page

# Stop and Ask Conditions

Stop and ask if:
- goal 021 types are not yet committed (check types/dish.ts for available_ingredients)
- useUserState.recordMade doesn't support the photo_url field
- browser file input for camera doesn't work in dev server context

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
