'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { dishes } from '@/data/v3'
import CharTile from '@/components/mvp/CharTile'
import DishArt from '@/components/mvp/DishArt'
import { GENRES, genreForDish, type GenreId } from '@/lib/mvp/genre'
import { deriveRank, formatLastMade, latestMadeAt, madeCountForDish, type DishRank } from '@/lib/mvp/rank'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'
import BottomNav from './BottomNav'
import RankChip from './RankChip'

type BookTab = 'repertoire' | 'diary'

type RankedDish = {
  id: string
  name: string
  genre: GenreId
  rank: DishRank
  madeCount: number
  lastMade: string | undefined
}

const RANK_ORDER: Record<Exclude<DishRank, null>, number> = {
  specialty: 3,
  regular: 2,
  made: 1,
}

export default function RepertoireScreen() {
  const [tab, setTab] = useState<BookTab>('repertoire')
  const { state } = useUserState()
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { customDishes } = useDishLibrary()

  const cookbook = useMemo<RankedDish[]>(() => {
    const ids = new Set([
      ...selectedBaseDishIds,
      ...state.bookmarked,
      ...state.made_records.map((record) => record.dish_id),
      ...customDishes.map((dish) => dish.id),
    ])

    return [...ids]
      .flatMap((id) => {
        const custom = customDishes.find((dish) => dish.id === id)
        const dish = dishes.find((candidate) => candidate.id === id)
        const name = custom?.name ?? dish?.name
        if (!name) return []
        const madeCount = madeCountForDish(state.made_records, id)
        return [{
          id,
          name,
          genre: genreForDish({ id, name }),
          rank: deriveRank(madeCount),
          madeCount,
          lastMade: latestMadeAt(state.made_records, id),
        }]
      })
      .sort(sortDishes)
  }, [customDishes, selectedBaseDishIds, state.bookmarked, state.made_records])

  return (
    <main className="tn-screen">
      <header style={{ padding: '58px 22px 0', background: '#FFFFFF' }}>
        <div className="mx-auto max-w-[402px]">
          <div className="flex items-center gap-[10px]">
            <span aria-hidden="true" className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#DE5528] text-[17px] font-bold text-white">冊</span>
            <h1 className="m-0 text-[17px] font-bold tracking-[.5px]" style={{ fontFamily: 'var(--font-heading)' }}>料理帳</h1>
          </div>
          <div className="mt-4 flex gap-1 rounded-[11px] bg-[#F1EEEA] p-1">
            <SegmentButton active={tab === 'repertoire'} onClick={() => setTab('repertoire')}>作れる料理</SegmentButton>
            <SegmentButton active={tab === 'diary'} onClick={() => setTab('diary')}>日記</SegmentButton>
          </div>
        </div>
      </header>

      {tab === 'repertoire' ? <CookbookTab cookbook={cookbook} /> : <DiaryTab cookbook={cookbook} />}
      <BottomNav />
    </main>
  )
}

function SegmentButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex-1 rounded-[8px] py-[9px] text-[13px] font-bold"
      style={{ background: active ? '#FFFFFF' : 'transparent', color: active ? '#1A1A1A' : '#7A7570', boxShadow: active ? '0 1px 3px rgba(26,26,26,.10)' : undefined }}
    >
      {children}
    </button>
  )
}

function CookbookTab({ cookbook }: { cookbook: RankedDish[] }) {
  const rankCounts = useMemo(() => ({
    specialty: cookbook.filter((dish) => dish.rank === 'specialty').length,
    regular: cookbook.filter((dish) => dish.rank === 'regular').length,
    made: cookbook.filter((dish) => dish.rank === 'made').length,
  }), [cookbook])
  const genreGroups = GENRES.map((genre) => ({ ...genre, dishes: cookbook.filter((dish) => dish.genre === genre.id) })).filter((group) => group.dishes.length > 0)

  return (
    <section className="mx-auto max-w-[402px] px-[22px] pb-[106px] pt-4">
      <div className="rounded-[13px] border p-[13px_16px]" style={{ background: '#FBF8F4', borderColor: 'rgba(26,26,26,.07)' }}>
        <div className="flex items-baseline gap-[7px]">
          <strong className="text-[27px] font-black leading-none text-[#DE5528]" style={{ fontFamily: 'var(--font-heading)' }}>{cookbook.length}</strong>
          <span className="text-[13px] font-bold text-[#1A1A1A]">品つくれる</span>
          <span className="ml-auto text-[11px] text-[#7A7570]">{genreGroups.length}ジャンル</span>
        </div>
        <div className="mt-[11px] flex border-t pt-[11px]" style={{ borderColor: 'rgba(26,26,26,.08)' }}>
          <SummaryStat label="十八番" value={rankCounts.specialty} tone="specialty" />
          <SummaryStat label="定番" value={rankCounts.regular} tone="regular" bordered />
          <SummaryStat label="作った" value={rankCounts.made} tone="made" bordered />
        </div>
      </div>

      {genreGroups.length ? genreGroups.map((group) => <GenreSection key={group.id} label={group.label} dishes={group.dishes} />) : <EmptyCookbook />}
    </section>
  )
}

