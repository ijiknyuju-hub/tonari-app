# Current Status

Last updated: 2026-06-16

## What's Done

- Spec v2.7 (ad-ready web app MVP) defined
- Spec v2.8 draft exists (tokens, nav, map features)
- Goals 001-018 created
- Goal 000 (GitHub AI workflow) completed
- Decision 001 (Claude=orchestration, Codex=implementation) accepted
- Decision 002 (near-complete MVP validation) accepted
- **Spec 018 complete** (v3 data model + phase0 cleanup)
  - `types/dish.ts`: v3 types (Dish, NearbyRelation, Variation, UserState, MadeRecord)
  - `data/v3.ts`: 10 base dishes + 52 target dishes + 52 NearbyRelation entries
  - 17 dead phase0 files deleted (old components + old lib)
  - Storage key migrated v28→v3
  - Build and lint pass clean
- **料理データ実作 complete** (AI candidate generation → owner review → v3 data)
  - 10 base dishes: curry, fried-rice, karaage, mapo-tofu, napolitan, nikujaga, omurice, oyakodon, peperoncino, yakisoba
  - 52 adopted NearbyRelation entries (from 62 candidates, 10 rejected)
  - Review history in `data/candidates.json`
  - Notion DB: 68 records with owner judgments

## What's Next

- **Goal 019: Home Screen Card UI** (spec approved 2026-06-16, ready for implementation)
  - Spec: `docs/specs/spec-019-home-card-ui.md` (approved)
  - Goal: `docs/goals/019-home-card-ui.md` (ready)
  - Next: `/codex-goal` to start implementation
  - Scope: featured card + horizontal scroll small cards + detail screen + bookmark/made buttons
  - Not in scope: real photos, notification, onboarding, memo/edit

## Recent Decisions

- See docs/decisions/ for full log
- 生姜焼き→唐揚げ: base dish replacement due to lack of derivative dishes (2026-06-15)
