'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { dishes } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useUserState } from '@/lib/mvp/useUserState'

const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]

const RATING_EMOJI: Record<string, string> = {
  great: '😋',
  ok: '🙂',
  meh: '🤔',
}

export function LevelUpScreen() {
  const { state } = useUserState()

  useEffect(() => {
    trackEvent('open_level_up')
  }, [])

  const repertoireCount = useMemo(
    () => new Set(state.made_records.map((r) => r.dish_id)).size,
    [state.made_records],
  )

  const cumulativeDays = useMemo(
    () => new Set(state.made_records.map((r) => r.made_at.slice(0, 10))).size,
    [state.made_records],
  )

  const nextMilestone = MILESTONES.find((m) => m > repertoireCount) ?? 100
  const remaining = nextMilestone - repertoireCount
  const progressPct = Math.min((repertoireCount / nextMilestone) * 100, 100)

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {}
    for (const r of state.made_records) {
      const key = r.made_at.slice(0, 7)
      months[key] = (months[key] ?? 0) + 1
    }
    const entries = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]))
    return entries.slice(-6)
  }, [state.made_records])

  const maxMonthly = useMemo(
    () => Math.max(1, ...monthlyData.map(([, v]) => v)),
    [monthlyData],
  )

  const dishList = useMemo(() => {
    const seen = new Map<string, { made_at: string; rating: string }>()
    for (const r of state.made_records) {
      if (!seen.has(r.dish_id) || r.made_at > seen.get(r.dish_id)!.made_at) {
        seen.set(r.dish_id, { made_at: r.made_at, rating: r.rating })
      }
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1].made_at.localeCompare(a[1].made_at))
      .map(([id, info]) => ({
        id,
        name: dishes.find((d) => d.id === id)?.name ?? id,
        date: info.made_at.slice(0, 10),
        emoji: RATING_EMOJI[info.rating] ?? '🍽️',
      }))
  }, [state.made_records])

  const empty = state.made_records.length === 0

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--tn-bg)', paddingBottom: '5rem' }}
    >
      {/* Header */}
      <div className="px-5 pb-2 pt-8 text-center">
        <h1 className="text-lg font-black" style={{ color: 'var(--tn-text)' }}>
          あなたのレパートリー
        </h1>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-center px-5 py-4">
        <p className="text-5xl font-black" style={{ color: 'var(--tn-accent)' }}>
          {repertoireCount}品
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--tn-text-sub)' }}>
          累計 {cumulativeDays}日 料理した
        </p>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-6">
        <div
          className="h-3 overflow-hidden rounded-full"
          style={{ background: 'var(--tn-surface-soft)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: 'var(--tn-accent)' }}
          />
        </div>
        {remaining > 0 && (
          <p className="mt-1 text-right text-xs font-bold" style={{ color: 'var(--tn-accent)' }}>
            あと{remaining}品で{nextMilestone}品
          </p>
        )}
      </div>

      {/* Monthly chart */}
      {monthlyData.length > 0 && (
        <div className="mx-5 mb-6">
          <p className="mb-3 text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
            📊 月別レパートリー
          </p>
          <div className="flex items-end gap-2" style={{ height: '6rem' }}>
            {monthlyData.map(([month, count]) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold" style={{ color: 'var(--tn-text-sub)' }}>
                  {count}
                </span>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(count / maxMonthly) * 100}%`,
                    minHeight: '4px',
                    background: 'var(--tn-accent)',
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--tn-text-sub)' }}>
                  {month.slice(5)}月
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dish list */}
      <div className="mx-5">
        <p className="mb-3 text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
          作った料理一覧
        </p>
        {empty ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--tn-text-sub)' }}>
            まだ記録がありません。ホームから料理を記録してみましょう！
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {dishList.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: 'var(--tn-surface)', border: '1px solid var(--tn-border)' }}
              >
                <div>
                  <span className="text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
                    {dish.name}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: 'var(--tn-text-sub)' }}>
                    {dish.date.replace(/-/g, '/')}
                  </span>
                </div>
                <span className="text-lg">{dish.emoji}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map link */}
      <div className="mx-5 mt-6 text-center">
        <Link
          href="/map"
          className="text-sm font-bold"
          style={{ color: 'var(--tn-accent)' }}
        >
          マップを見る →
        </Link>
      </div>
    </div>
  )
}
