'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { CustomDish, DishOverride } from '@/types/dish'

const OVERRIDES_KEY = 'dish_overrides'
const CUSTOM_KEY = 'custom_dishes'
const EVENT = 'tonari.dishLibrary.changed'
const SEP = '\n---custom---\n'

export function useDishLibrary() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const { overrides, customDishes } = useMemo(() => {
    const [overrideRaw, customRaw] = snapshot.split(SEP)
    return {
      overrides: parseOverrides(overrideRaw),
      customDishes: parseCustomDishes(customRaw),
    }
  }, [snapshot])

  const saveDishOverride = useCallback(
    (dishId: string, override: Omit<DishOverride, 'dish_id' | 'updated_at'>) => {
      writeOverrides({
        ...overrides,
        [dishId]: {
          dish_id: dishId,
          ...override,
          updated_at: new Date().toISOString(),
        },
      })
    },
    [overrides],
  )

  const resetDishOverride = useCallback(
    (dishId: string) => {
      const next = { ...overrides }
      delete next[dishId]
      writeOverrides(next)
    },
    [overrides],
  )

  const addCustomDish = useCallback(
    (dish: Omit<CustomDish, 'id' | 'created_at'>) => {
      const customDish: CustomDish = {
        ...dish,
        id: `custom-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      writeCustomDishes([customDish, ...customDishes])
      return customDish
    },
    [customDishes],
  )

  return { overrides, customDishes, saveDishOverride, resetDishOverride, addCustomDish }
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(EVENT, onStoreChange)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return getServerSnapshot()
  return `${window.localStorage.getItem(OVERRIDES_KEY) ?? '{}'}${SEP}${
    window.localStorage.getItem(CUSTOM_KEY) ?? '[]'
  }`
}

function getServerSnapshot(): string {
  return `{}${SEP}[]`
}

function writeOverrides(overrides: Record<string, DishOverride>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  window.dispatchEvent(new Event(EVENT))
}

function writeCustomDishes(customDishes: CustomDish[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(customDishes))
  window.dispatchEvent(new Event(EVENT))
}

function parseOverrides(raw?: string): Record<string, DishOverride> {
  try {
    const parsed = JSON.parse(raw ?? '{}')
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, DishOverride>
    }
  } catch {}
  return {}
}

function parseCustomDishes(raw?: string): CustomDish[] {
  try {
    const parsed = JSON.parse(raw ?? '[]')
    if (Array.isArray(parsed)) return parsed as CustomDish[]
  } catch {}
  return []
}
