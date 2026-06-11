# Objective

Convert the top page from the v2.5 LP into the Phase 0 app entry (spec v2.7 §5.2, implementation unit 1): hero copy, a 「作れる料理を選ぶ」 CTA, sample dish cards, and no LINE CTA.

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.2, §9.2).

The v2.5 LP (built in PR #9, goal 001) had a LINE CTA as the main conversion. v2.7 retires that: ads now land directly on the top page, which acts as "LP兼Webアプリ入口". The conversion to validate is starting the dish-selection flow, not LINE registration.

**Prerequisite:** the LP implementation (PR #9 / branch `feature/phase0-lp`: `app/page.tsx` LP, `app/legacy/page.tsx`) must be in the working branch. Goal 002 (dish data) must be done — sample cards on the top screen use it.

# Scope

- `app/page.tsx` — rework the LP into the app entry:
  - Hero: 「いつもの料理から、次の一品へ。」 plus the short description:

    ```
    作れる料理を選ぶだけ。
    少し変えれば作れそうな料理を、となりごはんが提案します。
    ```

  - Primary CTA button: 「作れる料理を選ぶ」. It starts the selection flow (until goal 004 exists, it may link to a `/select` route stub or an in-page anchor — keep the wiring trivial and note it in the report).
  - 2-3 sample dish cards rendered from `data/dishCards.ts` (static preview, e.g. 麻婆春雨), showing title, 「〇〇が作れるなら近い」, and 1-2 reasons.
  - A small 「試作版です」 note (spec §9.1).
  - **Remove the LINE CTA entirely** (button, env var usage, placeholder URL). No LINE trace may remain on the page.
- `app/layout.tsx` — update metadata if the LP-era description mentions LINE.
- Mobile-first, app-like look (large buttons, card visuals). Reuse the existing styling approach in `app/globals.css`.

# Out of Scope

- The selection screen itself, recommendation logic, card list/detail, save feature (goals 004-008).
- Event tracking (goal 009).
- `app/legacy/` and prototype code under `components/`, `lib/`, `app/api/`, `app/share/`.
- LINE/LIFF/Supabase/auth/DB of any kind.
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.2, §9)
- `app/page.tsx` (current LP)
- `app/layout.tsx`
- `data/dishCards.ts`, `types/dish.ts` (from goal 002)
- `app/globals.css`

# Implementation Plan

1. Inspect the current state; confirm the LP code and goal 002 data are present (stop if not).
2. Rework `app/page.tsx` per Scope.
3. Update metadata if needed.
4. Run verification.
5. Report changed files and results.

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

- the LP implementation (PR #9) or goal 002 data is missing from the branch
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
