> **SUPERSEDED (2026-06-11):** Spec v2.7 replaced the LP+LINE validation plan with an
> ad-driven web-app-style MVP. Do not implement this goal. The LP itself was implemented
> in PR #9 (`feature/phase0-lp`) and is converted into the app entry by goal 003.
> See `docs/specs/tonari-gohan-spec-v2.7.md` and goals 002-011.

# Objective

Implement the Phase 0 entry-validation landing page (LP) for Tonari Gohan as a single static page. The LP communicates the concept and routes visitors to LINE registration. Nothing else.

# Product Context

Tonari Gohan spec v2.5 (Notion: "となりごはん 仕様書 v2.5 — 最終方針・Phase 0実行版", 2026-06-11, §9 and §24) defines the validation order:

```
LP → LINE manual validation → thin Web / LIFF → mobile app
```

This goal covers only the first step (Phase 0-A). The LP exists to answer two questions:

1. Does the concept "いつもの料理から、次の一品へ" make people stop?
2. Do visitors tap the LINE CTA?

After a visitor adds the LINE official account as a friend, a **human operator manually** asks them "普段作れる料理を3〜5個教えてください" and runs the card/reminder loop by hand (spec §10.3). The LP has no form, no input UI, and no app features. It only hands visitors to LINE.

The existing app under `app/` (tab home, dish cards, ingredients screen) is the shelved prototype. The LP becomes the new top page; the prototype is kept reachable but untouched.

# Scope

- `app/page.tsx` — replace with the new LP (static, Server Component, no `"use client"`).
- `app/legacy/page.tsx` — new file; move the current content of `app/page.tsx` here unchanged (do not delete the prototype).
- `app/layout.tsx` — only if needed to set page metadata (title / description).

## LP structure (top to bottom, nothing more)

1. **Hero**: catch copy + CTA button.
2. **Concept section**: the base copy below, formatted for readability.
3. **Three-step section**: 「覚えていてくれる → 思い出させてくれる → 作ったら蓄積してくれる」.
4. **Phase 0 note**: one line such as 「現在は先行体験版です。先着10名程度・手動でご案内します。」.
5. **Footer CTA**: the same CTA button repeated.

## Copy (from spec §9.2 — use verbatim, do not rewrite)

```
いつもの料理から、次の一品へ。

唐揚げが作れるなら、次は油淋鶏。
カレーが作れるなら、次はドライカレー。
チャーハンが作れるなら、次は天津飯。

作れる料理を登録すると、
少し変えれば作れそうな候補を提案します。

作りたい料理は保存。
数日後に一度だけ思い出します。
作ったら、あなたのレパートリーが増えていきます。
```

The hero headline is the first line 「いつもの料理から、次の一品へ。」. The three dish examples go in the hero or the concept section.

## CTA

- Button label: 「LINEで試してみる」 (fixed, both placements).
- Link target: read from `NEXT_PUBLIC_LINE_FRIEND_URL`. If unset, fall back to the placeholder `https://lin.ee/PLACEHOLDER` and leave a code comment `// TODO: set NEXT_PUBLIC_LINE_FRIEND_URL`. Do not create `.env.local`.
- Plain `<a>` link. No LINE SDK, no tracking parameters.

## Metadata and style

- Title: 「となりごはん — いつもの料理から、次の一品へ」. Description: a one-line summary of the copy.
- Mobile-first (assume SNS inflow on ~375px screens). Use the existing styling setup in `app/globals.css`. No new dependencies.

# Out of Scope

Do not implement, and do not leave traces of (links, disabled buttons, "coming soon" UI):

- LINE Messaging API, LIFF, LINE Login integration (the CTA is a plain external link).
- Supabase, database, auth, signup forms, email capture.
- Dish cards, dish selection UI, recommendation logic, reminders, cook records, ◎○△ ratings, repertoire counter.
- Analytics tooling.
- Any change to `components/`, `lib/`, `app/api/`, `app/share/` (shelved prototype — keep reachable at `/legacy`, otherwise untouched).
- OGP image generation (text metadata only).
- Vercel deployment or production resume.

# Files to Read First

- `AGENTS.md`
- `README.md`
- `docs/operations/ai-workflow.md`
- `docs/operations/github-workflow.md`
- `app/layout.tsx`
- `app/page.tsx` (only to move it; understanding the prototype logic is not required)
- `app/globals.css`
- `package.json` (scripts)

Do not read into `components/` or `lib/` — they belong to the shelved prototype and are out of scope.

# Implementation Plan

1. Inspect the current state (`git status`, current branch). Base branch: `ui/improvement-cycle-1`.
2. Move the current `app/page.tsx` content to `app/legacy/page.tsx`.
3. Implement the LP as the new `app/page.tsx` (hero → concept → three steps → Phase 0 note → footer CTA). The CTA button may be a small local component inside `page.tsx`.
4. Set metadata.
5. Run verification.
6. Report changed files and results.

If files other than `app/page.tsx`, `app/legacy/page.tsx`, and `app/layout.tsx` need changes, stop and ask first.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Then start `npm run dev` and confirm:

- `/` renders the LP (the prototype UI must not appear).
- `/legacy` renders the prototype without crashing.
- The CTA 「LINEで試してみる」 appears twice and links to `NEXT_PUBLIC_LINE_FRIEND_URL` (placeholder when unset).
- No horizontal scroll or layout break at 375px width.
- The copy matches spec §9.2 verbatim.
- No console errors.

# Stop and Ask Conditions

Stop and ask if:

- moving `app/page.tsx` to `/legacy` breaks the build in a way that requires editing prototype code (`components/`, `lib/`, `app/api/`).
- changes outside `app/page.tsx`, `app/legacy/page.tsx`, `app/layout.tsx` become necessary.
- the existing global styling cannot support the LP without a styling-infrastructure change.
- the real LINE friend URL seems required — it is not; keep the placeholder. A human sets the env var later.
- unrelated uncommitted user changes would need to be overwritten.

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes

## Human Follow-ups (handoff to Phase 0-B manual validation)
- Set NEXT_PUBLIC_LINE_FRIEND_URL to the real LINE Official Account friend URL.
- Resume Vercel deployment.
- Share the LP with 2-3 acquaintances; after each LINE registration, manually ask
  「普段作れる料理を3〜5個教えてください」 and start the manual card/reminder loop (spec §10.3).
```

Mention skipped checks explicitly.
