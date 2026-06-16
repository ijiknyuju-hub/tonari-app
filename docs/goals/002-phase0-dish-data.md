# Objective

Create the static dummy dish data for the Phase 0 web-app MVP: base dishes (what users can already cook) and 20-30 recommendation dish cards (spec v2.7 §6, implementation unit 2).

This goal produces data and types only. No UI.

# Product Context

Spec: `docs/specs/tonari-gohan-spec-v2.7.md` (§5.3, §6).

Phase 0 validates whether dish cards that show "why this is close to what you already cook" make users tap 「作ってみたい」. All later goals (selector, recommendation logic, card UI) consume this data. There is no DB — everything is static TypeScript data.

# Scope

- `types/dish.ts` — new. Define `BaseDish` and `DishCard` types. `DishCard` must follow spec §6.2 exactly:

```ts
type DishCard = {
  id: string
  title: string
  baseDishIds: string[]
  image?: string
  shortCopy: string
  difficulty: 1 | 2 | 3
  timeMinutes: number
  tags: string[]
  reusableSkills: string[]
  changedPoints: string[]
  extraIngredients: string[]
  roughSteps: string[]
  tasteAxis: string[]
  cookingMethod: string[]
  mainIngredients: string[]
}
```

  Also define `SavedDish` (spec §8.3) and a closeness label type for 「かなり近い / 少し変えれば作れる / ちょっと挑戦」 (spec §6.5).

- `data/baseDishes.ts` — new. The 16 base dishes from spec §5.3: 麻婆豆腐, 唐揚げ, カレー, 親子丼, 豚キムチ, 鶏キムチ, 焼きそば, チャーハン, パスタ, グラタン, オムライス, 生姜焼き, 味噌汁, 肉じゃが, ハンバーグ, 野菜炒め. Each with a stable string id and display name.

- `data/dishCards.ts` — new. 20-30 dish cards in Japanese. Requirements:
  - Every base dish has at least one card that lists it in `baseDishIds`.
  - Each card states concretely why it is close (reusableSkills / changedPoints), what to buy (extraIngredients, keep short), rough steps (3-5 lines), difficulty, and timeMinutes.
  - Follow the spec §5.4 example (麻婆豆腐 → 麻婆春雨) as the quality bar. Include that exact example as one card.
  - Content language: Japanese. Identifiers and code: English.

# Out of Scope

- Any UI component or page change.
- Recommendation/scoring logic (goal 005).
- Modifying the existing prototype data in `lib/presets.ts` or anything under `components/` — the prototype is shelved; the Phase 0 MVP uses its own `data/` directory.
- Images (leave `image` unset).

# Files to Read First

- `AGENTS.md`
- `docs/specs/tonari-gohan-spec-v2.7.md` (§5.3, §5.4, §6)
- `tsconfig.json` (path aliases)
- `lib/types.ts` (prototype types — for naming-collision awareness only; do not modify or import)

# Implementation Plan

1. Inspect the current state (`git status`, branch).
2. Add `types/dish.ts`.
3. Add `data/baseDishes.ts` (16 dishes).
4. Add `data/dishCards.ts` (20-30 cards covering all base dishes).
5. Run verification.
6. Report changed files and results.

# Verification Requirements

```bash
npm run lint
npm run typecheck  # if this script exists
npm run build
```

If `npm run typecheck` is not defined, report `skipped: script missing`. In this Next.js app, `npm run build` may also run TypeScript checks as part of the production build.

Additionally report, as data checks: total card count, and that every base dish id referenced by `baseDishIds` exists in `baseDishes.ts` (a small assertion script or manual check is fine — do not add test infrastructure).

# Stop and Ask Conditions

Stop and ask if:

- the spec conflicts with existing code
- unrelated user changes would need to be overwritten
- the data design seems to require changing prototype files under `lib/` or `components/`
- implementation requires a larger architecture change

# Reporting Format

```md
## Summary

## Changed Files

## Verification

## Not Implemented

## Risks / Notes
```

Mention skipped checks explicitly.
