'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { dishes, relations } from '@/data/v3'
import BottomNav from '@/components/mvp/BottomNav'
import DishArt from '@/components/mvp/DishArt'
import { shoppingDishesFromWeekSet, useShoppingList } from '@/lib/mvp/useShoppingList'
import { stableHash } from '@/lib/mvp/todaysPick'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useIsClient } from '@/lib/mvp/useIsClient'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'
import { useWeekSet } from '@/lib/mvp/useWeekSet'

type DifficultyTab = 'easy' | 'stretch' | 'full'

type HeroDish = {
  id: string
  name: string
  eyebrow: string
  intro: string
  palette?: number
}

const TABS: ReadonlyArray<{ id: DifficultyTab; label: string; background: string }> = [
  { id: 'easy', label: 'かんたん', background: '#83A473' },
  { id: 'stretch', label: '広げる', background: '#D3A051' },
  { id: 'full', label: 'しっかり', background: '#C15436' },
]

const DIFFICULTY_LABELS: Readonly<Record<DifficultyTab, string>> = {
  easy: 'かんたん',
  stretch: '少し広げる',
  full: 'しっかり作る',
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'おはようございます。今日は何にする？'
  if (hour < 18) return 'こんにちは。今日は何にする？'
  return 'おかえりなさい。今日は何にする？'
}

function relationIntro(targetId: string) {
  const relation = relations.find((candidate) => candidate.target === targetId)
  return relation ? `${relation.description_line1}${relation.description_line2}` : '今週のセットから、今日の一皿を。'
}

