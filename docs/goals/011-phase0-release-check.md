# Objective

Run the Phase 0 pre-release check and fix only small blocking issues, so the MVP is at minimum quality for ad traffic (spec v2.7 implementation unit 10).

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§9, §10).

Last gate before the URL goes into ads. This is a verification goal: walk the checklist, fix only small, low-risk blockers found by it, and report everything else as findings.

Runs after goals 002-010 are merged.

# Scope

Execute this checklist (spec unit 10) and record pass/fail per item:

1. スマホ（375px）で崩れない — top / select / recommendations / detail / saved list
2. 料理を選べる（チップ選択、0個では進めない）
3. カードが出る（選択に応じた近い順、「〇〇が作れるなら近い」表示）
4. 詳細が開く（差分・買い足し・ざっくり手順）
5. 作ってみたいが保存される（ボタンが保存済みに変わる）
6. リロードしても保存が残る（localStorage）
7. 保存一覧が見られる（空状態も正しい）
8. LINE導線が主導線に残っていない（"LINE" が画面・メタデータに出ない）
9. トップで何のサービスか伝わる（試作版表記あり）
10. 計測イベント7種が正しく発火する

Plus: `npm run lint` / `npm run build` pass, and no console errors through the full flow.

Fixes allowed in this goal: copy typos, broken styles, missing empty states, dead buttons — anything fixable in a few lines without design changes.

# Out of Scope

- New features or visual redesign (file findings instead).
- Vercel deployment / production resume / ad account setup (human follow-ups).
- Prototype code (`app/legacy/` etc.).
- Data content expansion (Phase 0.5).

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§9, §10, unit 10)
- The phase0 surfaces: `app/page.tsx`, select/recommend/saved steps, `components/phase0/*`, `lib/phase0/*`

# Implementation Plan

1. Inspect the current state; confirm goals 002-010 are merged.
2. Walk the checklist at 375px, recording pass/fail with notes.
3. Fix small blockers; re-check the affected items.
4. Run verification.
5. Report the full checklist results, fixes made, and remaining findings.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

The deliverable is the completed checklist (all 10 items + lint/build) with explicit pass/fail per item.

# Stop and Ask Conditions

Stop and ask if:

- a checklist failure requires more than a small fix (design or logic change)
- checklist items conflict with what was actually built in goals 002-010
- unrelated user changes would need to be overwritten

# Reporting Format

```md
## Summary

## Checklist Results
(1-10 above, plus lint/build — pass/fail each, with notes)

## Changed Files
(fixes made in this goal)

## Verification

## Not Implemented / Findings
(issues found but out of scope here)

## Risks / Notes

## Human Follow-ups
- Resume Vercel deployment and confirm the production URL.
- Set up the ad campaign (small budget, multiple creatives — spec §9.3-9.4).
- Watch the funnel events against the Go / No-Go thresholds (spec §10.2).
```

Mention skipped checks explicitly.
