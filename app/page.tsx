'use client'

import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import AddDishPanel from '@/components/AddDishPanel'
import RecipeFlow from '@/components/RecipeFlow'
import { loadState, saveState } from '@/lib/storage'
import type { AppState, RecipeEdge, RecipeNode } from '@/lib/types'

type Suggestion = {
  name: string
  reason: string
}

type SuggestResponse = {
  variations: Suggestion[]
  adjacent: Suggestion[]
}

function isSuggestResponse(value: SuggestResponse | { error?: string }): value is SuggestResponse {
  return 'variations' in value && 'adjacent' in value
}

const initialState = (): AppState => ({
  nodes: [],
  edges: [],
  lastUpdated: new Date().toISOString(),
})

async function fetchSuggestions(dish: string, existingDishes: string[]): Promise<SuggestResponse> {
  const response = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dish, existingDishes }),
  })

  const data = (await response.json()) as SuggestResponse | { error?: string }

  if (!response.ok) {
    const message = 'error' in data ? data.error : undefined

    throw new Error(message ?? '提案の取得に失敗しました。')
  }

  if (!isSuggestResponse(data)) {
    throw new Error('提案の形式が正しくありません。')
  }

  return data
}

function buildSuggestionNodes(
  parentId: string,
  suggestions: Suggestion[],
  type: 'variation' | 'adjacent',
  existingNames: Set<string>,
): { nodes: RecipeNode[]; edges: RecipeEdge[] } {
  return suggestions.reduce<{ nodes: RecipeNode[]; edges: RecipeEdge[] }>(
    (result, suggestion) => {
      const name = suggestion.name.trim()

      if (!name || existingNames.has(name)) {
        return result
      }

      existingNames.add(name)

      const nodeId = uuidv4()

      result.nodes.push({
        id: nodeId,
        name,
        status: 'suggested',
        type,
        parentId,
        reason: suggestion.reason,
        position: { x: 0, y: 0 },
        createdAt: new Date().toISOString(),
      })

      result.edges.push({
        id: uuidv4(),
        source: parentId,
        target: nodeId,
        label: suggestion.reason,
        edgeType: type,
      })

      return result
    },
    { nodes: [], edges: [] },
  )
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppState(loadState())
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const cookedNodes = useMemo(
    () => appState.nodes.filter((node) => node.status === 'cooked'),
    [appState.nodes],
  )

  const recentDishes = useMemo(
    () =>
      [...cookedNodes]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 5)
        .map((node) => node.name),
    [cookedNodes],
  )

  async function handleAddDish(dish: string) {
    setIsLoading(true)
    setError(null)

    try {
      const existingDishes = appState.nodes.map((node) => node.name)
      const suggestions = await fetchSuggestions(dish, existingDishes)
      const dishNodeId = uuidv4()
      const createdAt = new Date().toISOString()
      const dishNode: RecipeNode = {
        id: dishNodeId,
        name: dish,
        status: 'cooked',
        type: 'base',
        parentId: null,
        reason: '最初に追加した料理',
        position: { x: 0, y: 0 },
        createdAt,
      }
      const existingNames = new Set([...existingDishes, dish])
      const variation = buildSuggestionNodes(
        dishNodeId,
        suggestions.variations,
        'variation',
        existingNames,
      )
      const adjacent = buildSuggestionNodes(
        dishNodeId,
        suggestions.adjacent,
        'adjacent',
        existingNames,
      )
      const nextState: AppState = {
        nodes: [dishNode, ...appState.nodes, ...variation.nodes, ...adjacent.nodes],
        edges: [...appState.edges, ...variation.edges, ...adjacent.edges],
        lastUpdated: createdAt,
      }

      setAppState(nextState)
      saveState(nextState)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '料理の追加に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleNodeCooked(nodeId: string) {
    const targetNode = appState.nodes.find((node) => node.id === nodeId)

    if (!targetNode || targetNode.status === 'cooked' || isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const existingDishes = appState.nodes.map((node) => node.name)
      const suggestions = await fetchSuggestions(targetNode.name, existingDishes)
      const updatedAt = new Date().toISOString()
      const updatedNodes = appState.nodes.map((node) =>
        node.id === nodeId ? { ...node, status: 'cooked' as const } : node,
      )
      const existingNames = new Set(existingDishes)
      const variation = buildSuggestionNodes(
        nodeId,
        suggestions.variations,
        'variation',
        existingNames,
      )
      const adjacent = buildSuggestionNodes(
        nodeId,
        suggestions.adjacent,
        'adjacent',
        existingNames,
      )
      const nextState: AppState = {
        nodes: [...updatedNodes, ...variation.nodes, ...adjacent.nodes],
        edges: [...appState.edges, ...variation.edges, ...adjacent.edges],
        lastUpdated: updatedAt,
      }

      setAppState(nextState)
      saveState(nextState)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '候補の追加に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#F7F8F5] text-zinc-900">
      <AddDishPanel
        cookedCount={cookedNodes.length}
        recentDishes={recentDishes}
        onAddDish={handleAddDish}
        isLoading={isLoading}
      />
      <main className="relative flex-1">
        {error ? (
          <div className="absolute left-6 top-6 z-10 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}
        {appState.nodes.length > 0 ? (
          <RecipeFlow nodes={appState.nodes} edges={appState.edges} onNodeCooked={handleNodeCooked} />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-zinc-400">
            <p className="text-sm">左の入力欄から、まず作れる料理を追加してください。</p>
          </div>
        )}
      </main>
    </div>
  )
}
