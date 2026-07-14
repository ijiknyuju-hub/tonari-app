'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { dishes } from '@/data/v3'
import { deriveShoppingList, shoppingDishesFromWeekSet, useShoppingList } from '@/lib/mvp/useShoppingList'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'
import { useWeekSet } from '@/lib/mvp/useWeekSet'

type GroupId = 'meat' | 'vegetables' | 'other'

const GROUPS: Readonly<Record<GroupId, { label: string; dot: string; foreground: string; background: string }>> = {
  meat: { label: '肉・魚', dot: '#DE5528', foreground: '#C15436', background: '#FBEBDD' },
  vegetables: { label: '野菜', dot: '#D3A051', foreground: '#8A5A16', background: '#F6ECD8' },
  other: { label: 'その他・調味料', dot: '#C7C1BA', foreground: '#7A7570', background: '#F1EEEA' },
}

export default function ShoppingListScreen() {
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { state } = useUserState()
  const { customDishes } = useDishLibrary()
  const { dishIds, hasWeekSet, replaceDish } = useWeekSet()
  const [openDishId, setOpenDishId] = useState<string | null>(null)

  const weekDishes = useMemo(() => shoppingDishesFromWeekSet(dishIds, customDishes), [customDishes, dishIds])
  const shopping = useShoppingList(weekDishes)
  const weekEntries = useMemo(
    () => dishIds.flatMap((id) => resolveDish(id, customDishes)),
    [customDishes, dishIds],
  )
  const repertoireIds = useMemo(
    () => new Set([...selectedBaseDishIds, ...state.selected_dishes, ...state.bookmarked, ...state.made_records.map((record) => record.dish_id), ...customDishes.map((dish) => dish.id)]),
    [customDishes, selectedBaseDishIds, state.bookmarked, state.made_records, state.selected_dishes],
  )
  const groups = useMemo(() => groupShoppingItems(shopping.items), [shopping.items])
  const allDone = shopping.items.length > 0 && shopping.remainingCount === 0
  const progress = shopping.items.length ? Math.round((shopping.checkedCount / shopping.items.length) * 100) : 0

  if (!hasWeekSet) {
    return (
      <main className="tn-screen flex min-h-dvh flex-col bg-white">
        <ShoppingHeader />
        <div className="flex flex-1 flex-col items-center justify-center px-[22px] text-center">
          <p className="text-[15px] font-bold" style={{ color: '#7A7570' }}>先に今週のセットを組みましょう</p>
          <Link href="/weekset" className="mt-4 rounded-[10px] px-4 py-3 text-[14px] font-bold" style={{ color: '#FFFFFF', background: '#DE5528' }}>今週のセットへ</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="tn-screen flex min-h-dvh flex-col bg-white">
      <ShoppingHeader>
        <div className="mt-[13px] flex gap-[7px] overflow-x-auto pb-[2px] [scrollbar-width:none]">
          {weekEntries.map((dish) => {
            const open = dish.id === openDishId
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => setOpenDishId(open ? null : dish.id)}
                className="shrink-0 rounded-[9px] px-[13px] py-[7px] text-[12.5px] font-bold"
                style={{ color: open ? '#FFFFFF' : '#5A554F', background: open ? '#DE5528' : '#FFFFFF', border: open ? '1px solid #DE5528' : '1px solid rgba(26, 26, 26, 0.14)' }}
              >
                {dish.name}
              </button>
            )
          })}
        </div>
        {openDishId ? (
          <SwapPanel
            dishId={openDishId}
            weekDishIds={dishIds}
            repertoireIds={repertoireIds}
            customDishes={customDishes}
            onClose={() => setOpenDishId(null)}
            onPick={(replacementId) => {
              replaceDish(openDishId, replacementId)
              setOpenDishId(null)
            }}
          />
        ) : null}
      </ShoppingHeader>

      <div className="flex-1 overflow-auto bg-[#FBFAF8] px-[22px] pb-[18px] pt-2">
        {groups.map((group) => (
          <section key={group.id} className="mt-[18px]">
            <div className="flex items-center gap-2 px-[2px]">
              <span className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: group.style.dot }} />
              <h2 className="text-[13.5px] font-bold" style={{ color: '#1A1A1A', fontFamily: 'var(--font-heading)' }}>{group.style.label}</h2>
              <span className="rounded-[20px] px-[9px] py-[2px] text-[11px] font-bold" style={{ color: group.style.foreground, background: group.style.background }}>{group.items.length}品</span>
            </div>
            <div className="mt-[9px] overflow-hidden rounded-[14px] border bg-white" style={{ borderColor: 'rgba(26, 26, 26, 0.08)' }}>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => shopping.toggleChecked(item.id)}
                  className="flex w-full items-center gap-[13px] border-b px-[15px] py-[13px] text-left last:border-b-0"
                  style={{ borderColor: 'rgba(26, 26, 26, 0.06)', background: item.checked ? '#FBF8F4' : '#FFFFFF' }}
                >
                  <CheckCircle checked={item.checked} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] font-bold leading-[1.2]" style={{ color: item.checked ? '#B7B2AC' : '#1A1A1A', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
                    <span className="mt-[3px] block text-[11px]" style={{ color: '#B7B2AC' }}>{item.sourceDishNames.length ? item.sourceDishNames.join('・') : '追加したもの'}</span>
                  </span>
                  {item.quantity ? <span className="shrink-0 text-[14px] font-extrabold" style={{ color: item.checked ? '#C7C1BA' : '#5A554F' }}>{item.quantity}</span> : null}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="shrink-0 border-t bg-white px-[22px] pb-[30px] pt-[14px]" style={{ borderColor: 'rgba(26, 26, 26, 0.09)' }}>
        {allDone ? (
          <div className="flex items-center justify-center gap-2 text-[14px] font-bold" style={{ color: '#3B8D4E' }}><DoneIcon />ぜんぶ買えました</div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-[20px]" style={{ background: '#EFEAE4' }}><div className="h-full rounded-[20px] transition-[width] duration-300" style={{ width: `${progress}%`, background: '#DE5528' }} /></div>
            <span className="whitespace-nowrap text-[12.5px]" style={{ color: '#7A7570' }}>のこり <b className="text-[15px]" style={{ color: '#1A1A1A' }}>{shopping.remainingCount}</b> 品</span>
          </div>
        )}
      </footer>
    </main>
  )
}

function ShoppingHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="shrink-0 border-b bg-white px-[22px] pb-[14px] pt-[58px]" style={{ borderColor: 'rgba(26, 26, 26, 0.09)' }}>
      <div className="flex items-center gap-[10px]">
        <Link href="/home" aria-label="ホームへ戻る" className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]" style={{ background: '#DE5528' }}><BackIcon /></Link>
        <h1 className="text-[16px] font-bold tracking-[.5px]" style={{ color: '#1A1A1A', fontFamily: 'var(--font-heading)' }}>買い物リスト</h1>
      </div>
      {children}
    </header>
  )
}

function SwapPanel({ dishId, weekDishIds, repertoireIds, customDishes, onClose, onPick }: { dishId: string; weekDishIds: readonly string[]; repertoireIds: Set<string>; customDishes: ReturnType<typeof useDishLibrary>['customDishes']; onClose: () => void; onPick: (dishId: string) => void }) {
  const current = resolveDish(dishId, customDishes)[0]
  const alternatives = useMemo(() => {
    const candidates = [...repertoireIds]
      .filter((candidateId) => !weekDishIds.includes(candidateId))
      .flatMap((candidateId) => resolveDish(candidateId, customDishes))
      .map((candidate) => ({
        ...candidate,
        diff: ingredientDiff(
          shoppingDishesFromWeekSet(weekDishIds.filter((id) => id !== dishId), customDishes),
          shoppingDishesFromWeekSet([...weekDishIds.filter((id) => id !== dishId), candidate.id], customDishes),
        ),
      }))
      .sort((left, right) => left.diff - right.diff || left.name.localeCompare(right.name, 'ja'))
    return candidates.slice(0, 3)
  }, [customDishes, dishId, repertoireIds, weekDishIds])

  return (
    <div className="mt-[13px] rounded-[12px] border bg-white p-[14px]" style={{ borderColor: 'rgba(26, 26, 26, 0.12)' }}>
      <div className="flex items-center gap-2"><span className="text-[13.5px] font-bold" style={{ color: '#1A1A1A' }}>{current?.name ?? 'この料理'} をやめる</span><button type="button" onClick={onClose} aria-label="閉じる" className="ml-auto flex h-[26px] w-[26px] items-center justify-center rounded-full text-[18px]" style={{ color: '#B7B2AC' }}>×</button></div>
      <p className="mt-[5px] text-[11.5px] leading-[1.5]" style={{ color: '#7A7570' }}>買うものの差分が小さい候補です</p>
      <div className="mt-3 flex flex-col gap-2">
        {alternatives.map((alternative) => (
          <button key={alternative.id} type="button" onClick={() => onPick(alternative.id)} className="flex w-full items-center gap-[10px] rounded-[10px] border bg-white p-[11px_12px] text-left" style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}>
            <span className="min-w-0 flex-1 text-[14px] font-bold" style={{ color: '#1A1A1A' }}>{alternative.name}</span>
            <span className="shrink-0 text-[12px] font-bold" style={{ color: '#DE5528' }}>これにする</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function groupShoppingItems(items: ReturnType<typeof useShoppingList>['items']) {
  const values = (Object.keys(GROUPS) as GroupId[]).map((id) => ({ id, style: GROUPS[id], items: items.filter((item) => ingredientGroup(item.name) === id) }))
  return values.filter((group) => group.items.length > 0)
}

function ingredientGroup(name: string): GroupId {
  if (/(肉|鶏|豚|牛|鮭|魚|ぶり|えび|ひき肉|ウインナー)/.test(name)) return 'meat'
  if (/(玉ねぎ|ねぎ|キャベツ|じゃがいも|にんじん|ごぼう|大根|ニラ|バジル|ピーマン|レモン|三つ葉|野菜)/.test(name)) return 'vegetables'
  return 'other'
}

function ingredientDiff(base: ReturnType<typeof shoppingDishesFromWeekSet>, candidate: ReturnType<typeof shoppingDishesFromWeekSet>) {
  const baseItems = new Set(deriveShoppingList(base).map((item) => item.id))
  const candidateItems = new Set(deriveShoppingList(candidate).map((item) => item.id))
  return [...baseItems].filter((item) => !candidateItems.has(item)).length + [...candidateItems].filter((item) => !baseItems.has(item)).length
}

function resolveDish(id: string, customDishes: ReturnType<typeof useDishLibrary>['customDishes']) {
  const builtIn = dishes.find((dish) => dish.id === id)
  if (builtIn) return [{ id: builtIn.id, name: builtIn.name }]
  const custom = customDishes.find((dish) => dish.id === id)
  return custom ? [{ id: custom.id, name: custom.name }] : []
}

function CheckCircle({ checked }: { checked: boolean }) { return checked ? <span className="flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full" style={{ background: '#DE5528' }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="m2 7 3 3 6-7" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span> : <span className="h-[23px] w-[23px] shrink-0 rounded-full border-[1.6px]" style={{ borderColor: '#C7C1BA' }} /> }
function BackIcon() { return <svg aria-hidden="true" width="12" height="18" viewBox="0 0 12 20" fill="none"><path d="m10 2-8 8 8 8" stroke="#FFFFFF" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function DoneIcon() { return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#3B8D4E" /><path d="m5.5 10.5 3 3 6-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> }
