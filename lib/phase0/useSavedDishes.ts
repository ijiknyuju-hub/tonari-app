'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { SavedDish } from '@/types/dish'

const STORAGE_KEY = 'tonari.phase0.savedDishes'
const STORAGE_EVENT = 'tonari.phase0.savedDishes.changed'
const EMPTY_SNAPSHOT = '[]'

export function useSavedDishes() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const savedDishes = useMemo(() => parseSavedDishes(snapshot), [snapshot])

  const savedIdSet = useMemo(
    () => new Set(savedDishes.map((dish) => dish.dishId)),
    [savedDishes],
  )
  const madeIdSet = useMemo(
    () => new Set(savedDishes.filter((dish) => dish.madeAt).map((dish) => dish.dishId)),
    [savedDishes],
  )
  const madeDishes = useMemo(
    () =>
      savedDishes
        .filter((dish): dish is SavedDish & { madeAt: string } => typeof dish.madeAt === 'string')
        .sort((a, b) => new Date(b.madeAt).getTime() - new Date(a.madeAt).getTime()),
    [savedDishes],
  )

  const isSaved = useCallback((dishId: string) => savedIdSet.has(dishId), [savedIdSet])
  const isMade = useCallback((dishId: string) => madeIdSet.has(dishId), [madeIdSet])

  const save = useCallback(
    (dishId: string) => {
      if (savedDishes.some((dish) => dish.dishId === dishId)) {
        return
      }

      writeSavedDishes([{ dishId, savedAt: new Date().toISOString() }, ...savedDishes])
    },
    [savedDishes],
  )

  const unsave = useCallback(
    (dishId: string) => {
      writeSavedDishes(savedDishes.filter((dish) => dish.dishId !== dishId))
    },
    [savedDishes],
  )

  const markMade = useCallback(
    (dishId: string) => {
      const now = new Date().toISOString()
      const existing = savedDishes.find((dish) => dish.dishId === dishId)
      if (!existing) {
        writeSavedDishes([{ dishId, savedAt: now, madeAt: now }, ...savedDishes])
        return
      }

      writeSavedDishes(
        savedDishes.map((dish) => (dish.dishId === dishId ? { ...dish, madeAt: now } : dish)),
      )
    },
    [savedDishes],
  )

  const unmarkMade = useCallback(
    (dishId: string) => {
      writeSavedDishes(
        savedDishes.map((dish) => {
          if (dish.dishId !== dishId) {
            return dish
          }

          const next = { ...dish }
          delete next.madeAt
          return next
        }),
      )
    },
    [savedDishes],
  )

  return {
    savedDishes,
    madeDishes,
    isSaved,
    isMade,
    save,
    unsave,
    markMade,
    unmarkMade,
  }
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('storage', onStoreChange)
  window.addEventListener(STORAGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(STORAGE_EVENT, onStoreChange)
  }
}

function getSnapshot(): string {
  if (typeof window === 'undefined') {
    return EMPTY_SNAPSHOT
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return EMPTY_SNAPSHOT
  }

  if (!isValidSavedDishesJson(raw)) {
    window.localStorage.removeItem(STORAGE_KEY)
    return EMPTY_SNAPSHOT
  }

  return raw
}

function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT
}

function writeSavedDishes(savedDishes: SavedDish[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDishes))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function parseSavedDishes(raw: string): SavedDish[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isSavedDish)
  } catch {
    return []
  }
}

function isValidSavedDishesJson(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
  } catch {
    return false
  }
}

function isSavedDish(value: unknown): value is SavedDish {
  if (!value || typeof value !== 'object') {
    return false
  }

  const dish = value as Partial<SavedDish>
  return (
    typeof dish.dishId === 'string' &&
    typeof dish.savedAt === 'string' &&
    (dish.madeAt === undefined || typeof dish.madeAt === 'string')
  )
}
