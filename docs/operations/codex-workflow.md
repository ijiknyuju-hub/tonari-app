# Codex Workflow

Codex should work from a GitHub issue or a goal file.

## Input

Give Codex one of:

- a GitHub issue number
- a goal file such as `/goal docs/goals/000-github-ai-workflow-goal.md`
- a small explicit task with clear scope

## Rules

- Read the issue or goal before editing.
- Check `git status` before making changes.
- Do not mix unrelated uncommitted changes into the task.
- Do not make unrelated formatting or cleanup changes.
- Stop and ask when the spec is unclear.
- Keep the change small and reviewable.
- Preserve existing CI unless the task says to change it.
- Do not add secrets, `.env.local`, or value-filled environment files.

## Verification

Run relevant checks when possible:

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If a script is unavailable, report `skipped: script missing`. If a check fails for an existing reason, report that clearly. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

## PR Notes

The PR body should include:

- what changed
- why it changed
- verification commands and results
- skipped checks and reasons
- risks or human review points

Do not claim a check passed unless it actually passed in the current work.
