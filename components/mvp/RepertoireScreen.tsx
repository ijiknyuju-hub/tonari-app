'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { dishes } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'
import BottomNav from './BottomNav'
import IslandMap from './IslandMap'

const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]
type View = 'map' | 'list'
type CookbookRow = { id: string; name: string; badge: string; date: string | undefined }

export default function RepertoireScreen() {
  const { state } = useUserState()
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'map'
    const saved = window.localStorage.getItem('cookbook_view')
    return saved === 'map' || saved === 'list' ? saved : 'map'
  })

  useEffect(() => {
    trackEvent('open_repertoire')
  }, [])

  const madeSet = useMemo(() => new Set(state.made_records.map((r) => r.dish_id)), [state.made_records])
  const repertoireCount = madeSet.size
  const cumulativeDays = useMemo(
    () => new Set(state.made_records.map((r) => r.made_at.slice(0, 10))).size,
    [state.made_records],
  )
  const nextMilestone = MILESTONES.find((m) => m > repertoireCount) ?? 100
  const progressPct = Math.min((repertoireCount / nextMilestone) * 100, 100)

  function switchView(next: View) {
    setView(next)
    window.localStorage.setItem('cookbook_view', next)
    trackEvent('cookbook_view_toggle', { tab: next })
  }

  return (
    <main className="tn-screen">
      <section className="tn-container pt-6">
        <header className="space-y-4">
          <div>
            <p className="text-sm font-extrabold text-[var(--tn-accent)]">Tonari Gohan</p>
            <h1 className="text-2xl font-black text-[var(--tn-text)]">あなたのレパートリー</h1>
          </div>
          <div className="tn-card p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-black text-[var(--tn-accent)]">{repertoireCount}</p>
                <p className="text-sm font-bold text-[var(--tn-text-sub)]">作った料理</p>
              </div>
              <p className="text-sm font-bold text-[var(--tn-text-sub)]">累計 {cumulativeDays} 日</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--tn-surface-soft)]">
              <div className="h-full rounded-full bg-[var(--tn-accent)]" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-2 text-right text-xs font-black text-[var(--tn-accent)]">
              あと {Math.max(nextMilestone - repertoireCount, 0)} 品で {nextMilestone} 品
            </p>
          </div>
          <div className="grid grid-cols-2 rounded-2xl border border-[var(--tn-border)] bg-white p-1">
            <button type="button" onClick={() => switchView('map')} className={segmentClass(view === 'map')}>
              マップ
            </button>
            <button type="button" onClick={() => switchView('list')} className={segmentClass(view === 'list')}>
              料理帳
            </button>
          </div>
        </header>
      </section>
      {view === 'map' ? <IslandMap embedded /> : <CookbookList />}
      <BottomNav />
    </main>
  )
}

function segmentClass(active: boolean) {
  return [
    'rounded-xl px-3 py-2 text-sm font-black',
    active ? 'bg-[var(--tn-accent)] text-white' : 'text-[var(--tn-text-sub)]',
  ].join(' ')
}

function CookbookList() {
  const { state } = useUserState()
  const { customDishes } = useDishLibrary()
  const { selectedBaseDishIds } = useSelectedBaseDishes()

  const latestMade = useMemo(() => {
    const map = new Map<string, string>()
    for (const record of state.made_records) {
      const current = map.get(record.dish_id)
      if (!current || record.made_at > current) map.set(record.dish_id, record.made_at)
    }
    return map
  }, [state.made_records])

  const rows = useMemo(() => {
    const ids = new Set([...state.bookmarked, ...selectedBaseDishIds, ...latestMade.keys()])
    const baseRows = [...ids]
      .map((id) => {
        const dish = dishes.find((d) => d.id === id)
        if (!dish) return null
        return {
          id,
          name: dish.name,
          badge: latestMade.has(id) ? '作った' : state.bookmarked.includes(id) ? '保存済み' : 'ベース',
          date: latestMade.get(id),
        }
      })
      .filter((row): row is CookbookRow => row != null)
    const customRows = customDishes.map((dish) => ({
      id: dish.id,
      name: dish.name,
      badge: latestMade.has(dish.id) ? '作った / 自作' : '自作',
      date: latestMade.get(dish.id) ?? dish.created_at,
    }))
    return [...customRows, ...baseRows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }, [customDishes, latestMade, selectedBaseDishIds, state.bookmarked])

  const monthly = useMemo(() => {
    const counts = new Map<string, number>()
    for (const record of state.made_records) {
      const month = record.made_at.slice(0, 7)
      counts.set(month, (counts.get(month) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6)
  }, [state.made_records])
  const max = Math.max(1, ...monthly.map(([, count]) => count))

  return (
    <section className="tn-container tn-bottom-safe space-y-5 pt-2">
      <Link
        href="/custom-dish/new"
        className="flex w-full items-center justify-center rounded-2xl bg-[var(--tn-accent)] py-3 text-sm font-black text-white"
      >
        + 自分の料理を追加
      </Link>
      {monthly.length > 0 && (
        <div className="tn-card p-4">
          <p className="mb-3 text-sm font-black text-[var(--tn-text)]">月別レパートリー</p>
          <div className="flex h-24 items-end gap-2">
            {monthly.map(([month, count]) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold text-[var(--tn-text-sub)]">{count}</span>
                <div className="w-full rounded-t-lg bg-[var(--tn-accent)]" style={{ height: `${(count / max) * 100}%` }} />
                <span className="text-[10px] font-bold text-[var(--tn-text-sub)]">{month.slice(5)}月</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm font-bold text-[var(--tn-text-sub)]">
            まだ記録がありません。ホームから料理を記録してみましょう。
          </p>
        ) : (
          rows.map((row) => (
            <Link
              key={row.id}
              href={`/dish/${row.id}`}
              className="flex items-center justify-between rounded-2xl border border-[var(--tn-border)] bg-[var(--tn-surface)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-black text-[var(--tn-text)]">{row.name}</p>
                <p className="mt-1 text-xs font-bold text-[var(--tn-text-sub)]">
                  {row.date ? row.date.slice(0, 10).replace(/-/g, '/') : '未記録'}
                </p>
              </div>
              <span className="rounded-full bg-[var(--tn-accent-soft)] px-3 py-1 text-xs font-black text-[var(--tn-accent)]">
                {row.badge}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
