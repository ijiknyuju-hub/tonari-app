'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { dishes, relations } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'

type NodeState = 'made' | 'bookmarked' | 'base' | 'custom' | 'unexplored'

interface IslandMapProps {
  embedded?: boolean
}

export default function IslandMap({ embedded = false }: IslandMapProps) {
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { state } = useUserState()
  const { customDishes } = useDishLibrary()

  useEffect(() => {
    if (!embedded) trackEvent('open_map')
  }, [embedded])

  const selectedBaseSet = useMemo(() => new Set(selectedBaseDishIds), [selectedBaseDishIds])
  const bookmarkedSet = useMemo(() => new Set(state.bookmarked), [state.bookmarked])
  const madeSet = useMemo(() => new Set(state.made_records.map((r) => r.dish_id)), [state.made_records])

  const visibleDishIds = useMemo(() => {
    const ids = new Set(dishes.map((d) => d.id))
    relations.forEach((r) => {
      ids.add(r.source)
      ids.add(r.target)
    })
    return [...ids]
  }, [])

  function getNodeState(dishId: string): NodeState {
    if (madeSet.has(dishId)) return 'made'
    if (bookmarkedSet.has(dishId)) return 'bookmarked'
    if (selectedBaseSet.has(dishId)) return 'base'
    return 'unexplored'
  }

  const customByBase = useMemo(() => {
    const map = new Map<string, typeof customDishes>()
    for (const dish of customDishes) {
      const key = dish.attached_base_dish_id ?? '__custom__'
      map.set(key, [...(map.get(key) ?? []), dish])
    }
    return map
  }, [customDishes])

  return (
    <section className={embedded ? 'tn-container tn-bottom-safe pt-2' : 'tn-container tn-bottom-safe pt-6'}>
      {!embedded && (
        <header className="mb-5 space-y-2">
          <p className="text-sm font-extrabold text-[var(--tn-accent)]">Tonari Gohan</p>
          <h1 className="text-2xl font-black text-[var(--tn-text)]">レパートリーマップ</h1>
        </header>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-[var(--tn-border)] bg-[var(--tn-surface)] p-2">
        <LegendDot label="作った" className="bg-[var(--tn-accent)]" />
        <LegendDot label="保存済み" className="border border-[var(--tn-accent)] bg-[var(--tn-accent-soft)]" />
        <LegendDot label="自作" className="bg-[#6aab40]" />
        <LegendDot label="これから" className="bg-zinc-300 opacity-70" />
      </div>

      <div className="rounded-[1.5rem] border border-[var(--tn-border)] bg-[var(--tn-bg)] p-4 shadow-[var(--tn-shadow-soft)]">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {visibleDishIds.map((id) => {
            const dish = dishes.find((d) => d.id === id)
            if (!dish) return null
            const nodeState = getNodeState(id)
            const attached = customByBase.get(id) ?? []
            return (
              <div key={id} className="space-y-2">
                <Link href={`/dish/${id}`} className={nodeClass(nodeState)}>
                  {dish.name}
                </Link>
                {attached.map((custom) => (
                  <Link key={custom.id} href={`/dish/${custom.id}`} className={nodeClass('custom')}>
                    {custom.name}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>

        {(customByBase.get('__custom__') ?? []).length > 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--tn-border)] bg-white p-3">
            <p className="mb-2 text-xs font-black text-[var(--tn-text-sub)]">自作エリア</p>
            <div className="grid grid-cols-2 gap-2">
              {(customByBase.get('__custom__') ?? []).map((custom) => (
                <Link key={custom.id} href={`/dish/${custom.id}`} className={nodeClass('custom')}>
                  {custom.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function nodeClass(state: NodeState) {
  const base = 'block rounded-2xl p-3 text-center text-sm font-black'
  if (state === 'made') return `${base} bg-[var(--tn-accent)] text-white`
  if (state === 'bookmarked' || state === 'base') {
    return `${base} border border-[var(--tn-accent)] bg-[var(--tn-accent-soft)] text-[var(--tn-accent)]`
  }
  if (state === 'custom') return `${base} bg-[#6aab40] text-white`
  return `${base} bg-zinc-100 text-zinc-400`
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full px-2 py-1 text-xs font-black text-[var(--tn-text)]">
      <span className={`h-3 w-3 rounded-full ${className}`} />
      {label}
    </span>
  )
}
