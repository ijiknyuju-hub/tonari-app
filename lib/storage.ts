import type { AppState } from './types'

export const KEY = 'tonari-app-state'

const emptyState = (): AppState => ({
  nodes: [],
  edges: [],
  lastUpdated: new Date().toISOString(),
})

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return emptyState()
  }

  const rawState = window.localStorage.getItem(KEY)

  if (!rawState) {
    return emptyState()
  }

  try {
    return JSON.parse(rawState) as AppState
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(KEY, JSON.stringify(state))
}
