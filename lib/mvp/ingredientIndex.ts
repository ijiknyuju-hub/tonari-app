import { baseDishes } from '@/data/baseDishes'
import { dishCards } from '@/data/dishCards'
import type { DishCard } from '@/types/dish'

export type AlmostMakeableDish = {
  card: DishCard
  missing: string[]
}

const NORMALIZE_LOCALE = 'ja-JP'

export function allIngredients(): string[] {
  const frequency = new Map<string, { name: string; count: number; firstIndex: number }>()
  const baseIngredients = baseDishes.flatMap((dish) => getIngredientsFromUnknownDish(dish))
  const ingredients = dishCards.flatMap((card) => [
    ...card.mainIngredients,
    ...card.extraIngredients,
  ])

  ;[...ingredients, ...baseIngredients].forEach((ingredient, index) => {
    const name = ingredient.trim()
    if (!name) {
      return
    }

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

export function dishesByIngredients(selected: string[]): DishCard[] {
  const selectedSet = selectedIngredientSet(selected)
  if (selectedSet.size === 0) {
    return [...dishCards]
  }

  return dishCards.filter((card) =>
    [...selectedSet].every((ingredient) =>
      card.mainIngredients.some((cardIngredient) => normalizeIngredient(cardIngredient) === ingredient),
    ),
  )
}

export function almostMakeable(selected: string[]): AlmostMakeableDish[] {
  const selectedSet = selectedIngredientSet(selected)
  if (selectedSet.size === 0) {
    return []
  }

  const exactIds = new Set(dishesByIngredients(selected).map((card) => card.id))

  return dishCards
    .map((card) => {
      const missing = uniqueIngredients(card.mainIngredients).filter(
        (ingredient) => !selectedSet.has(normalizeIngredient(ingredient)),
      )

      return { card, missing }
    })
    .filter((item) => !exactIds.has(item.card.id) && item.missing.length >= 1 && item.missing.length <= 2)
    .sort((a, b) => a.missing.length - b.missing.length || a.card.difficulty - b.card.difficulty)
}

function selectedIngredientSet(selected: string[]): Set<string> {
  return new Set(selected.map(normalizeIngredient).filter(Boolean))
}

function uniqueIngredients(ingredients: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  ingredients.forEach((ingredient) => {
    const key = normalizeIngredient(ingredient)
    if (!key || seen.has(key)) {
      return
    }

    seen.add(key)
    result.push(ingredient)
  })

  return result
}

function normalizeIngredient(value: string): string {
  return value.trim().toLocaleLowerCase(NORMALIZE_LOCALE)
}

function getIngredientsFromUnknownDish(dish: unknown): string[] {
  if (!dish || typeof dish !== 'object') {
    return []
  }

  const value = dish as { mainIngredients?: unknown; extraIngredients?: unknown }
  return [...toStringArray(value.mainIngredients), ...toStringArray(value.extraIngredients)]
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}
