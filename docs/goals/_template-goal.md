# Objective

State the single outcome Codex should produce.

# Product Context

Explain why this matters for Tonari Gohan and link any relevant specs or issues.

# Scope

List the files, behaviors, or docs that may be changed.

# Out of Scope

List what Codex must not change.

# Files to Read First

- `AGENTS.md`
- `README.md`
- Add task-specific files here.

# Implementation Plan

1. Inspect the current state.
2. Make the smallest scoped change.
3. Run relevant verification.
4. Report changed files and results.

# Verification Requirements

List required checks, for example:

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

# Stop and Ask Conditions

Stop and ask if:

- the spec conflicts with existing code
- unrelated user changes would need to be overwritten
- secrets or private data appear in scope
- implementation requires a larger architecture change

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```
