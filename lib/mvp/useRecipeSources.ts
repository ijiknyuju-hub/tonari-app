'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'tonari.v3.recipeSources'
const MAIN_VIDEO_STORAGE_KEY = 'tonari.v3.recipeSources.mainVideo'
const STORAGE_EVENT = 'tonari.v3.recipeSources.changed'

export type RecipeSourceKind = 'youtube' | 'site'

export type RecipeSource = {
  id: string
  url: string
  kind: RecipeSourceKind
  addedAt: string
}

export type RecipeSourceMap = Record<string, RecipeSource[]>

const EMPTY_SNAPSHOT = '{}'

export function useRecipeSources() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const mainVideoSnapshot = useSyncExternalStore(subscribe, getMainVideoSnapshot, getServerSnapshot)
  const sourcesByDish = useMemo(() => parseSources(snapshot), [snapshot])
  const mainVideoIdsByDish = useMemo(() => parseMainVideos(mainVideoSnapshot), [mainVideoSnapshot])

  const addSource = useCallback(
    (dishId: string, rawUrl: string) => {
      const url = normalizeUrl(rawUrl)
      if (!url) return false

      const source: RecipeSource = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        kind: recipeSourceKind(url),
        addedAt: new Date().toISOString(),
      }
      // Read the freshest stored map at call time — the React snapshot goes
      // stale between rapid calls, and spreading it would drop earlier writes.
      const allSources = parseSources(getSnapshot())
      const current = allSources[dishId] ?? []
      if (current.some((item) => item.url === source.url)) return true
      writeSources({ ...allSources, [dishId]: [source, ...current] })
      return true
    },
    [],
  )

  const removeSource = useCallback(
    (dishId: string, sourceId: string) => {
      const allSources = parseSources(getSnapshot())
      const next = (allSources[dishId] ?? []).filter((source) => source.id !== sourceId)
      writeSources({ ...allSources, [dishId]: next })
      const mainVideoIds = parseMainVideos(getMainVideoSnapshot())
      if (mainVideoIds[dishId] === sourceId) {
        const nextMainVideoIds = { ...mainVideoIds }
        delete nextMainVideoIds[dishId]
        writeMainVideos(nextMainVideoIds)
      }
    },
    [],
  )

  const setMainVideo = useCallback(
    (dishId: string, sourceId: string) => {
      writeMainVideos({ ...parseMainVideos(getMainVideoSnapshot()), [dishId]: sourceId })
    },
    [],
  )

  return { sourcesByDish, mainVideoIdsByDish, addSource, removeSource, setMainVideo }
}

export function recipeSourceKind(url: string): RecipeSourceKind {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be' ? 'youtube' : 'site'
  } catch {
    return 'site'
  }
}

export function sourceHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(STORAGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(STORAGE_EVENT, onStoreChange)
  }
}

function getSnapshot() {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT
}

function getMainVideoSnapshot() {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT
  return window.localStorage.getItem(MAIN_VIDEO_STORAGE_KEY) ?? EMPTY_SNAPSHOT
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT
}

function writeSources(value: RecipeSourceMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function writeMainVideos(value: Record<string, string>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MAIN_VIDEO_STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function parseSources(raw: string): RecipeSourceMap {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const result: RecipeSourceMap = {}
    for (const [dishId, sources] of Object.entries(parsed)) {
      if (!Array.isArray(sources)) continue
      result[dishId] = sources.flatMap((source) => {
        if (!source || typeof source !== 'object') return []
        const candidate = source as Partial<RecipeSource>
        if (typeof candidate.id !== 'string' || typeof candidate.url !== 'string') return []
        return [{
          id: candidate.id,
          url: candidate.url,
          kind: candidate.kind === 'youtube' ? 'youtube' : recipeSourceKind(candidate.url),
          addedAt: typeof candidate.addedAt === 'string' ? candidate.addedAt : '',
        }]
      })
    }
    return result
  } catch {
    return {}
  }
}

function parseMainVideos(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
  } catch {
    return {}
  }
}
