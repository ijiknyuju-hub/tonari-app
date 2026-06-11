# AGENTS.md

This file gives Codex the minimum operating rules for this repository.

## Repository Purpose

`tonari-app` is the repository for Tonari Gohan, a Next.js application for helping people choose nearby dishes from their own cooking repertoire.

This repository should be treated as the Tonari Gohan app repository. Historical `sekaishi-chizu` branches, issues, and PRs may exist, but new work in this repository should be about Tonari Gohan unless a human explicitly says otherwise.

## Key Locations

- Product specs: `docs/specs/`
- Goal files: `docs/goals/`
- Decisions: `docs/decisions/`
- Operations docs: `docs/operations/`
- App routes: `app/`
- Shared components: `components/`
- Shared app logic and types: `lib/`
- GitHub workflow: `.github/workflows/codex-task.yml`
- Issue templates: `.github/ISSUE_TEMPLATE/`
- PR template: `.github/pull_request_template.md`

## Before Starting Work

Always check the repository state first:

```bash
git status
git branch --show-current
git remote -v
```

If the current branch has uncommitted or untracked files that are not part of the task, do not delete or rewrite them. Work around them and report them.

## Files to Read First

For implementation work, read the goal or issue first, then inspect the files it names.

For app behavior work, usually start with:

- `docs/goals/*.md` for the active goal
- `docs/operations/ai-workflow.md`
- `docs/operations/github-workflow.md`
- `lib/types.ts`
- `lib/storage.ts`
- the specific files named by the issue or goal

For GitHub or AI workflow work, start with:

- `README.md`
- `docs/operations/ai-workflow.md`
- `docs/operations/github-workflow.md`
- `docs/operations/codex-workflow.md`
- `docs/operations/fable-workflow.md`

## Verification Commands

Use the package manager already present in the repo. This repo uses npm.

Run relevant checks when possible:

```bash
npm run lint
npm run typecheck
npm run build
```

If a script does not exist or a check fails because of the existing codebase or environment, report the exact command and result.

## Rules

- Check `git status` before editing.
- Do not overwrite uncommitted user changes.
- Do not add features that are not in the issue, goal, or explicit request.
- Leave large design changes as a proposal or separate issue unless explicitly requested.
- Never commit secrets or real credentials.
- Do not create `.env.local` or other value-filled environment files.
- Keep changes small, reviewable, and easy to revert.
- Do not delete historical branches, files, or workflow history without explicit human approval.
- Do not directly push to `main`.
- Preserve existing CI unless the task is specifically to change CI.

## PR Report Format

When reporting work for a PR, include:

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly.
