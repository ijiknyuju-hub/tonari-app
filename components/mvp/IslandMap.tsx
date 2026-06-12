'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { baseDishes } from '@/data/baseDishes'
import { dishCards } from '@/data/dishCards'
import { islandMapNodes } from '@/data/islandMap'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import { trackEvent } from '@/lib/phase0/analytics'
import { recommendDishes, type RecommendedDish } from '@/lib/phase0/recommendDishes'
import { useSavedDishes } from '@/lib/phase0/useSavedDishes'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import type { BaseDish, DishCard } from '@/types/dish'

type NodeState = 'made' | 'foothold' | 'unexplored'

const cardById = new Map(dishCards.map((card) => [card.id, card]))
const baseById = new Map(baseDishes.map((dish) => [dish.id, dish]))
const nodeById = new Map(islandMapNodes.map((node) => [node.dishId, node]))
const allDishCount = islandMapNodes.length

export default function IslandMap() {
  const [selectedCard, setSelectedCard] = useState<RecommendedDish | null>(null)
  const [selectedBase, setSelectedBase] = useState<BaseDish | null>(null)
  const trackedOpenRef = useRef(false)
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { savedDishes, isSaved, isMade, save, unsave, markMade, unmarkMade } = useSavedDishes()

  useEffect(() => {
    if (trackedOpenRef.current) {
      return
    }

    trackedOpenRef.current = true
    trackEvent('open_island_map')
  }, [])

  const selectedBaseSet = useMemo(() => new Set(selectedBaseDishIds), [selectedBaseDishIds])
  const madeCount = useMemo(() => savedDishes.filter((dish) => dish.madeAt).length, [savedDishes])
  const recommendationById = useMemo(() => buildRecommendations(selectedBaseDishIds), [selectedBaseDishIds])
  const edges = useMemo(() => {
    const seen = new Set<string>()

    return islandMapNodes.flatMap((node) =>
      node.neighbors.flatMap((neighborId) => {
        const neighbor = nodeById.get(neighborId)
        if (!neighbor) {
          return []
        }

        const key = [node.dishId, neighborId].sort().join(':')
        if (seen.has(key)) {
          return []
        }

        seen.add(key)
        return [{ from: node, to: neighbor }]
      }),
    )
  }, [])

  const handleOpenNode = (dishId: string) => {
    const card = cardById.get(dishId)
    if (card) {
      setSelectedBase(null)
      setSelectedCard(recommendationById.get(dishId) ?? toFallbackRecommendation(card))
      return
    }

    setSelectedCard(null)
    setSelectedBase(baseById.get(dishId) ?? null)
  }

  const handleToggleSave = (dishId: string) => {
    if (isSaved(dishId)) {
      unsave(dishId)
      return
    }

    save(dishId)
  }

  const handleToggleMade = (dishId: string) => {
    if (isMade(dishId)) {
      unmarkMade(dishId)
      return
    }

    markMade(dishId)
  }

  return (
    <>
      <section className="tn-container tn-bottom-safe pt-6">
        <header className="space-y-3">
          <p className="text-sm font-extrabold text-[var(--tn-accent)]">となりごはん</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-normal">広がりマップ</h1>
              <p className="mt-2 text-sm leading-7 text-[var(--tn-text-sub)]">
                作った料理が、あなたの島になって広がります。
              </p>
            </div>
            <p className="shrink-0 rounded-full bg-[var(--tn-accent-soft)] px-3 py-2 text-xs font-black text-[var(--tn-accent)]">
              {madeCount} / {allDishCount} 品
            </p>
          </div>
          <p className="text-sm font-extrabold text-[var(--tn-text)]">
            あなたの島: {madeCount} / {allDishCount} 品
          </p>
        </header>

        <div className="mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-[var(--tn-border)] bg-[var(--tn-surface)] p-2">
          <LegendDot label="作った" className="bg-[var(--tn-accent)]" />
          <LegendDot label="作れる・作ってみたい" className="border border-[var(--tn-accent)] bg-[var(--tn-accent-soft)]" />
          <LegendDot label="これから" className="bg-zinc-300 opacity-70" />
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--tn-border)] bg-[var(--tn-bg)] shadow-[var(--tn-shadow-soft)]">
          <svg viewBox="0 0 100 100" role="img" aria-label="料理の広がりマップ" className="block h-auto w-full">
            <rect width="100" height="100" fill="var(--tn-bg)" />
            <path
              d="M24 6 C41 0 65 2 78 13 C94 25 98 45 88 63 C80 79 62 96 39 98 C19 99 6 88 5 70 C3 53 7 33 15 19 C17 14 19 10 24 6 Z"
              fill="var(--tn-surface-soft)"
            />
            <path
              d="M31 15 C48 8 70 12 81 25 C91 37 88 57 76 71 C64 84 40 91 24 83 C10 77 9 59 14 43 C17 32 20 20 31 15 Z"
              fill="white"
              opacity="0.36"
            />
            {edges.map((edge) => (
              <line
                key={`${edge.from.dishId}-${edge.to.dishId}`}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke="var(--tn-border)"
                strokeLinecap="round"
                strokeWidth="0.35"
              />
            ))}
            {islandMapNodes.map((node) => {
              const title = getDishTitle(node.dishId)
              const state = getNodeState(node.dishId, selectedBaseSet, isSaved, isMade)
              const isBase = baseById.has(node.dishId)

              return (
                <g
                  key={node.dishId}
                  role="button"
                  tabIndex={0}
                  aria-label={`${title} ${stateLabel(state)}`}
                  className="cursor-pointer outline-none"
                  onClick={() => handleOpenNode(node.dishId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleOpenNode(node.dishId)
                    }
                  }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isBase ? 2.9 : 2.35}
                    className="transition"
                    fill={nodeFill(state)}
                    opacity={state === 'unexplored' ? 0.72 : 1}
                    stroke={nodeStroke(state)}
                    strokeWidth={isBase ? 0.95 : 0.7}
                  />
                  <text
                    x={node.x}
                    y={node.y + (isBase ? 5.5 : 5)}
                    fill={state === 'unexplored' ? 'var(--tn-text-sub)' : 'var(--tn-text)'}
                    fontSize={isBase ? 2.7 : 2.35}
                    fontWeight={state === 'made' || isBase ? 900 : 700}
                    opacity={state === 'unexplored' ? 0.78 : 1}
                    textAnchor="middle"
                  >
                    {title}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </section>

      {selectedBase ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/35 px-3 pt-8">
          <div className="w-full max-w-md rounded-t-3xl bg-[var(--tn-surface)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black text-[var(--tn-accent)]">起点の料理</p>
                <h2 className="mt-2 text-2xl font-black">{selectedBase.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--tn-text-sub)]">
                  この料理を起点に、近いアレンジ料理が島のまわりへ広がります。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBase(null)}
                className="min-h-10 shrink-0 rounded-full border border-[var(--tn-border)] bg-white px-4 text-sm font-black"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCard ? (
        <DishDetailModal
          recommendation={selectedCard}
          isSaved={isSaved(selectedCard.card.id)}
          isMade={isMade(selectedCard.card.id)}
          onClose={() => setSelectedCard(null)}
          onToggleMade={handleToggleMade}
          onToggleSave={handleToggleSave}
        />
      ) : null}
    </>
  )
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full px-2 py-1 text-xs font-black text-[var(--tn-text)]">
      <span className={`h-3 w-3 rounded-full ${className}`} />
      {label}
    </span>
  )
}

