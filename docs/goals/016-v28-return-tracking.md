# Objective

Implement PII-free return-visit tracking and complete the v2.8 event set (spec v2.8 draft §5.3, §6; implementation unit 6).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.8-draft.md` (§5.3, §6)

`return_visit` is one of v2.8's two primary metrics. It must work without any user ID: everything derives from localStorage timestamps on the device.

# Scope

1. `lib/mvp/visitTracking.ts` — new:
   - localStorage keys: `tonari.v28.firstVisitAt`, `tonari.v28.lastVisitAt` (ISO strings)
   - `recordVisit()`: on app load — if no firstVisitAt, set both and do nothing else; if lastVisitAt is >= 24h ago, fire `return_visit` with param `daysBucket`: `1-2d` | `3-7d` | `8d+` (based on time since lastVisitAt), then update lastVisitAt; if < 24h, just update lastVisitAt (no event)
   - SSR-safe; corrupt values reset cleanly; never throws
2. Call `recordVisit()` once per page load app-wide: a tiny client component (e.g. `components/mvp/VisitTracker.tsx`) mounted in `app/layout.tsx`. It renders nothing. Guard against double-fire in React StrictMode (module-level once flag).
3. `lib/phase0/analytics.ts` — add `return_visit` to the typed names. After this goal the full set is the 10 events of spec §6 (7 existing + mark_made + open_island_map + return_visit). Verify all 10 names exist in the union type; add any missing.
4. No UI changes.

# Out of Scope

- User IDs, cookies, fingerprinting, session stitching
- Server-side logging
- Any UI

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.8-draft.md` (§5.3, §6)
- `lib/phase0/analytics.ts`, `app/layout.tsx`
- `lib/phase0/useSavedDishes.ts` (storage patterns)

# Implementation Plan

1. Build visitTracking with the bucket logic.
2. Mount VisitTracker in layout.
3. Complete the event union type.
4. Run verification.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

Confirm by code reasoning: first visit fires nothing; revisit after >= 24h fires exactly one return_visit with the right bucket; revisit within 24h fires nothing but updates lastVisitAt; StrictMode double-mount does not double-fire; SSR build passes with no window access at module top level.

# Stop and Ask Conditions

Stop and ask if:

- layout.tsx integration conflicts with the Analytics provider
- unrelated user changes would need to be overwritten

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly. 日本語文字列はUTF-8を維持すること。
