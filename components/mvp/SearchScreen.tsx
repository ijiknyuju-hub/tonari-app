'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { dishes, relations } from '@/data/v3'
import BottomNav from '@/components/mvp/BottomNav'
import CharTile from '@/components/mvp/CharTile'
import { genreForDish, genreLabel } from '@/lib/mvp/genre'
import { formatLastMade, latestMadeAt } from '@/lib/mvp/rank'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'

type SearchTab = 'made' | 'bookmarked'

type SearchDish = {
  id: string
  name: string
  ingredients: string[]
  latestMade: string | undefined
  custom: boolean
}

const QUICK_DISH_IDS = new Set([
  'fried-rice', 'curry-udon', 'kimchi-fried-rice', 'takikomi-fried-rice',
  'salmon-fried-rice', 'tatsuta-age', 'oyako-udon', 'anchovy-pasta',
  'mapo-harusame', 'peperoncino-cabbage', 'tonjiru', 'thai-basil-rice',
])

const SEASONING_PATTERN = /(しょうゆ|醤油|みそ|味噌|塩|砂糖|こしょう|胡椒|油|酒|みりん|酢|ソース|だし|ルー|コンソメ|バター|ごま油|片栗粉|小麦粉)/
const SEASONING_INGREDIENTS = new Set(['ナンプラー'])