function buildRecommendations(selectedBaseDishIds: string[]): Map<string, RecommendedDish> {
  const sourceIds = selectedBaseDishIds.length > 0 ? selectedBaseDishIds : baseDishes.map((dish) => dish.id)
  return new Map(recommendDishes(sourceIds).map((recommendation) => [recommendation.card.id, recommendation]))
}

function toFallbackRecommendation(card: DishCard): RecommendedDish {
  const closestBaseDishId = card.baseDishIds[0] ?? ''
  const closestBaseDishTitle = baseById.get(closestBaseDishId)?.title ?? 'いつもの料理'

  return {
    card,
    label: card.difficulty === 1 ? 'かなり近い' : card.difficulty === 2 ? '少し変えれば作れる' : 'ちょっと挑戦',
    closestBaseDishId,
    closestBaseDishTitle,
    score: 0,
    matchCount: 0,
  }
}

function getNodeState(
  dishId: string,
  selectedBaseSet: Set<string>,
  isSaved: (dishId: string) => boolean,
  isMade: (dishId: string) => boolean,
): NodeState {
  if (isMade(dishId)) {
    return 'made'
  }

  if (selectedBaseSet.has(dishId) || isSaved(dishId)) {
    return 'foothold'
  }

  return 'unexplored'
}

function getDishTitle(dishId: string): string {
  return cardById.get(dishId)?.title ?? baseById.get(dishId)?.title ?? dishId
}

function nodeFill(state: NodeState): string {
  if (state === 'made') return 'var(--tn-accent)'
  if (state === 'foothold') return 'var(--tn-accent-soft)'
  return '#d4d4d8'
}

function nodeStroke(state: NodeState): string {
  if (state === 'made' || state === 'foothold') return 'var(--tn-accent)'
  return '#a1a1aa'
}

function stateLabel(state: NodeState): string {
  if (state === 'made') return '作った'
  if (state === 'foothold') return '作れる・作ってみたい'
  return 'これから'
}
