'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'tonari.v3.selectedDishes'
const STORAGE_EVENT = 'tonari.v3.selectedDishes.changed'
const OLD_STORAGE_KEY = 'tonari.v28.selectedBaseDishes'
const EMPTY_SNAPSHOT = '[]'

export function useSelectedBaseDishes() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const selectedBaseDishIds = useMemo(() => parseSelectedIds(snapshot), [snapshot])

  const setSelectedBaseDishIds = useCallback((ids: string[]) => {
    writeSelectedBaseDishIds(ids)
  }, [])

  return {
    selectedBaseDishIds,
    setSelectedBaseDishIds,
  }
}

export function writeSelectedBaseDishIds(ids: string[]) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedIds))
  window.dispatchEvent(new Event(STORAGE_EVENT))
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
    const legacy = window.localStorage.getItem(OLD_STORAGE_KEY)
    if (legacy && isValidSelectedIdsJson(legacy)) {
      window.localStorage.setItem(STORAGE_KEY, legacy)
      window.localStorage.removeItem(OLD_STORAGE_KEY)
      return legacy
    }
    return EMPTY_SNAPSHOT
  }

  if (!isValidSelectedIdsJson(raw)) {
    window.localStorage.removeItem(STORAGE_KEY)
    return EMPTY_SNAPSHOT
  }

  return raw
}

function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT
}

function parseSelectedIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  } catch {
    return []
  }
}

function isValidSelectedIdsJson(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
  } catch {
    return false
  }
}