export default function SearchScreen() {
  const [tab, setTab] = useState<SearchTab>('made')
  const [query, setQuery] = useState('')
  const [quickOnly, setQuickOnly] = useState(false)
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null)
  const { state } = useUserState()
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { customDishes } = useDishLibrary()

  const madeIds = useMemo(
    () => unique([...selectedBaseDishIds, ...state.made_records.map((record) => record.dish_id), ...customDishes.map((dish) => dish.id)]),
    [customDishes, selectedBaseDishIds, state.made_records],
  )

  const sourceIds = tab === 'made' ? madeIds : state.bookmarked
  const candidates = useMemo<SearchDish[]>(() => {
    return sourceIds.flatMap<SearchDish>((id) => {
      const customDish = customDishes.find((dish) => dish.id === id)
      if (customDish) {
        return [{ id, name: customDish.name, ingredients: customDish.ingredients, latestMade: latestMadeAt(state.made_records, id), custom: true }]
      }
      const dish = dishes.find((candidate) => candidate.id === id)
      if (!dish) return []
      const ingredients = unique(
        relations
          .filter((relation) => relation.target === id || relation.source === id)
          .flatMap((relation) => relation.new_ingredients),
      )
      return [{ id, name: dish.name, ingredients, latestMade: latestMadeAt(state.made_records, id), custom: false }]
    })
  }, [customDishes, sourceIds, state.made_records])

  const ingredientChips = useMemo(() => deriveIngredientChips(candidates), [candidates])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ja-JP')
    return candidates
      .filter((dish) => !normalizedQuery || dish.name.toLocaleLowerCase('ja-JP').includes(normalizedQuery))
      .filter((dish) => !quickOnly || QUICK_DISH_IDS.has(dish.id))
      .filter((dish) => !activeIngredient || dish.ingredients.includes(activeIngredient))
      .slice()
      .sort((left, right) => {
        const leftDate = left.latestMade ? new Date(left.latestMade).getTime() : -Infinity
        const rightDate = right.latestMade ? new Date(right.latestMade).getTime() : -Infinity
        return leftDate - rightDate || left.name.localeCompare(right.name, 'ja')
      })
  }, [activeIngredient, candidates, query, quickOnly])

  function changeTab(nextTab: SearchTab) {
    setTab(nextTab)
    setQuickOnly(false)
    setActiveIngredient(null)
  }

  return (
    <main className="tn-screen">
      <header style={{ padding: '58px 22px 0px', background: '#FFFFFF' }}>
        <div className="mx-auto max-w-[402px]">
          <div className="flex items-center gap-[9px]">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ background: '#DE5528' }}>
              <SearchIcon color="#FFFFFF" />
            </span>
            <h1 className="m-0 text-[16px] font-bold tracking-[.5px]" style={{ fontFamily: 'var(--font-heading)' }}>探す</h1>
          </div>
          <label className="mt-[14px] flex items-center gap-[10px] rounded-[11px] border px-[14px] py-3" style={{ borderColor: 'rgba(26, 26, 26, 0.16)' }}>
            <SearchIcon color="#B7B2AC" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="料理名で探す（例: からあげ）"
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none placeholder:text-[#B7B2AC]"
              style={{ color: '#1A1A1A' }}
            />
          </label>
          <div className="mt-[14px] flex gap-6 border-b" style={{ borderColor: 'rgba(26, 26, 26, 0.09)' }}>
            <TabButton active={tab === 'made'} onClick={() => changeTab('made')} icon={<PanIcon active={tab === 'made'} />}>作れる料理</TabButton>
            <TabButton active={tab === 'bookmarked'} onClick={() => changeTab('bookmarked')} icon={<SmallBookmarkIcon active={tab === 'bookmarked'} />}>ブックマーク</TabButton>
          </div>
          <div className="mt-[13px] flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              type="button"
              aria-pressed={quickOnly}
              onClick={() => setQuickOnly((current) => !current)}
              className="inline-flex shrink-0 items-center gap-[6px] rounded-full px-[13px] py-[7px] pl-[11px] text-[13px]"
              style={{ background: quickOnly ? '#1A1A1A' : '#FFFFFF', color: quickOnly ? '#FFFFFF' : '#5A554F', border: quickOnly ? '1px solid #1A1A1A' : '1px solid rgba(26, 26, 26, 0.16)', fontWeight: quickOnly ? 700 : 600 }}
            >
              <ClockIcon color={quickOnly ? '#FFFFFF' : '#7A7570'} /> さっと作れる
            </button>
            <span aria-hidden="true" className="h-5 w-px shrink-0" style={{ background: 'rgba(26, 26, 26, 0.14)' }} />
            {ingredientChips.map((ingredient) => {
              const active = activeIngredient === ingredient
              return (
                <button
                  key={ingredient}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveIngredient((current) => current === ingredient ? null : ingredient)}
                  className="shrink-0 rounded-[9px] px-[14px] py-[7px] text-[13px]"
                  style={{ background: active ? '#1A1A1A' : '#FFFFFF', color: active ? '#FFFFFF' : '#5A554F', border: active ? '1px solid #1A1A1A' : '1px solid rgba(26, 26, 26, 0.14)', fontWeight: active ? 700 : 600 }}
                >
                  {ingredient}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[402px] px-[22px] pb-[104px] pt-1">
        {results.length > 0 ? (
          <div className="border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.08)' }}>
            {results.map((dish) => (
              <Link
                key={dish.id}
                href={dish.custom ? '/repertoire' : `/dish/${dish.id}`}
                className="flex items-center gap-[13px] border-b py-[13px]"
                style={{ borderColor: 'rgba(26, 26, 26, 0.07)' }}
              >
                <CharTile name={dish.name} size={56} radius={9} />
                <div className="min-w-0 flex-1">
                  <div className="text-[15.5px] font-bold" style={{ color: '#1A1A1A' }}>{dish.name}</div>
                  <div className="mt-[3px] text-[11.5px]" style={{ color: '#7A7570' }}>
                    {dish.custom ? '自分の料理' : genreLabelForDish(dish.id)} ・ {formatLastMade(dish.latestMade)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-[56px] text-center text-[13.5px]" style={{ color: '#B7B2AC' }}>
            {tab === 'bookmarked' && state.bookmarked.length === 0 ? 'ブックマークはまだありません' : '見つかりませんでした'}
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  )
}

function deriveIngredientChips(dishesForSearch: readonly SearchDish[]) {
  const coverage = new Map<string, number>()
  for (const dish of dishesForSearch) {
    for (const ingredient of unique(dish.ingredients)) {
      if (SEASONING_PATTERN.test(ingredient) || SEASONING_INGREDIENTS.has(ingredient)) continue
      coverage.set(ingredient, (coverage.get(ingredient) ?? 0) + 1)
    }
  }
  const minimumCoverage = dishesForSearch.length >= 6 ? 3 : 2
  return [...coverage.entries()]
    .filter(([, count]) => count >= minimumCoverage && count < dishesForSearch.length)
    .sort(([leftIngredient, leftCount], [rightIngredient, rightCount]) => rightCount - leftCount || leftIngredient.localeCompare(rightIngredient, 'ja'))
    .map(([ingredient]) => ingredient)
    .slice(0, 12)
}

function genreLabelForDish(dishId: string) {
  const dish = dishes.find((candidate) => candidate.id === dishId)
  return genreLabel(dish ? genreForDish(dish) : 'side')
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)]
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="-mb-px flex items-center gap-[6px] border-b-2 pb-[9px] text-[14px]" style={{ borderColor: active ? '#DE5528' : 'transparent', color: active ? '#1A1A1A' : '#7A7570', fontWeight: active ? 700 : 500 }}>
      {icon}{children}
    </button>
  )
}

function SearchIcon({ color, size = 15 }: { color: string; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.2" /><path d="m16 16 4 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" /></svg>
}

function ClockIcon({ color }: { color: string }) {
  return <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke={color} strokeWidth="2" /><path d="M12 9.5V13l2.4 1.6M9 3.2h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function PanIcon({ active }: { active: boolean }) {
  const color = active ? '#DE5528' : '#7A7570'
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="13" r="6.6" stroke={color} strokeWidth="1.8" /><path d="m16.2 10.2 5.6-2.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg>
}

function SmallBookmarkIcon({ active }: { active: boolean }) {
  const color = active ? '#DE5528' : '#7A7570'
  return <svg aria-hidden="true" width="13" height="16" viewBox="0 0 16 18" fill={active ? color : 'none'}><path d="M2.8 1.8h10.4v13.4L8 11.7l-5.2 3.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" /></svg>
}
