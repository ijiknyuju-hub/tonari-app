'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'tonari.v3.weekSet'
const STORAGE_EVENT = 'tonari.v3.weekSet.changed'

export const WEEK_SET_SIZE = 5

export type WeekSetState = {
  dishIds: string[]
  updatedAt: string
}

const EMPTY_WEEK_SET: WeekSetState = { dishIds: [], updatedAt: '' }
const EMPTY_SNAPSHOT = JSON.stringify(EMPTY_WEEK_SET)

export function useWeekSet() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state = useMemo(() => parseWeekSet(snapshot), [snapshot])

  const setWeekSet = useCallback((dishIds: readonly string[]) => {
    writeWeekSet({ dishIds: normalizeDishIds(dishIds), updatedAt: new Date().toISOString() })
  }, [])

  const addDish = useCallback(
    (dishId: string) => {
      if (!dishId.trim() || state.dishIds.includes(dishId) || state.dishIds.length >= WEEK_SET_SIZE) return false
      writeWeekSet({ dishIds: [...state.dishIds, dishId], updatedAt: new Date().toISOString() })
      return true
    },
    [state],
  )

  const removeDish = useCallback(
    (dishId: string) => {
      if (!state.dishIds.includes(dishId)) return
      writeWeekSet({ dishIds: state.dishIds.filter((id) => id !== dishId), updatedAt: new Date().toISOString() })
    },
    [state],
  )

  const replaceDish = useCallback(
    (dishId: string, replacementDishId: string) => {
      if (!replacementDishId.trim() || !state.dishIds.includes(dishId) || state.dishIds.includes(replacementDishId)) return
      writeWeekSet({
        dishIds: state.dishIds.map((id) => (id === dishId ? replacementDishId : id)),
        updatedAt: new Date().toISOString(),
      })
    },
    [state],
  )

  const replaceDishAt = useCallback(
    (index: number, replacementDishId: string) => {
      const dishId = state.dishIds[index]
      if (!dishId) return
      replaceDish(dishId, replacementDishId)
    },
    [replaceDish, state.dishIds],
  )

  const clearWeekSet = useCallback(() => writeWeekSet(EMPTY_WEEK_SET), [])

  return {
    state,
    dishIds: state.dishIds,
    hasWeekSet: state.dishIds.length > 0,
    isFull: state.dishIds.length === WEEK_SET_SIZE,
    setWeekSet,
    addDish,
    removeDish,
    replaceDish,
    replaceDishAt,
    clearWeekSet,
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

function writeWeekSet(state: WeekSetState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function parseWeekSet(raw: string): WeekSetState {
  try {
    const parsed = JSON.parse(raw) as Partial<WeekSetState>
    if (Array.isArray(parsed.dishIds)) {
      return {
        dishIds: normalizeDishIds(parsed.dishIds.filter((id): id is string => typeof id === 'string')),
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      }
    }
  } catch {}
  return EMPTY_WEEK_SET
}

function normalizeDishIds(dishIds: readonly string[]) {
  return [...new Set(dishIds.map((id) => id.trim()).filter(Boolean))].slice(0, WEEK_SET_SIZE)
}
