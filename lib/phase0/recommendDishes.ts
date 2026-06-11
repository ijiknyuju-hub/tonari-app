import { baseDishes } from '@/data/baseDishes'
import { dishCards } from '@/data/dishCards'
import type { BaseDish, ClosenessLabel, DishCard } from '@/types/dish'

export type RecommendedDish = {
  card: DishCard
  label: ClosenessLabel
  closestBaseDishId: string
  closestBaseDishTitle: string
  score: number
  matchCount: number
}

type AxisProfile = {
  tasteAxis: Set<string>
  mainIngredients: Set<string>
  cookingMethod: Set<string>
}

const NORMALIZE_LOCALE = 'ja-JP'

// Scoring weights:
// - direct selected-base match is dominant because cards are hand-curated from base dishes.
// - taste, ingredient, and method overlaps refine the order inside matching cards.
// - difficulty/time keeps "near and easy" cards ahead of heavier jumps.
const WEIGHTS = {
  directBaseMatch: 100,
  additionalBaseMatch: 35,
  tasteAxisOverlap: 4,
  mainIngredientOverlap: 3,
  cookingMethodOverlap: 3,
  difficultyEase: 6,
  timeEase: 4,
} as const

/**
 * Goal 006 can call:
 * `recommendDishes(['mapo-tofu', 'karaage'])`
 * and render `result.card`, `result.label`, and `result.closestBaseDishTitle`.
 */
export function recommendDishes(selectedBaseDishIds: string[]): RecommendedDish[] {
  const selectedIds = uniqueIds(selectedBaseDishIds)
  if (selectedIds.length === 0) {
    return []
  }

  const selectedSet = new Set(selectedIds)
  const matchedCards = dishCards.filter((card) => card.baseDishIds.some((id) => selectedSet.has(id)))
  if (matchedCards.length === 0) {
    return []
  }

  const axisProfile = buildAxisProfile(matchedCards)

  return matchedCards
    .map((card, index) => {
      const matchingBaseIds = card.baseDishIds.filter((id) => selectedSet.has(id))
      const closestBaseDishId = chooseClosestBaseDishId(card, matchingBaseIds)
      const closestBaseDishTitle = getBaseDishTitle(closestBaseDishId)
      const score = scoreCard(card, matchingBaseIds.length, axisProfile)

      return {
        card,
        label: labelForScore(score, matchingBaseIds.length),
        closestBaseDishId,
        closestBaseDishTitle,
        score,
        matchCount: matchingBaseIds.length,
        index,
      }
    })
    .sort((a, b) => b.score - a.score || a.card.difficulty - b.card.difficulty || a.index - b.index)
    .map((result) => ({
      card: result.card,
      label: result.label,
      closestBaseDishId: result.closestBaseDishId,
      closestBaseDishTitle: result.closestBaseDishTitle,
      score: result.score,
      matchCount: result.matchCount,
    }))
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
}

function buildAxisProfile(cards: DishCard[]): AxisProfile {
  return {
    tasteAxis: new Set(cards.flatMap((card) => normalizeList(card.tasteAxis))),
    mainIngredients: new Set(cards.flatMap((card) => normalizeList(card.mainIngredients))),
    cookingMethod: new Set(cards.flatMap((card) => normalizeList(card.cookingMethod))),
  }
}

function scoreCard(card: DishCard, matchCount: number, profile: AxisProfile): number {
  const baseScore =
    WEIGHTS.directBaseMatch + Math.max(0, matchCount - 1) * WEIGHTS.additionalBaseMatch
  const tasteScore = overlapCount(card.tasteAxis, profile.tasteAxis) * WEIGHTS.tasteAxisOverlap
  const ingredientScore =
    overlapCount(card.mainIngredients, profile.mainIngredients) * WEIGHTS.mainIngredientOverlap
  const methodScore =
    overlapCount(card.cookingMethod, profile.cookingMethod) * WEIGHTS.cookingMethodOverlap
  const difficultyScore = (4 - card.difficulty) * WEIGHTS.difficultyEase
  const timeScore = timeEaseScore(card.timeMinutes)

  return baseScore + tasteScore + ingredientScore + methodScore + difficultyScore + timeScore
}

function timeEaseScore(timeMinutes: number): number {
  if (timeMinutes <= 15) return WEIGHTS.timeEase * 3
  if (timeMinutes <= 25) return WEIGHTS.timeEase * 2
  return WEIGHTS.timeEase
}

function overlapCount(values: string[], profileValues: Set<string>): number {
  return normalizeList(values).filter((value) => profileValues.has(value)).length
}

function normalizeList(values: string[]): string[] {
  return values.map(normalizeValue).filter(Boolean)
}

function normalizeValue(value: string): string {
  return value.trim().toLocaleLowerCase(NORMALIZE_LOCALE)
}

function chooseClosestBaseDishId(card: DishCard, matchingBaseIds: string[]): string {
  return matchingBaseIds.find((id) => card.baseDishIds.includes(id)) ?? matchingBaseIds[0] ?? ''
}

function getBaseDishTitle(id: string): string {
  return baseDishes.find((dish: BaseDish) => dish.id === id)?.title ?? id
}

// Threshold rationale:
// The axis-overlap sub-scores are computed against a profile built from the matched cards
// themselves, so every matched card overlaps near-maximally. The effective score range for a
// single-base selection is ~137–154 (see data/dishCards.ts — 26 cards across 16 bases).
// Thresholds are calibrated against this observed range so all three labels occur in practice:
//   - score ≥ 148  (or matchCount ≥ 2): low-difficulty / fast card → かなり近い
//   - score ≥ 140:                       medium difficulty or time  → 少し変えれば作れる
//   - score < 140:                        harder / longer card      → ちょっと挑戦
function labelForScore(score: number, matchCount: number): ClosenessLabel {
  if (matchCount >= 2 || score >= 148) {
    return 'かなり近い'
  }

  if (score >= 140) {
    return '少し変えれば作れる'
  }

  return 'ちょっと挑戦'
}
