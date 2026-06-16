# Objective

Polish the Phase 0 flow into an app-like, ad-ready look on mobile (spec v2.7 §9.1-9.2, implementation unit 9).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§9, §10.3).

Ad visitors decide in seconds. The first view must say "これは自分の作れる料理から広げるアプリだ" instantly, and the whole flow must feel like an app prototype, not a webpage. A recipe-app-ish look is an explicit No-Go cause (「UIがレシピアプリ寄り」 → 「差分」を前面に出す).

This goal runs after goals 002-009 are merged and the flow works end to end.

# Scope

Visual/UX adjustments only, across the phase0 surfaces (`app/page.tsx`, select/recommend/saved steps, `components/phase0/*`):

- Mobile-first pass at 375px: first view of the top page fits hero + CTA without scrolling.
- Larger primary buttons; one obvious primary action per screen.
- Card styling: spacing, rounded corners, soft shadows; the difference-explanation (「〇〇が作れるなら近い」 + reasons) visually dominant over the title.
- App-like persistent affordance: a fixed bottom CTA or a simple bottom nav (top / saved list) — pick one, keep it minimal.
- Consistent spacing/typography scale via `app/globals.css` (no new styling libraries).
- Keep the 「試作版です」 note visible but unobtrusive.

# Out of Scope

- New features, screens, data, or logic changes.
- Changing event tracking (call sites must keep firing — verify, don't move).
- Desktop-specific design work (must not break, but mobile is the target).
- Prototype code (`app/legacy/`, top-level `components/`).
- New dependencies.

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.2, §9, §10.3)
- `app/page.tsx`, `app/globals.css`
- `components/phase0/` (all)

# Implementation Plan

1. Inspect the current state; walk the full flow at 375px and list the weakest spots first.
2. Apply the Scope adjustments, smallest diffs first.
3. Re-walk the flow; run verification.
4. Report changed files with before/after notes per screen.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then with `npm run dev` at 375px width confirm:

- Top first view: hero + 「作れる料理を選ぶ」 CTA visible without scrolling.
- Every screen has one clear primary action; all tap targets are comfortably sized.
- The difference-explanation is the visually dominant element on cards.
- All seven analytics events still fire through the flow.
- No horizontal scroll on any screen; no console errors.

# Stop and Ask Conditions

Stop and ask if:

- a desired adjustment requires restructuring components or routing (not just styling)
- the spec conflicts with existing code
- unrelated user changes would need to be overwritten
- a new dependency seems necessary

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly.
