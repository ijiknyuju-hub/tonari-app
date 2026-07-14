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

  // Mutators read the freshest stored state at call time: the React snapshot
  // goes stale between rapid taps, and spreading it would drop earlier writes.
  const addDish = useCallback((dishId: string) => {
    const current = currentWeekSet()
    if (!dishId.trim() || current.dishIds.includes(dishId) || current.dishIds.length >= WEEK_SET_SIZE) return false
    writeWeekSet({ dishIds: [...current.dishIds, dishId], updatedAt: new Date().toISOString() })
    return true
  }, [])

  const removeDish = useCallback((dishId: string) => {
    const current = currentWeekSet()
    if (!current.dishIds.includes(dishId)) return
    writeWeekSet({ dishIds: current.dishIds.filter((id) => id !== dishId), updatedAt: new Date().toISOString() })
  }, [])

  const replaceDish = useCallback((dishId: string, replacementDishId: string) => {
    const current = currentWeekSet()
    if (!replacementDishId.trim() || !current.dishIds.includes(dishId) || current.dishIds.includes(replacementDishId)) return
    writeWeekSet({
      dishIds: current.dishIds.map((id) => (id === dishId ? replacementDishId : id)),
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const replaceDishAt = useCallback(
    (index: number, replacementDishId: string) => {
      const dishId = currentWeekSet().dishIds[index]
      if (!dishId) return
      replaceDish(dishId, replacementDishId)
    },
    [replaceDish],
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

function currentWeekSet(): WeekSetState {
  return parseWeekSet(getSnapshot())
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
