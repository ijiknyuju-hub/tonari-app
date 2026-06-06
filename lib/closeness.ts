import type { Dish, DishAxes } from './types'

export function axisDistance(a: DishAxes, b: DishAxes): number {
  const diff = (x: string, y: string) => (x.trim().toLowerCase() === y.trim().toLowerCase() ? 0 : 1)
  return diff(a.seasoning, b.seasoning) + diff(a.ingredient, b.ingredient) + diff(a.method, b.method)
}

export type RecommendFilter = 'easy' | 'expand' | 'challenge'

export function filterMatches(
  base: Dish,
  candidate: Dish,
  filter: RecommendFilter,
): boolean {
  const dist = axisDistance(base.axes, candidate.axes)
  const effortDiff = candidate.effort - base.effort
  if (filter === 'easy') return dist === 0
  if (filter === 'expand') return dist >= 1 && dist <= 2
  if (filter === 'challenge') return dist >= 2 || effortDiff >= 1
  return true
}
