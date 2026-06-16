'use client'

import { useMemo, useState } from 'react'
import BottomNav from '@/components/mvp/BottomNav'
import { FeaturedCard, CompactCard } from '@/components/mvp/NearbyDishCard'
import { dishes, relations } from '@/data/v3'
import { todaysPick, type HomeMode } from '@/lib/mvp/todaysPick'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'

const MODES: Array<{ id: HomeMode; label: string; description: string }> = [
  { id: 'easy', label: 'かんたん', description: 'すぐ作れる・工程少なめ' },
  { id: 'stretch', label: '少し広げる', description: 'いつもと少し違う' },
  { id: 'full', label: 'しっかり作る', description: '満足感のある一品' },
]

function getDishName(id: string): string {
  return dishes.find((d) => d.id === id)?.name ?? id
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'おはようございます'
  if (hour < 18) return 'こんにちは'
  return 'こんばんは'
}

export default function HomeScreen({ dateISO }: { dateISO: string }) {
  const [mode, setMode] = useState<HomeMode>('easy')
  const { selectedBaseDishIds, setSelectedBaseDishIds } = useSelectedBaseDishes()
  const { recordMade } = useUserState()

  // The featured (today's pick) relation
  const featured = useMemo(
    () => todaysPick(selectedBaseDishIds, mode, dateISO),
    [mode, selectedBaseDishIds, dateISO],
  )

  // All other matching relations (same mode, same selected base dishes, not featured)
  const otherCards = useMemo(() => {
    const candidates = relations.filter(
      (r) =>
        r.tab === mode &&
        selectedBaseDishIds.includes(r.source) &&
        r.target !== featured?.target,
    )
    // Sort by proximity descending
    return candidates.slice().sort((a, b) => b.proximity - a.proximity)
  }, [mode, selectedBaseDishIds, featured])

  // Switch base dish context to a random different dish
  function handleSwitchBase() {
    const allIds = dishes.map((d) => d.id)
    const others = allIds.filter((id) => !selectedBaseDishIds.includes(id))
    if (others.length === 0) return
    const pick = others[Math.floor(Math.random() * others.length)]
    setSelectedBaseDishIds([...(selectedBaseDishIds ?? []), pick])
  }

  function handleMadeIt() {
    if (!featured) return
    recordMade({
      dish_id: featured.target,
      made_at: new Date().toISOString(),
      rating: 'ok',
    })
  }

  const sourceName = featured ? getDishName(featured.source) : ''

  return (
    <main className="tn-screen">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur"
        style={{ borderColor: 'var(--tn-border)' }}
      >
        <div className="tn-container flex h-14 items-center justify-between">
          <button
            type="button"
            aria-label="メニュー"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: 'var(--tn-text)' }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black" style={{ color: 'var(--tn-accent)' }}>
            となりごはん
          </span>
          <button
            type="button"
            aria-label="通知"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: 'var(--tn-text)' }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 10a6 6 0 0 1 12 0c0 4 2 5 2 5H4s2-1 2-5Z" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
          </button>
        </div>
      </header>

      <div className="tn-container tn-bottom-safe pt-6">
        {/* Greeting */}
        <section className="mb-5">
          <p className="text-xl font-black" style={{ color: 'var(--tn-text)' }}>
            {greeting()}
          </p>
          <p className="mt-1 text-sm font-bold" style={{ color: 'var(--tn-text-sub)' }}>
            今日のおすすめはこちら
          </p>
        </section>

        {/* Difficulty tabs */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {MODES.map((item) => {
            const selected = item.id === mode
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(item.id)}
                className="min-h-[4.5rem] rounded-[1.25rem] border px-2 text-center shadow-[var(--tn-shadow-soft)] transition"
                style={{
                  borderColor: selected ? 'var(--tn-accent)' : 'var(--tn-border)',
                  background: selected ? 'var(--tn-accent-soft)' : 'var(--tn-surface)',
                }}
              >
                <span
                  className="block text-sm font-black"
                  style={{ color: selected ? 'var(--tn-accent)' : 'var(--tn-text)' }}
                >
                  {item.label}
                </span>
                <span
                  className="mt-1 block text-xs font-bold leading-5"
                  style={{ color: 'var(--tn-text-sub)' }}
                >
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* Section header */}
        {featured && (
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black" style={{ color: 'var(--tn-text)' }}>
              この前作った『{sourceName}』から広げる
            </p>
            <button
              type="button"
              onClick={handleSwitchBase}
              className="shrink-0 rounded-full border px-3 py-1 text-xs font-bold"
              style={{ borderColor: 'var(--tn-accent)', color: 'var(--tn-accent)' }}
            >
              他の起点にする
            </button>
          </div>
        )}

        {/* Featured card */}
        {featured ? (
          <FeaturedCard
            relation={featured}
            targetName={getDishName(featured.target)}
            onMadeIt={handleMadeIt}
          />
        ) : (
          <EmptyState hasSelection={selectedBaseDishIds.length > 0} />
        )}

        {/* Other cards section */}
        {otherCards.length > 0 && (
          <section className="mt-7">
            <p className="mb-3 text-sm font-black" style={{ color: 'var(--tn-text)' }}>
              他にもこんな広げ方があります
            </p>
            {/* Horizontal scroll row */}
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {otherCards.map((rel) => (
                <CompactCard
                  key={rel.target}
                  relation={rel}
                  targetName={getDishName(rel.target)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

function EmptyState({ hasSelection }: { hasSelection: boolean }) {
  return (
    <section className="tn-card p-5">
      <p className="text-base font-black" style={{ color: 'var(--tn-text)' }}>
        {hasSelection ? 'まだ料理データがありません' : 'まずは作れる料理を選びましょう'}
      </p>
      <p className="mt-3 text-sm font-bold leading-7" style={{ color: 'var(--tn-text-sub)' }}>
        {hasSelection
          ? '近い料理のデータを準備中です。もうしばらくお待ちください。'
          : '作れる料理を選ぶと、今日のおすすめを表示します。'}
      </p>
    </section>
  )
}