function SummaryStat({ label, value, tone, bordered }: { label: string; value: number; tone: Exclude<DishRank, null>; bordered?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px]" style={bordered ? { borderLeft: '1px solid rgba(26,26,26,.09)' } : undefined}>
      <div className="flex items-center gap-1 text-[10.5px] text-[#7A7570]">
        {tone === 'specialty' ? <span className="h-[6px] w-[6px] rounded-full bg-[#DE5528]" /> : tone === 'regular' ? <span className="h-[6px] w-[6px] rounded-full bg-[#D3A051]" /> : <span className="h-[6px] w-[6px] rounded-full border-[1.5px] border-[#C7C1BA]" />}
        {label}
      </div>
      <strong className="text-[16px] font-black leading-none" style={{ color: tone === 'specialty' ? '#DE5528' : '#1A1A1A', fontFamily: 'var(--font-heading)' }}>{value}</strong>
    </div>
  )
}

function GenreSection({ label, dishes: genreDishes }: { label: string; dishes: RankedDish[] }) {
  const specialties = genreDishes.filter((dish) => dish.rank === 'specialty')
  const chips = genreDishes.filter((dish) => dish.rank !== 'specialty')

  return (
    <section className="mt-[24px]">
      <div className="flex items-center gap-[9px]">
        <span className="h-[19px] w-1 rounded-full bg-[#DE5528]" />
        <h2 className="m-0 text-[18px] font-black tracking-[.3px] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-heading)' }}>{label}</h2>
        <span className="rounded-[6px] bg-[#F1EEEA] px-[7px] py-[2px] text-[11px] font-bold text-[#9A948C]">{genreDishes.length}品</span>
      </div>
      {specialties.map((dish) => <SpecialtyCard key={dish.id} dish={dish} />)}
      {chips.length ? <div className="mt-[15px] flex flex-wrap gap-2">{chips.map((dish) => <DishChip key={dish.id} dish={dish} />)}</div> : null}
    </section>
  )
}

function SpecialtyCard({ dish }: { dish: RankedDish }) {
  return (
    <Link href={`/dish/${dish.id}`} className="mt-[13px] block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[13px]" style={{ boxShadow: '0 1px 3px rgba(26,26,26,.06)' }}>
        <DishArt dish={dish.name} seed={dish.id} palette={2} motif="plate" radius={13} />
        <RankChip rank="specialty" className="absolute bottom-3 right-3" />
      </div>
      <div className="mt-[10px] text-[16.5px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'var(--font-heading)' }}>{dish.name}</div>
      <p className="mt-[2px] text-[12px] text-[#7A7570]">通算 {dish.madeCount}回・{formatLastMade(dish.lastMade)}</p>
    </Link>
  )
}

