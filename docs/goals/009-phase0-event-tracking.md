# Objective

Add minimal, PII-free event tracking for the Phase 0 funnel (spec v2.7 §9.5, implementation unit 8).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§9.5, §10).

Ad validation is meaningless without funnel numbers. Phase 0 needs exactly these events, nothing more:

```text
page_view
start_select_dishes
select_base_dish
show_recommendations
open_dish_card
click_want_to_make
open_saved_list
```

`click_want_to_make` is the primary metric. No DB, no login, no personal data — dish ids and counts only.

# Scope

- `lib/phase0/analytics.ts` — new. A single `trackEvent(name, params?)` wrapper so the backend can be swapped:
  - typed event names restricted to the seven above
  - optional params limited to non-PII values (e.g. `dishId`, counts)
  - no-op safe during SSR and when the analytics backend is absent (dev)
- Backend: prefer **Vercel Analytics custom events** (`@vercel/analytics` — the repo deploys to Vercel) if it can be added cleanly; otherwise fall back to a `console.debug`-based stub behind the same wrapper and say so in the report. Do not add any other third-party SDK without stopping to ask.
- Fire events at:
  - `page_view` — top page load (use the backend's built-in pageview if it has one; then skip a custom duplicate and note it)
  - `start_select_dishes` — top CTA tap
  - `select_base_dish` — each chip selection (param: dishId)
  - `show_recommendations` — recommendation list shown (param: selected count)
  - `open_dish_card` — detail opened (param: dishId)
  - `click_want_to_make` — save action (param: dishId)
  - `open_saved_list` — saved list opened

# Out of Scope

- Cookies/consent banners, user ids, session stitching, A/B testing.
- Server-side or DB-backed logging.
- Dashboards (reading numbers in the analytics provider UI is enough).
- Prototype code.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§9.5)
- `package.json`, `vercel.json`
- `app/layout.tsx`
- The phase0 components from goals 003-008 (event call sites)

# Implementation Plan

1. Inspect the current state; confirm goals 003-008 are in the branch.
2. Add `lib/phase0/analytics.ts` and the chosen backend.
3. Insert the seven event calls at the listed sites.
4. Run verification.
5. Report changed files, the chosen backend, and a dev-mode event log sample.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev`, walk the funnel (top → select → recommendations → detail → save → saved list) and confirm every one of the seven events fires exactly once per action (visible via the dev stub log or provider debug mode), with no PII in params, and no console errors.

# Stop and Ask Conditions

Stop and ask if:

- adding `@vercel/analytics` requires config changes beyond `package.json` and a provider component in `app/layout.tsx`
- any event seems to need personal data to be useful
- the spec conflicts with existing code
- unrelated user changes would need to be overwritten

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly.
