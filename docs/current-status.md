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

- **Goal 019: Home Screen Card UI** — COMPLETED 2026-06-16
  - FeaturedCard + CompactCard + DishDetailScreen + HomeScreen rewrite
  - design-system.md created for AI-safe UI constraints
  - All 52 dish detail pages statically generated
  - Verified: tabs, bookmark, made-it, detail navigation, empty state
- **Next goal**: TBD — onboarding flow, real photos, or notification system

## Recent Decisions

- See docs/decisions/ for full log
- 生姜焼き→唐揚げ: base dish replacement due to lack of derivative dishes (2026-06-15)
