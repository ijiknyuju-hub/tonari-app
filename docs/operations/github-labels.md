# GitHub Labels

This repository uses labels to make Fable planning and Codex implementation easier to route.

## Label List

| Label | Purpose |
| --- | --- |
| `type:infra` | Repository, workflow, CI, or tooling work |
| `type:feature` | New product or user-facing capability |
| `type:fix` | Bug fix or behavior correction |
| `type:docs` | Documentation-only work |
| `type:review` | Review, audit, or feedback task |
| `phase:0` | Foundation or setup phase |
| `phase:1` | First implementation phase |
| `phase:mock` | Mockup, prototype, or exploration phase |
| `ai:fable` | Best handled by Fable planning or review |
| `ai:codex` | Best handled by Codex implementation |
| `status:needs-human` | Needs human decision or clarification |
| `status:blocked` | Blocked until dependency or question is resolved |
| `priority:high` | High priority |
| `priority:normal` | Normal priority |
| `priority:low` | Low priority |

## Fable Label Examples

When Fable creates an issue, it should choose labels that describe the task type, phase, AI owner, and priority.

Examples:

- Product planning issue: `type:feature`, `phase:1`, `ai:fable`, `priority:normal`
- Mockup review issue: `type:review`, `phase:mock`, `ai:fable`, `priority:normal`
- Repository setup issue: `type:infra`, `phase:0`, `ai:codex`, `priority:high`
- Documentation cleanup issue: `type:docs`, `phase:0`, `ai:codex`, `priority:low`
- Question that needs a decision: `status:needs-human`

## Codex Label Guidance

When Codex works on an issue, it should check labels before implementation.

- `ai:codex`: Codex can usually implement the issue.
- `ai:fable`: Codex should treat the issue as planning or review unless asked to implement.
- `status:needs-human`: Stop and ask for the missing decision before implementation.
- `status:blocked`: Do not proceed until the blocker is resolved.
- `type:review`: Default to review mode and do not edit files unless explicitly asked.
- `type:infra` or `type:docs`: Avoid product feature changes.
- `priority:high`: Report blockers quickly and keep the scope tight.

## Maintenance Rules

- Do not delete existing labels without human approval.
- Do not change existing issues or pull requests when adding labels.
- Keep new labels simple and operational.
- If a new label is needed, document it here before relying on it in issues.
