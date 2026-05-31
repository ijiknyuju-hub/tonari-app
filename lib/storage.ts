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

export function exportState(state: AppState): void {
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `tonari-gohan-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function importStateFromFile(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as AppState

        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          reject(new Error('データの形式が正しくありません。'))
          return
        }

        resolve(parsed)
      } catch {
        reject(new Error('ファイルの形式が正しくありません。'))
      }
    }

    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'))
    reader.readAsText(file)
  })
}
