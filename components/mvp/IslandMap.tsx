'use client'

import { useEffect, useMemo } from 'react'
import { dishes, relations } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'

const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]

type NodeState = 'made' | 'bookmarked' | 'base' | 'unexplored'

export default function IslandMap() {
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { state } = useUserState()

  useEffect(() => { trackEvent('open_level_up') }, [])

  const selectedBaseSet = useMemo(() => new Set(selectedBaseDishIds), [selectedBaseDishIds])
  const bookmarkedSet = useMemo(() => new Set(state.bookmarked), [state.bookmarked])
  const madeSet = useMemo(
    () => new Set(state.made_records.map((r) => r.dish_id)),
    [state.made_records],
  )

  const repertoireCount = madeSet.size
  const cumulativeDays = useMemo(
    () => new Set(state.made_records.map((r) => r.made_at.slice(0, 10))).size,
    [state.made_records],
  )
  const nextMilestone = MILESTONES.find((m) => m > repertoireCount) ?? 100
  const remaining = nextMilestone - repertoireCount
  const progressPct = Math.min((repertoireCount / nextMilestone) * 100, 100)

  const allDishIds = useMemo(() => {
    const ids = new Set(dishes.map((d) => d.id))
    relations.forEach((r) => {
      ids.add(r.source)
      ids.add(r.target)
    })
    return [...ids]
  }, [])

  const madeCount = useMemo(
    () => allDishIds.filter((id) => madeSet.has(id)).length,
    [allDishIds, madeSet],
  )

  function getNodeState(dishId: string): NodeState {
    if (madeSet.has(dishId)) return 'made'
    if (bookmarkedSet.has(dishId)) return 'bookmarked'
    if (selectedBaseSet.has(dishId)) return 'base'
    return 'unexplored'
  }

  return (
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
            {madeCount} / {allDishIds.length} 品
          </p>
        </div>
      </header>

      {/* Level-up stats */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[var(--tn-surface)] p-4" style={{ border: '1px solid var(--tn-border)' }}>
        <div className="text-center">
          <p className="text-2xl font-black" style={{ color: 'var(--tn-accent)' }}>{repertoireCount}品</p>
          <p className="text-xs" style={{ color: 'var(--tn-text-sub)' }}>累計{cumulativeDays}日</p>
        </div>
        <div className="flex-1">
          <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--tn-surface-soft)' }}>
            <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: 'var(--tn-accent)' }} />
          </div>
          {remaining > 0 && (
            <p className="mt-1 text-right text-xs font-bold" style={{ color: 'var(--tn-accent)' }}>
              あと{remaining}品で{nextMilestone}品
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-[var(--tn-border)] bg-[var(--tn-surface)] p-2">
        <LegendDot label="作った" className="bg-[var(--tn-accent)]" />
        <LegendDot label="作りたい" className="border border-[var(--tn-accent)] bg-[var(--tn-accent-soft)]" />
        <LegendDot label="これから" className="bg-zinc-300 opacity-70" />
      </div>

      {allDishIds.length > dishes.length ? (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--tn-border)] bg-[var(--tn-bg)] p-4 shadow-[var(--tn-shadow-soft)]">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {allDishIds.map((id) => {
              const nodeState = getNodeState(id)
              const name = dishes.find((d) => d.id === id)?.name ?? id
              return (
                <div
                  key={id}
                  className={[
                    'rounded-2xl p-3 text-center text-sm font-black',
                    nodeState === 'made'
                      ? 'bg-[var(--tn-accent)] text-white'
                      : nodeState === 'bookmarked' || nodeState === 'base'
                        ? 'border border-[var(--tn-accent)] bg-[var(--tn-accent-soft)] text-[var(--tn-accent)]'
                        : 'bg-zinc-100 text-zinc-400',
                  ].join(' ')}
                >
                  {name}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[1.5rem] border border-[var(--tn-border)] bg-[var(--tn-bg)] p-8 text-center shadow-[var(--tn-shadow-soft)]">
          <p className="text-5xl">🗺️</p>
          <h2 className="mt-4 text-lg font-black">マップを準備中です</h2>
          <p className="mt-2 text-sm font-bold leading-7 text-[var(--tn-text-sub)]">
            料理データが追加されると、あなたの料理マップが完成します。
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {dishes.map((d) => {
              const nodeState = getNodeState(d.id)
              return (
                <div
                  key={d.id}
                  className={[
                    'rounded-2xl p-3 text-center text-sm font-black',
                    nodeState === 'base'
                      ? 'border border-[var(--tn-accent)] bg-[var(--tn-accent-soft)] text-[var(--tn-accent)]'
                      : 'bg-zinc-100 text-zinc-500',
                  ].join(' ')}
                >
                  {d.name}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
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
