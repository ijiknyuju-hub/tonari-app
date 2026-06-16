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
- **Goal 020: Onboarding** — COMPLETED 2026-06-16
  - WelcomeScreen (app intro + はじめる) + BaseDishSelector (10 dishes, 2x5 grid)
  - HomeScreen redirects first-time visitors to /onboarding
  - Shared useIsClient hook extracted to lib/mvp/useIsClient.ts
  - Spec: docs/specs/spec-020-onboarding.md
- **Goal 009: Event Tracking** — COMPLETED 2026-06-16
  - 6 events wired via Vercel Analytics: start_select_dishes, select_base_dish,
    show_recommendations, open_dish_card, bookmark, page_view (auto)
  - open_saved_list skipped (no saved list screen yet)
- **Goal 010: Ad-Ready Polish** — COMPLETED 2026-06-16
  - Most items already covered by goals 018-019 UI rebuild
  - Added "試作版です" notice in BottomNav
- **Goal 011: Release Check** — COMPLETED 2026-06-16
  - 9/10 checklist items PASS, 1 finding (saved list screen not implemented)
  - lint/build/console all clean
  - **Ready for ad traffic** — core funnel works end-to-end

## Next Steps (post-release)
- Resume Vercel deployment and confirm production URL
- Set up ad campaign (small budget, multiple creatives)
- Watch funnel events against Go/No-Go thresholds
- Saved list screen (Phase 0.5)

## Recent Decisions

- See docs/decisions/ for full log
- 生姜焼き→唐揚げ: base dish replacement due to lack of derivative dishes (2026-06-15)