function DishChip({ dish }: { dish: RankedDish }) {
  const rank = dish.rank ?? 'made'
  return (
    <Link href={`/dish/${dish.id}`} className="inline-flex max-w-full items-center gap-[6px] rounded-[10px] px-3 py-2 text-[13px] font-bold text-[#1A1A1A]" style={chipStyle(rank)}>
      {dish.rank ? <RankChip rank={dish.rank} style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', fontSize: 0, gap: 0, width: 'auto', height: 'auto' }} /> : <span className="h-[7px] w-[7px] rounded-full border-[1.5px] border-[#C7C1BA]" />}
      <span className="truncate">{dish.name}</span>
    </Link>
  )
}

function chipStyle(rank: Exclude<DishRank, null>) {
  if (rank === 'regular') return { background: '#F8F1E2', border: '1px solid #E6D4AE' }
  if (rank === 'specialty') return { background: '#FCF0EA', border: '1px solid #E8C4AE' }
  return { background: '#FFFFFF', border: '1px solid rgba(26,26,26,.14)' }
}

function EmptyCookbook() {
  return <p className="py-12 text-center text-[13px] leading-6 text-[#7A7570]">作れる料理を選ぶと、ここに料理帳が育っていきます。</p>
}

function DiaryTab({ cookbook }: { cookbook: RankedDish[] }) {
  const { state } = useUserState()
  const dishById = useMemo(() => new Map(cookbook.map((dish) => [dish.id, dish])), [cookbook])
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthRecords = state.made_records.filter((record) => new Date(record.made_at) >= monthStart)
  const totalDays = new Set(state.made_records.map((record) => record.made_at.slice(0, 10))).size
  const weekStreak = countWeekStreak(state.made_records, now)
  const groups = groupRecords(state.made_records)

  return (
    <section className="mx-auto max-w-[402px] px-[22px] pb-[106px] pt-4">
      <div className="flex items-end justify-between border-b-2 pb-[11px]" style={{ borderColor: '#1A1A1A' }}>
        <div>
          <p className="m-0 text-[11px] font-extrabold tracking-[2px] text-[#DE5528]">{now.getFullYear()}・{String(now.getMonth() + 1).padStart(2, '0')}</p>
          <h2 className="mt-1 text-[21px] font-black leading-[1.1] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-heading)' }}>今月のごはん日記</h2>
        </div>
        <div className="text-right"><strong className="text-[27px] font-black leading-none text-[#DE5528]" style={{ fontFamily: 'var(--font-heading)' }}>{monthRecords.length}</strong><span className="ml-0.5 text-[12px] font-bold text-[#7A7570]">回</span></div>
      </div>
      <p className="mt-[13px] text-[13px] leading-[1.7] text-[#5A554F]">{monthRecords.length ? `今月は${monthRecords.length}回。${monthRecords.length >= 2 ? '少しずつ、いつもの味が増えています。' : '最初の一皿を記録しました。'}` : '今月の一皿を記録すると、ここに小さな日記が育ちます。'}</p>
      <div className="mt-[13px] flex gap-[18px] text-[11.5px] text-[#7A7570]">
        <span>通算 <b className="text-[13px] font-bold text-[#1A1A1A]">{state.made_records.length}</b> 回</span>
        <span>つくれる <b className="text-[13px] font-bold text-[#1A1A1A]">{cookbook.length}</b> 品</span>
        <span>連続 <b className="text-[13px] font-bold text-[#1A1A1A]">{weekStreak}</b> 週</span>
      </div>

      {groups.length ? <div className="mt-4">{groups.map((group) => <DiaryGroup key={group.label} label={group.label} records={group.records} dishById={dishById} />)}</div> : <p className="py-12 text-center text-[13px] text-[#7A7570]">まだ記録はありません。「作った」から一皿を残してみましょう。</p>}
      <span className="sr-only">記録した日数 {totalDays}</span>
    </section>
  )
}

function DiaryGroup({ label, records, dishById }: { label: string; records: ReturnType<typeof groupRecords>[number]['records']; dishById: Map<string, RankedDish> }) {
  return (
    <section className="mt-4 first:mt-0">
      <div className="flex items-center gap-[9px] pb-1"><h3 className="m-0 text-[13px] font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-heading)' }}>{label}</h3><span className="h-px flex-1 bg-[rgba(26,26,26,.1)]" /></div>
      {records.map((record, index) => {
        const dish = dishById.get(record.dish_id)
        const name = dish?.name ?? record.dish_id
        const specialty = dish?.rank === 'specialty'
        if (specialty) {
          return (
            <Link key={`${record.dish_id}-${record.made_at}-${index}`} href={`/dish/${record.dish_id}`} className="block border-b py-4" style={{ borderColor: 'rgba(26,26,26,.08)' }}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[8px]"><DishArt dish={name} seed={`${record.made_at}-${record.dish_id}`} radius={8} /><RankChip rank="specialty" className="absolute bottom-3 right-3" /></div>
              <div className="mt-3 text-[18px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'var(--font-heading)' }}>{name}</div>
              <p className="mt-1 text-[11.5px] text-[#7A7570]">通算 {dish.madeCount}回{record.memo ? `・${record.memo}` : ''}</p>
            </Link>
          )
        }
        return (
          <Link key={`${record.dish_id}-${record.made_at}-${index}`} href={`/dish/${record.dish_id}`} className="flex items-center gap-[14px] border-b py-[14px]" style={{ borderColor: 'rgba(26,26,26,.08)' }}>
            <CharTile name={name} size={60} radius={8} />
            <div className="min-w-0 flex-1"><div className="truncate text-[15px] font-bold text-[#1A1A1A]">{name}</div><p className="mt-[5px] text-[11.5px] text-[#7A7570]">通算 {dish?.madeCount ?? 1}回{record.memo ? `・${record.memo}` : ''}</p></div>
            {dish?.rank ? <RankChip rank={dish.rank} style={{ padding: '5px 9px', fontSize: 11 }} /> : null}
          </Link>
        )
      })}
    </section>
  )
}

function sortDishes(left: RankedDish, right: RankedDish) {
  const rankDifference = (right.rank ? RANK_ORDER[right.rank] : 0) - (left.rank ? RANK_ORDER[left.rank] : 0)
  return rankDifference || (right.lastMade ?? '').localeCompare(left.lastMade ?? '') || left.name.localeCompare(right.name, 'ja')
}

function groupRecords(records: ReturnType<typeof useUserState>['state']['made_records']) {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startWeek = new Date(startToday)
  startWeek.setDate(startToday.getDate() - ((startToday.getDay() + 6) % 7))
  const lastWeek = new Date(startWeek)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const groups = new Map<string, typeof records>([['今日', []], ['今週', []], ['先週', []]])

  for (const record of [...records].sort((a, b) => b.made_at.localeCompare(a.made_at))) {
    const made = new Date(record.made_at)
    const label = made >= startToday ? '今日' : made >= startWeek ? '今週' : made >= lastWeek ? '先週' : null
    if (label) groups.get(label)?.push(record)
  }
  return [...groups.entries()].flatMap(([label, grouped]) => grouped.length ? [{ label, records: grouped }] : [])
}

function countWeekStreak(records: ReturnType<typeof useUserState>['state']['made_records'], now: Date) {
  const weeks = new Set(records.map((record) => weekKey(new Date(record.made_at))))
  const cursor = new Date(now)
  let count = 0
  while (weeks.has(weekKey(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return count
}

function weekKey(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return monday.toISOString().slice(0, 10)
}
