'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { BASE_DISH_INGREDIENTS, dishes, relations } from '@/data/v3'
import type { CustomDish } from '@/types/dish'

const STORAGE_KEY = 'tonari.v3.shoppingList'
const STORAGE_EVENT = 'tonari.v3.shoppingList.changed'
const EMPTY_DISHES: readonly ShoppingDish[] = []

export const PANTRY_STAPLES = ['塩', 'こしょう', '醤油', '砂糖', 'みりん', '酒', 'サラダ油', 'ごま油', '水'] as const

export type Ingredient = string | { name: string; quantity?: string }

export type ShoppingDish = {
  id: string
  name: string
  ingredients: readonly Ingredient[]
}

export type ShoppingListItem = {
  id: string
  name: string
  quantity?: string
  sourceDishIds: string[]
  sourceDishNames: string[]
  checked: boolean
  manual: boolean
}

type StoredShoppingState = {
  added: Array<{ name: string; quantity?: string }>
  hiddenIds: string[]
  checkedIds: string[]
}

const EMPTY_STATE: StoredShoppingState = { added: [], hiddenIds: [], checkedIds: [] }
const EMPTY_SNAPSHOT = JSON.stringify(EMPTY_STATE)

export function shoppingDishesFromWeekSet(dishIds: readonly string[], customDishes: readonly CustomDish[] = []): ShoppingDish[] {
  return dishIds.flatMap((dishId) => {
    const customDish = customDishes.find((dish) => dish.id === dishId)
    if (customDish) return [{ id: customDish.id, name: customDish.name, ingredients: customDish.ingredients }]

    const dish = dishes.find((candidate) => candidate.id === dishId)
    if (!dish) return []
    const relationIngredients = relations
      .filter((relation) => relation.target === dishId)
      .flatMap((relation) => relation.new_ingredients)
    const ingredients = relationIngredients.length ? relationIngredients : BASE_DISH_INGREDIENTS[dish.id] ?? []
    return [{ id: dish.id, name: dish.name, ingredients }]
  })
}

export function deriveShoppingList(
  weekDishes: readonly ShoppingDish[],
  options: {
    pantryIngredients?: readonly string[]
    hiddenIds?: readonly string[]
    checkedIds?: readonly string[]
  } = {},
): ShoppingListItem[] {
  const pantryIds = new Set((options.pantryIngredients ?? PANTRY_STAPLES).map(ingredientId))
  const hiddenIds = new Set(options.hiddenIds ?? [])
  const checkedIds = new Set(options.checkedIds ?? [])
  const entries = new Map<string, Omit<ShoppingListItem, 'checked' | 'manual'>>()

  for (const dish of weekDishes) {
    for (const ingredient of dish.ingredients) {
      const parsed = parseIngredient(ingredient)
      if (!parsed || pantryIds.has(parsed.id) || hiddenIds.has(parsed.id)) continue
      const entry = entries.get(parsed.id)
      if (entry) {
        if (!entry.sourceDishIds.includes(dish.id)) entry.sourceDishIds.push(dish.id)
        if (!entry.sourceDishNames.includes(dish.name)) entry.sourceDishNames.push(dish.name)
        if (!entry.quantity && parsed.quantity) entry.quantity = parsed.quantity
      } else {
        entries.set(parsed.id, {
          id: parsed.id,
          name: parsed.name,
          ...(parsed.quantity ? { quantity: parsed.quantity } : {}),
          sourceDishIds: [dish.id],
          sourceDishNames: [dish.name],
        })
      }
    }
  }

  return [...entries.values()].map((item) => ({ ...item, checked: checkedIds.has(item.id), manual: false }))
}