export default function HomeScreen({ dateISO }: { dateISO: string }) {
  const [activeTab, setActiveTab] = useState<DifficultyTab>('stretch')
  const isClient = useIsClient()
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { state, bookmark, unbookmark } = useUserState()
  const { customDishes } = useDishLibrary()
  const { dishIds: weekSetDishIds, hasWeekSet } = useWeekSet()
  const shoppingDishes = useMemo(
    () => shoppingDishesFromWeekSet(weekSetDishIds, customDishes),
    [customDishes, weekSetDishIds],
  )
  const { remainingCount } = useShoppingList(shoppingDishes)

  useEffect(() => {
    if (isClient && selectedBaseDishIds.length === 0) {
      window.location.replace('/onboarding')
    }
  }, [isClient, selectedBaseDishIds.length])

  const hasCookableWeekSet = hasWeekSet && remainingCount === 0

  const recommendationDishes = useMemo(() => {
    const candidates = relations.filter(
      (relation) => relation.tab === activeTab && selectedBaseDishIds.includes(relation.source),
    )
    if (candidates.length === 0) return []

    const start = stableHash(`${dateISO}:${activeTab}:${selectedBaseDishIds.join(',')}`) % candidates.length
    return candidates.slice(start).concat(candidates.slice(0, start)).map((relation) => {
      const dish = dishes.find((candidate) => candidate.id === relation.target)
      return {
        id: relation.target,
        name: dish?.name ?? relation.target,
        eyebrow: `${dishes.find((candidate) => candidate.id === relation.source)?.name ?? 'いつもの料理'}から広げる`,
        intro: `${relation.description_line1}${relation.description_line2}`,
      }
    })
  }, [activeTab, dateISO, selectedBaseDishIds])

  const weekSetDishes = useMemo<HeroDish[]>(() => {
    return weekSetDishIds.flatMap((id) => {
      const dish = dishes.find((candidate) => candidate.id === id)
      if (dish) {
        return [{ id: dish.id, name: dish.name, eyebrow: '今週のセットから', intro: relationIntro(dish.id) }]
      }
      const customDish = customDishes.find((candidate) => candidate.id === id)
      return customDish
        ? [{ id: customDish.id, name: customDish.name, eyebrow: '今週のセットから', intro: '今週のセットに入っている、あなたの一皿です。' }]
        : []
    })
  }, [customDishes, weekSetDishIds])

  const visibleDishes = hasCookableWeekSet ? weekSetDishes : recommendationDishes
  const hero = visibleDishes[0]
  const subDishes = visibleDishes.slice(1, 5)

  if (!isClient || selectedBaseDishIds.length === 0) {
    return <main className="tn-screen" />
  }

  return (
    <main className="tn-screen">
      <header style={{ padding: '58px 22px 8px', background: '#FFFFFF' }}>
        <div className="mx-auto flex max-w-[402px] items-center justify-between">
          <div className="flex items-center gap-[9px]">
            <span
              aria-hidden="true"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
              style={{ background: '#DE5528' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 11h16c0 4-3.6 7-8 7s-8-3-8-7Z" fill="#FFFFFF" />
                <path d="m14.5 4.2-3 6.2m6.3-5.3-3.2 5.3" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-[17px] font-bold tracking-[.5px]" style={{ color: '#1A1A1A', fontFamily: 'var(--font-heading)' }}>
              となりごはん
            </span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: '#F2F2F2', color: '#7A7570' }}>
            か
          </span>
        </div>
        <p className="mx-auto mt-[10px] max-w-[402px] text-[14px] font-medium" style={{ color: '#7A7570' }}>
          {greeting()}
        </p>
      </header>

      <div className="mx-auto max-w-[402px] px-[22px] pb-[104px] pt-2">
        {!hasWeekSet ? (
          <Link
            href="/weekset"
            className="mb-4 flex items-center justify-between rounded-[10px] border px-3 py-[11px] text-[13px] font-bold"
            style={{ borderColor: 'rgba(26, 26, 26, 0.14)', color: '#1A1A1A', background: '#FFFFFF' }}
          >
            <span>今週のセットを組む</span>
            <ArrowRight />
          </Link>
        ) : !hasCookableWeekSet ? (
          <Link
            href="/shopping"
            className="mb-4 inline-flex items-center gap-[7px] rounded-[9px] border px-3 py-[9px] text-[13px] font-bold"
            style={{ borderColor: 'rgba(26, 26, 26, 0.14)', color: '#1A1A1A', background: '#FFFFFF' }}
          >
            <ShoppingIcon />
            買い物リスト のこり {remainingCount}品
          </Link>
        ) : null}

        <div className="flex gap-[6px]">
          {TABS.map((tab) => {
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 rounded-[9px] px-1 py-[10px] text-[13px]"
                style={{ background: selected ? tab.background : '#F0EDE8', color: selected ? '#FFFFFF' : '#7A7570', fontWeight: selected ? 700 : 500 }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {!hasCookableWeekSet ? (
          <div className="mt-4 flex justify-end">
            <span className="flex items-center gap-[5px] text-[12px] font-semibold" style={{ color: '#7A7570' }}>
              <RefreshIcon /> 他の起点にする
            </span>
          </div>
        ) : null}

        {hero ? (
          <section className={hasCookableWeekSet ? 'mt-4' : 'mt-4'}>
            <Link href={`/dish/${hero.id}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]" style={{ background: '#F2F2F2' }}>
                <DishArt dish={hero.name} seed={hero.id} radius={10} />
                <span
                  className="absolute left-3 top-3 rounded-[6px] px-[9px] py-1 text-[11px] font-bold"
                  style={{ background: '#FBEBDD', color: '#C25A20' }}
                >
                  {hasCookableWeekSet ? '今週の一皿' : DIFFICULTY_LABELS[activeTab]}
                </span>
              </div>
            </Link>
            <div className="mt-[14px]">
              <div className="text-[12px] font-bold tracking-[.3px]" style={{ color: '#DE5528' }}>{hero.eyebrow}</div>
              <h1 className="mt-[7px] text-[27px] font-bold tracking-[.2px]" style={{ color: '#1A1A1A', fontFamily: 'var(--font-heading)' }}>
                {hero.name}
              </h1>
              <p className="mt-[9px] line-clamp-2 text-[14px] leading-[1.7]" style={{ color: '#7A7570' }}>{hero.intro}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dish/${hero.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] py-[14px] text-[15px] font-bold"
                  style={{ background: '#DE5528', color: '#FFFFFF', boxShadow: '0 6px 16px rgba(222, 85, 40, 0.28)' }}
                >
                  作り方を見る <ArrowRight color="#FFFFFF" />
                </Link>
                <button
                  type="button"
                  aria-label={state.bookmarked.includes(hero.id) ? `${hero.name}の保存を解除` : `${hero.name}を保存`}
                  onClick={() => (state.bookmarked.includes(hero.id) ? unbookmark(hero.id) : bookmark(hero.id))}
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-full border"
                  style={{ borderColor: 'rgba(26, 26, 26, 0.14)', color: '#DE5528', background: '#FFFFFF' }}
                >
                  <BookmarkIcon filled={state.bookmarked.includes(hero.id)} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16 text-center">
            <p className="text-[14px] font-bold" style={{ color: '#7A7570' }}>おすすめを用意しています</p>
            <p className="mt-2 text-[12px]" style={{ color: '#B7B2AC' }}>よく作る料理を追加すると、近い一皿が見つかります。</p>
          </section>
        )}

        {subDishes.length > 0 ? (
          <section className="mt-7">
            <h2 className="text-[12.5px] font-bold tracking-[.3px]" style={{ color: '#1A1A1A' }}>
              {hasCookableWeekSet ? '今週のセット、ほかの料理' : '同じ難易度で、こんな料理も'}
            </h2>
            <div className="mt-[6px] border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.08)' }}>
              {subDishes.map((dish) => (
                <Link
                  key={dish.id}
                  href={`/dish/${dish.id}`}
                  className="flex items-center gap-4 border-b py-[18px]"
                  style={{ borderColor: 'rgba(26, 26, 26, 0.08)' }}
                >
                  <div className="w-[100px] shrink-0 aspect-[4/3] overflow-hidden rounded-[8px]" style={{ background: '#F2F2F2' }}>
                    <DishArt dish={dish.name} seed={dish.id} radius={8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16.5px] font-bold" style={{ color: '#1A1A1A' }}>{dish.name}</div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.55]" style={{ color: '#7A7570' }}>{dish.intro}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <BottomNav />
    </main>
  )
}

function ArrowRight({ color = '#DE5528' }: { color?: string }) {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h11m-4-5 5 5-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="14" height="16" viewBox="0 0 16 18" fill={filled ? '#DE5528' : 'none'}>
      <path d="M2.8 1.8h10.4v13.4L8 11.7l-5.2 3.5Z" stroke="#DE5528" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path d="M12 7a5 5 0 1 1-1.5-3.6M12 1v3H9" stroke="#7A7570" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShoppingIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 7.5h14l-1.2 10.8a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L5 7.5Z" stroke="#7A7570" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.7 7.5 2.2-3.8m4.4 3.8-2.2-3.8" stroke="#7A7570" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
