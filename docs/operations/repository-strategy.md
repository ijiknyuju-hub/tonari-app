# Repository Strategy

This repository should be managed as the Tonari Gohan application repository.

## Current State

`ijiknyuju-hub/tonari-app` is public and has historical branches, issues, and pull requests related to `sekaishi-chizu`.

Those branches and PRs should not be deleted automatically. They are part of the repository history.

## Recommended Direction

- Keep `tonari-app` focused on Tonari Gohan.
- Create new issues and PRs here only for Tonari Gohan work.
- Move future world-history-map work to a separate repository, recommended name: `history-map-note`.
- Do not delete `sekaishi-chizu` branches or history without human approval.
- If repository separation is needed, plan it in a separate human-approved issue.

## Public Repository Safety

This repository is public.

Never commit:

- real API keys
- real tokens
- private user data
- `.env.local`
- screenshots or mockups that contain private information

Use `.env.example` only for placeholder names and documentation.

## Next Cleanup Candidates

- Add labels for type, phase, AI owner, status, and priority.
- Create open issues for the next Tonari Gohan implementation goals.
- Decide whether historical `sekaishi-chizu` branches should remain archived or move to a dedicated repository.
- Review the current Codex Task workflow separately if CI reliability remains a problem.