export function useShoppingList(
  weekDishes: readonly ShoppingDish[] = EMPTY_DISHES,
  pantryIngredients: readonly string[] = PANTRY_STAPLES,
) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state = useMemo(() => parseState(snapshot), [snapshot])
  const items = useMemo(() => {
    const derived = deriveShoppingList(weekDishes, {
      pantryIngredients,
      hiddenIds: state.hiddenIds,
      checkedIds: state.checkedIds,
    })
    const presentIds = new Set(derived.map((item) => item.id))
    const manual = state.added
      .map(parseIngredient)
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .filter((item) => !presentIds.has(item.id) && !state.hiddenIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        ...(item.quantity ? { quantity: item.quantity } : {}),
        sourceDishIds: [],
        sourceDishNames: [],
        checked: state.checkedIds.includes(item.id),
        manual: true,
      }))
    return [...derived, ...manual]
  }, [pantryIngredients, state, weekDishes])

  const toggleChecked = useCallback((itemId: string) => {
    const current = currentState()
    const checkedIds = current.checkedIds.includes(itemId)
      ? current.checkedIds.filter((id) => id !== itemId)
      : [...current.checkedIds, itemId]
    writeState({ ...current, checkedIds })
  }, [])

  const addItem = useCallback((name: string, quantity?: string) => {
    const item = parseIngredient({ name, quantity })
    if (!item) return false
    const current = currentState()
    const added = current.added.some((entry) => ingredientId(entry.name) === item.id)
      ? current.added
      : [...current.added, { name: item.name, ...(item.quantity ? { quantity: item.quantity } : {}) }]
    writeState({
      ...current,
      added,
      hiddenIds: current.hiddenIds.filter((id) => id !== item.id),
    })
    return true
  }, [])

  const removeItem = useCallback((itemId: string) => {
    const current = currentState()
    writeState({
      ...current,
      added: current.added.filter((item) => ingredientId(item.name) !== itemId),
      hiddenIds: current.hiddenIds.includes(itemId) ? current.hiddenIds : [...current.hiddenIds, itemId],
      checkedIds: current.checkedIds.filter((id) => id !== itemId),
    })
  }, [])

  const restoreItem = useCallback((itemId: string) => {
    const current = currentState()
    if (!current.hiddenIds.includes(itemId)) return
    writeState({ ...current, hiddenIds: current.hiddenIds.filter((id) => id !== itemId) })
  }, [])

  const clearChecks = useCallback(() => writeState({ ...currentState(), checkedIds: [] }), [])

  return {
    items,
    checkedCount: items.filter((item) => item.checked).length,
    remainingCount: items.filter((item) => !item.checked).length,
    toggleChecked,
    addItem,
    removeItem,
    restoreItem,
    clearChecks,
  }
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(STORAGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(STORAGE_EVENT, onStoreChange)
  }
}

function getSnapshot() {
  if (typeof window === 'undefined') return getServerSnapshot()
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT
}

function writeState(state: StoredShoppingState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

// Mutators must read the freshest stored state at call time: the React state
// snapshot goes stale between rapid taps, and spreading it would drop checks.
function currentState(): StoredShoppingState {
  return parseState(getSnapshot())
}

function parseState(raw: string): StoredShoppingState {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredShoppingState>
    if (Array.isArray(parsed.added) && Array.isArray(parsed.hiddenIds) && Array.isArray(parsed.checkedIds)) {
      return {
        added: parsed.added.filter(isStoredIngredient),
        hiddenIds: parsed.hiddenIds.filter((id): id is string => typeof id === 'string'),
        checkedIds: parsed.checkedIds.filter((id): id is string => typeof id === 'string'),
      }
    }
  } catch {}
  return EMPTY_STATE
}

function isStoredIngredient(value: unknown): value is { name: string; quantity?: string } {
  return typeof value === 'object' && value !== null && typeof (value as { name?: unknown }).name === 'string'
}

function parseIngredient(ingredient: Ingredient | { name: string; quantity?: string }) {
  const name = typeof ingredient === 'string' ? ingredient.trim() : ingredient.name.trim()
  if (!name) return null
  const quantity = typeof ingredient === 'string' ? undefined : ingredient.quantity?.trim() || undefined
  return { id: ingredientId(name), name, ...(quantity ? { quantity } : {}) }
}

function ingredientId(name: string) {
  return name.trim().replaceAll(/\s+/g, ' ').toLocaleLowerCase('ja-JP')
}
