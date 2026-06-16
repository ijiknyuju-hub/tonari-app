'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { MadeRecord, UserState } from '@/types/dish'

const STORAGE_KEY = 'tonari.v3.userState'
const STORAGE_EVENT = 'tonari.v3.userState.changed'

const EMPTY_STATE: UserState = {
  selected_dishes: [],
  bookmarked: [],
  made_records: [],
  promoted_variations: [],
}

const EMPTY_SNAPSHOT = JSON.stringify(EMPTY_STATE)

export function useUserState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state = useMemo(() => parseState(snapshot), [snapshot])

  const isBookmarked = useCallback(
    (dishId: string) => state.bookmarked.includes(dishId),
    [state.bookmarked],
  )

  const madeRecordsFor = useCallback(
    (dishId: string) =>
      state.made_records
        .filter((r) => r.dish_id === dishId)
        .sort((a, b) => b.made_at.localeCompare(a.made_at)),
    [state.made_records],
  )

  const bookmark = useCallback(
    (dishId: string) => {
      if (state.bookmarked.includes(dishId)) return
      writeState({ ...state, bookmarked: [dishId, ...state.bookmarked] })
    },
    [state],
  )

  const unbookmark = useCallback(
    (dishId: string) => {
      writeState({ ...state, bookmarked: state.bookmarked.filter((id) => id !== dishId) })
    },
    [state],
  )

  const recordMade = useCallback(
    (record: MadeRecord) => {
      writeState({ ...state, made_records: [record, ...state.made_records] })
    },
    [state],
  )

  return {
    state,
    isBookmarked,
    madeRecordsFor,
    bookmark,
    unbookmark,
    recordMade,
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

function getSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT
}

function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT
}

function writeState(state: UserState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function parseState(raw: string): UserState {
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.bookmarked)) {
      return parsed as UserState
    }
    return EMPTY_STATE
  } catch {
    return EMPTY_STATE
  }
}
