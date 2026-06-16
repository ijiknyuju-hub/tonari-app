# Objective

Create the basic GitHub and AI collaboration workflow for `ijiknyuju-hub/tonari-app`.

# Product Context

Tonari Gohan should be developed through small GitHub issues and pull requests. Fable should help with planning and review. Codex should implement scoped changes and report verification.

# Scope

- Repair and simplify `AGENTS.md`.
- Add operations docs for AI, GitHub, Codex, Fable, and repository strategy.
- Add a reusable goal template.
- Add GitHub issue templates.
- Add a pull request template.
- Replace the default README with a concise repository README.
- Confirm `.gitignore` covers common local and secret files.

# Out of Scope

- Product feature implementation.
- UI implementation.
- LINE, LIFF, Supabase, auth, or database work.
- Large refactors.
- Deleting historical `sekaishi-chizu` branches or PR history.
- Broad CI workflow changes.
- Adding secrets or `.env.local`.
- Deleting `.expo/` or `mockups/`.

# Files to Read First

- `AGENTS.md`
- `README.md`
- `.gitignore`
- `.github/workflows/codex-task.yml`
- `package.json`

# Implementation Plan

1. Check repository status, branch, and remote.
2. Confirm the current branch contains the existing UI work.
3. Create `infra/github-ai-workflow` from the current branch.
4. Add docs, issue templates, PR template, README, and `.gitignore` updates.
5. Run available verification.
6. Report changed files and skipped checks.

# Verification Requirements

Run:

```bash
git status
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

# Stop and Ask Conditions

Stop and ask if:

- the current branch should not include the existing 4 commits from `ui/improvement-cycle-1`
- existing user changes would need to be overwritten
- CI must be changed before proceeding
- `.expo/` or `mockups/` must be edited or deleted
- direct push to `main` becomes necessary

# Reporting Format

```md
## Summary

## Changed Files

## Branch

## Commands Run

## Existing Untracked Files

## AI Workflow Created

## GitHub Workflow Created

## Repository Strategy

## Not Implemented

## Risks / Notes

## Next Recommended Goal
```
