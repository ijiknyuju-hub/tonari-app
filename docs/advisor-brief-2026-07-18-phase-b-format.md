# Advisor brief: Phase B output format for spec-032 catalog mass production

Spec: `docs/specs/spec-032-catalog-mass-production.md`
Related decisions: `docs/decisions/2026-07-17-advisor-seat-gpt56.md` (this seat's contract)

## Question

Phase B (the Codex-delegated mass generation stage of spec-032) produces two artifacts per
dish: Dish v4 features (seasonings, ingredients with role tags, methods, primary_method,
steps, effort, cost) and a Japanese intro text. Two format decisions are open:

1. **One record per dish or two?** Features and intro combined into a single record per dish,
   or split into two aligned artifacts joined by dish name.
2. **JSON intermediate or direct TS?** Emit `data/vN-dishes.json` and post-process, or have
   Codex write `data/v3.ts` (or its replacement) directly as TypeScript.

## Facts (verifiable)

- Catalog size: 282 dishes (`docs/catalog-281.json`, filename kept for historical reasons —
  the file itself now holds 282 rows after 2026-07-18 手羽元 split).
- Dish v4 schema is frozen and validated at 282 dishes by the proximity scorer
  (`scripts/proximity_281.py`, `docs/a1-verification-2026-07-17.md`). Fields per dish:
  `name, seasonings[], ingredients[{name,role}], methods[], primary_method, steps, box, tier`.
  Intro text is a new field, NOT yet in dish-v4-281.json; A-4 fixes it as a 2-line prose,
  with the first line being a "料理実体型" description (dish-substance) as the default across
  all 282 dishes, and 17 entry dishes (A-3, listed in the spec) using a "場面型" (scene)
  form for line 1 only.
- The current `data/v3.ts` (719 lines) is a PRIOR-generation dataset covering only 62 dishes
  in an incompatible schema: `Dish = {id, name, photo_url?, variations: Variation[]}` plus a
  `NearbyRelation[]` sitting in the same file, plus a `BASE_DISH_INGREDIENTS` map for 10 base
  dishes. There is no seasonings/methods/roles field, no full 282-dish coverage, and no per-
  dish intro of the A-4 shape.
- 16 consumer files import from `@/data/v3` today (all of `components/mvp/*` plus
  `app/dish/[id]/page.tsx` and 3 files under `lib/mvp/`). None import `dish-v4-281.json`.
- Consumer code migration is explicitly declared out of scope for spec-032 (spec §Scope:
  "消費コード側の配線 → 別goal（引継ぎNext 2）").
- The intro exemplars — 6 shown + 1 anti-example that A-4 says should be embedded verbatim
  into the Phase B prompt — are unrecovered. The decision file A-3/A-4 point to
  (`docs/decisions/2026-07-16-tonari-intro-text-style.md`) is missing from the repo and its
  git history. This is a separate open task; Phase B cannot run until the exemplars are
  reconstructed. That is orthogonal to the format question but shapes it: the Codex prompt
  is going to contain the 282-dish feature seed + at least 7 exemplar sentences per run.
- Codex CLI is the intended executor: `codex exec` with the current default model
  gpt-5.6-terra (per `~/.codex/config.toml`), operating under the delegation dispatch
  protocol at `.claude/templates/delegation-dispatch.md`.

## Working assumption (not yet decided)

Q1 = one record per dish (features + intro joined by name have no independent lifecycle).
Q2 = JSON intermediate (`data/v4-dishes.json`), NOT direct TS, because (a) TS syntax at 282-
record scale invites format drift Codex is uniquely bad at holding to; (b) JSON validates
against schema mechanically; (c) it decouples Phase B from the consumer-code migration
already in a separate goal.

## Questions

1. Is the "one record per dish" call correct, or is there a lifecycle we're missing that
   would justify splitting features vs intro? (Example concern: if the intro exemplars need
   iterative tuning against a fixed feature set, the split gives a cleaner regeneration
   loop.)
2. Is the "JSON intermediate over direct TS" call correct given the facts above? What is
   the smallest schema you would emit — flat `Dish[]` matching dish-v4-281.json plus two
   new fields (`intro_line1`, `intro_line2`), or a richer envelope (version, generated_at,
   source_catalog_hash)?
3. Should Phase B produce the file in one Codex run over all 282 dishes, or in N runs of
   ~50 dishes each, given the 17 entry dishes use a different intro form (「場面型」) that
   requires a stricter check per output? Model context and consistency both matter; which
   dominates for gpt-5.6-terra at this input size?
4. Is there a failure mode we're not accounting for that changes the format decision?
   Specifically, we're worried about Codex silently dropping dishes or producing near-
   duplicate intro sentences across families; would the format choice affect either?

Do not propose or make any code edits. Answer only the four questions. Answer in Japanese.
