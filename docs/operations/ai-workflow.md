# AI Workflow

This repository uses AI tools as helpers around small GitHub issues and pull requests.

## Roles

### Fable

- Read specs and product notes.
- Draft GitHub issues.
- Write goal files in `docs/goals/`.
- Review implementation plans.
- Review pull requests before merge.

### Codex

- Implement one issue or goal at a time.
- Run relevant checks such as lint, typecheck, and build when possible.
- Create pull requests or prepare PR-ready changes.
- Report changed files, verification results, skipped checks, and unresolved risks.

### Human

- Decide product direction.
- Set priorities.
- Confirm final PR quality.
- Decide whether and when to merge.

## Operating Principles

- 1 Issue = 1 small task.
- 1 PR = 1 Issue.
- Large features should be split into multiple issues.
- If the spec is unclear, Codex should stop and ask.
- Fable should act as planning and review support, not as the primary implementer.
- Codex should handle implementation, verification, and PR preparation.

## Recommended Flow

1. Human or Notion spec defines the intent.
2. Fable turns the intent into a GitHub issue and optional goal file.
3. Codex implements the issue on a branch.
4. Codex runs relevant checks and reports results.
5. Codex opens or prepares a PR.
6. Fable or a human reviews the PR.
7. Human merges after CI and review are acceptable.
