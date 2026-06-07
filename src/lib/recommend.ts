import recipesData from '@/data/recipes.json'

export type Dish = {
  id: string
  name: string
  category: string
  difficulty: number
}

export type Edge = {
  from: string
  to: string
  closeness: number
  surprise: number
  difficulty_gap: number
  reason: string
}

export type Recommendation = {
  dish: Dish
  score: number
  reason: string
  fromDish: Dish
}

export type Variation = {
  base: string
  type: 'seasoning' | 'ingredient' | 'method'
  title: string
  display_text: string
  promote_to?: string
}

export type VariationResult = {
  variation: Variation
  baseDish: Dish
  promoteDish?: Dish
}

const dishes: Dish[] = recipesData.dishes as Dish[]
const edges: Edge[] = recipesData.edges as Edge[]
const variations: Variation[] = (
  (recipesData as unknown as { variations?: unknown[] }).variations ?? []
).filter(isVariation)
const dishMap = new Map(dishes.map((d) => [d.id, d]))

// B3: Pre-compute which dishes have outgoing edges (can be used as hub)
const hubDishIds = new Set(edges.map((e) => e.from))

export function getDishById(id: string): Dish | undefined {
  return dishMap.get(id)
}

export function getAllDishes(): Dish[] {
  return dishes
}

/**
 * B3 fix: Only return dishes that have outgoing edges.
 * Dishes with no edges produce zero recommendations when selected.
 */
export function getSelectableDishes(): Dish[] {
  return dishes.filter((d) => hubDishIds.has(d.id))
}

export function getSelectableDishesByCategory(): Record<string, Dish[]> {
  const result: Record<string, Dish[]> = {}
  for (const dish of getSelectableDishes()) {
    if (!result[dish.category]) result[dish.category] = []
    result[dish.category].push(dish)
  }
  return result
}

export function isVariation(value: unknown): value is Variation {
  if (!value || typeof value !== 'object') return false
  const variation = value as Partial<Variation>
  return (
    typeof variation.base === 'string' &&
    (variation.type === 'seasoning' ||
      variation.type === 'ingredient' ||
      variation.type === 'method') &&
    typeof variation.title === 'string' &&
    typeof variation.display_text === 'string' &&
    (variation.promote_to === undefined ||
      typeof variation.promote_to === 'string')
  )
}

export function getVariations(baseIds: string[]): VariationResult[] {
  const baseIdSet = new Set(baseIds)

  const results: VariationResult[] = []

  for (const variation of variations) {
    if (baseIdSet.has(variation.base)) {
      const baseDish = getDishById(variation.base)
      if (!baseDish) continue

      const promoteDish = variation.promote_to
        ? getDishById(variation.promote_to)
        : undefined

      results.push({
        variation,
        baseDish,
        promoteDish,
      })
    }
  }

  return results
}

export function getRecommendations(
  selectedIds: string[],
  cookedIds: string[] = []
): Recommendation[] {
  const excludeIds = new Set([...selectedIds, ...cookedIds])

  const candidateMap = new Map<string, Recommendation>()

  for (const fromId of selectedIds) {
    const fromDish = getDishById(fromId)
    if (!fromDish) continue

    const outEdges = edges.filter((e) => e.from === fromId)
    for (const edge of outEdges) {
      if (excludeIds.has(edge.to)) continue
      const toDish = getDishById(edge.to)
      if (!toDish) continue

      // U4: Rebalanced scoring — surprise now weighs more
      // Old: closeness * 2 + surprise - difficulty_gap * 1.5
      // New: closeness * 1.5 + surprise * 2 - difficulty_gap * 1.5
      const score = edge.closeness * 1.5 + edge.surprise * 2 - edge.difficulty_gap * 1.5

      const existing = candidateMap.get(edge.to)
      if (!existing || existing.score < score) {
        candidateMap.set(edge.to, {
          dish: toDish,
          score,
          reason: edge.reason,
          fromDish,
        })
      }
    }
  }

  return Array.from(candidateMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
