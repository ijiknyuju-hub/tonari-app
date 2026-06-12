import { recommendDishes, type RecommendedDish } from '@/lib/phase0/recommendDishes'

export type HomeMode = 'easy' | 'stretch' | 'full'

const MODE_DIFFICULTY: Record<HomeMode, 1 | 2 | 3> = {
  easy: 1,
  stretch: 2,
  full: 3,
}

export function todaysPick(
  selectedBaseDishIds: string[],
  mode: HomeMode,
  dateISO: string,
): RecommendedDish | null {
  const recommendations = recommendDishes(selectedBaseDishIds)
  if (recommendations.length === 0) {
    return null
  }

  const difficulty = MODE_DIFFICULTY[mode]
  const modeMatches = recommendations.filter((recommendation) => recommendation.card.difficulty === difficulty)
  const candidates = modeMatches.length > 0 ? modeMatches : recommendations
  const index = stableHash(`${dateISO}:${mode}:${selectedBaseDishIds.join(',')}`) % candidates.length

  return candidates[index] ?? null
}

function stableHash(value: string): number {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}
