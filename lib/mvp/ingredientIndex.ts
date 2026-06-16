import { dishes, relations } from '@/data/v3'
import type { NearbyRelation } from '@/types/dish'

const NORMALIZE_LOCALE = 'ja-JP'

export function allIngredients(): string[] {
  const frequency = new Map<string, { name: string; count: number; firstIndex: number }>()

  const ingredients = relations.flatMap((r) => r.new_ingredients)

  ingredients.forEach((ingredient, index) => {
    const name = ingredient.trim()
    if (!name) return

    const key = normalizeIngredient(name)
    const existing = frequency.get(key)
    if (existing) {
      existing.count += 1
      return
    }
    frequency.set(key, { name, count: 1, firstIndex: index })
  })

  return [...frequency.values()]
    .sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex || a.name.localeCompare(b.name, 'ja-JP'))
    .map((item) => item.name)
}

export function relationsByIngredients(selected: string[]): NearbyRelation[] {
  const selectedSet = selectedIngredientSet(selected)
  if (selectedSet.size === 0) return [...relations]

  return relations.filter((r) =>
    [...selectedSet].every((ing) =>
      r.new_ingredients.some((ri) => normalizeIngredient(ri) === ing),
    ),
  )
}

export function getDishName(dishId: string): string {
  return dishes.find((d) => d.id === dishId)?.name ?? dishId
}

function selectedIngredientSet(selected: string[]): Set<string> {
  return new Set(selected.map(normalizeIngredient).filter(Boolean))
}

function normalizeIngredient(value: string): string {
  return value.trim().toLocaleLowerCase(NORMALIZE_LOCALE)
}
