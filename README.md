# Tonari Gohan

Tonari Gohan is a Next.js app for helping people choose what to cook next from nearby dishes in their own repertoire.

This repository is currently in an early development phase. Product behavior should be specified in issues or `docs/specs/` before implementation.

## Development Roles

- Fable: reads specs, drafts issues and goal files, and reviews plans or PRs.
- Codex: implements one issue or goal at a time, runs checks, and prepares PR-ready changes.
- Human: decides product direction, priorities, final review, and merge.

## Documentation

- AI workflow: `docs/operations/ai-workflow.md`
- GitHub workflow: `docs/operations/github-workflow.md`
- Codex workflow: `docs/operations/codex-workflow.md`
- Fable workflow: `docs/operations/fable-workflow.md`
- Repository strategy: `docs/operations/repository-strategy.md`
- Goal template: `docs/goals/_template-goal.md`

## Local Development

Use npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run build
```

`npm run typecheck` may be added later if the project defines a dedicated script.

## GitHub Workflow

- Work from a GitHub issue or `docs/goals/*.md` file.
- Use one branch per issue or goal.
- Use one pull request per issue whenever possible.
- Do not push directly to `main`.
- Keep changes small and reviewable.
- Run relevant checks and document any skipped checks.

## Secrets

This repository is public. Do not commit real secrets, private user data, `.env.local`, or value-filled environment files.

Use `.env.example` only for placeholder names when environment documentation is needed.
