import type { AppState } from './types'

export const KEY = 'tonari-app-v4'

const emptyState = (): AppState => ({
  dishes: [],
  lastUpdated: new Date().toISOString(),
})

function isAppState(value: unknown): value is AppState {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as AppState).dishes) &&
    typeof (value as AppState).lastUpdated === 'string'
  )
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return emptyState()
  }

  try {
    const rawState = window.localStorage.getItem(KEY)

    if (!rawState) {
      return emptyState()
    }

    const parsed: unknown = JSON.parse(rawState)
    return isAppState(parsed) ? parsed : emptyState()
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
  }
}

export function exportState(state: AppState): void {
  try {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `tonari-gohan-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  } catch {
  }
}

export function importStateFromFile(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const parsed: unknown = JSON.parse(String(event.target?.result ?? ''))

        if (!isAppState(parsed)) {
          reject(new Error('Invalid app state format.'))
          return
        }

        resolve(parsed)
      } catch {
        reject(new Error('Invalid JSON file format.'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
