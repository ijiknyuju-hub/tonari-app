# Objective

Create the Phase 0 top screen as the spec v2.7 web-app-style MVP entry (spec v2.7 §5.2, implementation unit 1): hero copy, a 「作れる料理を選ぶ」 CTA, sample dish cards, and no LINE CTA.

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.2, §9.2).

PR #9 / goal 001 is superseded by spec v2.7 and should not be merged as the basis for this work. The old v2.5 LP assumed LINE registration as the conversion, but v2.7 retires that plan. Ads should land directly on the root page, which acts as a lightweight web-app MVP entry. The conversion to validate is starting the dish-selection flow and eventually tapping 「作ってみたい」, not LINE registration.

Goal 002 (dish data) must be done before this goal because the top screen renders sample cards from the Phase 0 static data. The root page should be built from the current branch state, not from PR #9.

# Scope

- `app/page.tsx` — make `/` the v2.7 app entry:
  - If the current root page is an older prototype that still needs to stay reachable, move it to `app/legacy/page.tsx` first. Do not depend on PR #9's LP implementation.
  - Hero: 「いつもの料理から、次の一品へ。」 plus the short description:

    ```text
    作れる料理を選ぶだけ。
    少し変えれば作れそうな料理を、となりごはんが提案します。
    ```

  - Primary CTA button: 「作れる料理を選ぶ」. It starts the selection flow. Until goal 004 exists, it may link to a `/select` route stub or an in-page anchor. Keep the wiring trivial and note it in the report.
  - 2-3 sample dish cards rendered from `data/dishCards.ts` (static preview, e.g. 鮭チャーハン / 親子丼 variations), showing title, 「〇〇が作れるなら近い」, and 1-2 reasons.
  - A small 「試作版です」 note (spec §9.1).
  - No LINE CTA, LINE env var, placeholder URL, or LINE-oriented copy.
- `app/layout.tsx` — update metadata if the LP-era description mentions LINE or if the product framing is still the old LP.
- Mobile-first, app-like look (large buttons, card visuals). Reuse the existing styling approach in `app/globals.css`.

# Out of Scope

- The selection screen itself, recommendation logic, card list/detail, save feature (goals 004-008).
- Event tracking (goal 009).
- Prototype code under `components/`, `lib/`, `app/api/`, `app/share/`, except for moving the old root page to `app/legacy/page.tsx` if needed.
- LINE/LIFF/Supabase/auth/DB of any kind.
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.2, §9)
- `app/page.tsx` (current root page)
- `app/layout.tsx`
- `data/dishCards.ts`, `types/dish.ts` (from goal 002)
- `app/globals.css`

# Implementation Plan

1. Inspect the current state; confirm goal 002 data is present (stop if not).
2. Inspect the current root page. If it is a prototype that should remain accessible, move it to `/legacy`.
3. Rework `app/page.tsx` per Scope as the v2.7 app entry.
4. Update metadata if needed.
5. Run verification.
6. Report changed files and results.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev` confirm:

- `/` shows hero copy, 「作れる料理を選ぶ」 CTA, sample cards, and the 試作版 note.
- The string "LINE" does not appear anywhere on `/` (markup or visible text).
- No layout break or horizontal scroll at 375px width.
- No console errors.

# Stop and Ask Conditions

Stop and ask if:

- goal 002 data is missing from the branch
- the spec conflicts with existing code
- unrelated user changes would need to be overwritten
- implementation requires a larger architecture change (e.g. a routing restructure)

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly.
