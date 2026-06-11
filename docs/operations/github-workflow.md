# GitHub Workflow

GitHub is the source of truth for implementation units, review, and merge decisions.

## Branches

Use one branch per issue or goal.

Recommended branch names:

```text
feature/issue-12-short-name
fix/issue-13-short-name
infra/issue-14-short-name
docs/issue-15-short-name
```

Do not push directly to `main`.

## Issues

Use issues to describe small, reviewable units of work.

Each issue should include:

- objective
- context
- scope
- out of scope
- acceptance criteria
- verification
- stop-and-ask conditions
- notes for Codex

## Pull Requests

Use one PR per issue whenever possible.

Each PR should include:

- summary
- related issue
- changed files or behavior
- verification results
- screenshots when visual behavior changed
- out-of-scope items
- risks or notes

## Merge Checklist

Before merging:

- The PR matches the issue scope.
- No secrets or private values were added.
- Existing unrelated changes were not overwritten.
- Relevant checks were run or skipped with a reason.
- CI is passing, or a human explicitly accepts the risk.
- A human has made the final merge decision.

## CI Notes

This repository already has `.github/workflows/codex-task.yml`.

Do not make broad CI changes unless the issue is specifically about CI. If CI needs improvement, document the recommendation here or in `docs/operations/repository-strategy.md` and create a separate issue.

## When Specs Change

If implementation reveals that the spec is incomplete or wrong:

1. Stop the current implementation if continuing would be risky.
2. Write the question or proposed change in the issue or goal.
3. Ask a human to confirm.
4. Continue only after the scope is clear.
