# Decision 002: Validation Strategy — Near-Complete MVP over Incremental User Testing

Date: 2026-06-12
Status: Accepted

> Note: originally drafted as "Decision 001" by the owner; renumbered to 002 because
> `001-claude-codex-review-split.md` already exists.

## Context

The original approach considered validating the idea through lightweight mockups, LPs, or small user interviews before implementation. However, the owner currently has almost no distribution: a very small X account and only a few personal contacts. Therefore, recruiting testers for each iteration is the bottleneck, not build cost.

For Tonari Gohan, the core value is difficult to validate through signups or static mockups alone. The product needs to be experienced as an actual loop:

- registering a few familiar dishes
- seeing nearby recipe suggestions
- opening a recipe card
- understanding the difference from the original dish
- saving / marking dishes as "made" or "want to make"
- returning later for another suggestion

Research findings and project assumptions:

- LP + waitlist validation produces weak signal without existing traffic; registrations poorly predict actual cooking behavior.
- With AI coding agents, a near-complete MVP costs roughly the same as a polished LP, which weakens the case for LP-first validation.
- Static mockups are useful for design direction, but they cannot validate whether users actually return to the cooking suggestion loop.
- GPT Image 2 / image generation can be used to create finished-look UI references for recipe cards, home screens, and island-map views.
- Best practice for image-to-UI implementation with Codex is: reference images for each state + exact Japanese copy provided separately + shared design tokens + screenshot-comparison verification.

## Timeline relative to Phase 0 (v2.7)

Phase 0 (goals 002-011) is complete and promoted to production (2026-06-12). The owner is
showing it directly to personal contacts. That friend feedback round is an **optional
post-launch feedback tool** under this decision, not a gate. This decision governs the next
build cycle: the near-complete MVP (spec v2.8).

## Decision

1. **Skip mock/interview testing as a required gate.** Any interview script is kept only as an optional tool for post-launch feedback.
2. **Build a near-complete free MVP and launch it with an LP as its front door.** Validation happens through real usage and retention on the core cooking loop, not through pre-launch signups.
3. **Island map is in scope.** The map exists to provide a sense of achievement (達成感) and exploration (探索感): dishes the user can make / has made appear as territory on an island map, and nearby dishes appear as unexplored neighbors. Owner decision, 2026-06-12.
4. **Design-first pipeline:** generate finished-look design images per screen, then implement with Codex using:
   - reference design images attached via `codex exec -i`
   - exact Japanese copy taken from existing mocks/spec documents
   - shared design tokens defined once
   - screenshot comparison against the reference as verification
5. **Distribution at launch:** share directly with personal contacts, small cooking/self-cooking communities, X/note posts, and optionally a small ad budget.
6. **Validation metrics:** focus on whether users actually complete and repeat the core loop:
   - register or select familiar dishes
   - view nearby suggestions
   - open recipe cards
   - save "want to make"
   - mark dishes as "made"
   - return within a few days (measured PII-free via localStorage first-visit marker + `return_visit` event)

## Consequences

- `mocks/` becomes the copy/text source of truth; `mocks/concept/` becomes the visual design source of truth. **Prerequisite: neither directory exists in this repo yet — creating them (with the design images) is the first step of the next cycle.**
- Spec v2.8 defines the near-complete MVP (core loop + island map + return measurement), superseding v2.7's Phase 0 scope.
- Next goals will be MVP implementation goals in Next.js, each referencing design images.
- Risk accepted: we invest build time before strong external validation.
- Risk mitigation: keep the MVP scope narrow and focus only on the core loop:
  - familiar dish selection
  - today's recommendation
  - recipe-difference card
  - save / made status
  - island map (achievement + exploration)
