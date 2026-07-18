'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import DishArt from '@/components/mvp/DishArt'
import { dishes, relations } from '@/data/v3'
import { formatLastMade, rankForDish } from '@/lib/mvp/rank'
import { deriveShoppingList, shoppingDishesFromWeekSet, useShoppingList } from '@/lib/mvp/useShoppingList'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'
import { useWeekSet } from '@/lib/mvp/useWeekSet'

type DisplayDish = {
  id: string
  name: string
  isNew: boolean
  intro?: string
  missing?: string[]
  unlock?: string
}

export default function WeekSetScreen() {
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { state } = useUserState()
  const { customDishes } = useDishLibrary()
  const { dishIds, hasWeekSet, isDismissed, setWeekSet, replaceDish, clearWeekSet } = useWeekSet()
  const [openSwapId, setOpenSwapId] = useState<string | null>(null)
  const [showSetActions, setShowSetActions] = useState(false)
  const [draftRevision, setDraftRevision] = useState(0)
  const [addingItem, setAddingItem] = useState(false)
  const [draftItem, setDraftItem] = useState('')

  const knownIds = useMemo(
    () =>
      new Set([
        ...selectedBaseDishIds,
        ...state.selected_dishes,
        ...state.bookmarked,
        ...state.made_records.map((record) => record.dish_id),
        ...customDishes.map((dish) => dish.id),
      ]),
    [customDishes, selectedBaseDishIds, state.bookmarked, state.made_records, state.selected_dishes],
  )

  const draft = useMemo(() => buildDraft(knownIds, customDishes, state, draftRevision), [customDishes, draftRevision, knownIds, state])

  useEffect(() => {
    if (!hasWeekSet && !isDismissed && draft.length > 0) setWeekSet(draft.map((dish) => dish.id))
  }, [draft, hasWeekSet, isDismissed, setWeekSet])

  const activeIds = useMemo(
    () => hasWeekSet ? dishIds : isDismissed ? [] : draft.map((dish) => dish.id),
    [dishIds, draft, hasWeekSet, isDismissed],
  )
  const displayDishes = useMemo(() => {
    const draftById = new Map(draft.map((dish) => [dish.id, dish]))
    return activeIds.flatMap((id) => {
      const draftDish = draftById.get(id)
      if (draftDish) return [draftDish]
      const builtIn = dishes.find((dish) => dish.id === id)
      if (builtIn) return [{ id: builtIn.id, name: builtIn.name, isNew: false }]
      const custom = customDishes.find((dish) => dish.id === id)
      return custom ? [{ id: custom.id, name: custom.name, isNew: false }] : []
    })
  }, [activeIds, customDishes, draft])

  const candidatePool = useMemo(() => buildCandidatePool(knownIds, customDishes), [customDishes, knownIds])
  const shoppingDishes = useMemo(
    () => shoppingDishesFromWeekSet(activeIds, customDishes),
    [activeIds, customDishes],
  )
  const shopping = useShoppingList(shoppingDishes)

  const rebuildWeekSet = () => {
    const nextRevision = draftRevision + 1
    const nextDraft = buildDraft(knownIds, customDishes, state, nextRevision)
    setDraftRevision(nextRevision)
    setWeekSet(nextDraft.map((dish) => dish.id))
    shopping.clearChecks()
    setOpenSwapId(null)
    setShowSetActions(false)
  }

  const emptyWeekSet = () => {
    clearWeekSet()
    shopping.clearChecks()
    setOpenSwapId(null)
    setShowSetActions(false)
  }

  const commitItem = () => {
    const name = draftItem.trim()
    if (name) shopping.addItem(name)
    setDraftItem('')
    setAddingItem(false)
  }

  return (
    <main className="tn-screen flex min-h-dvh flex-col bg-white">
      <FlowHeader title="今週のセット" />

      <div className="flex-1 px-[22px] pb-5 pt-[2px]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] leading-[1.5]" style={{ color: '#7A7570' }}>{activeIds.length ? `${activeIds.length}皿を、順番を決めずに使えます。` : '今週のセットは空です。'}</p>
          <button type="button" onClick={() => setShowSetActions((current) => !current)} className="min-h-11 rounded-full px-3 text-[12px] font-bold" style={{ color: '#DE5528', background: '#FFF6F2' }}>{showSetActions ? '閉じる' : 'セットを編集'}</button>
        </div>
        {showSetActions ? <div className="mb-4 rounded-[12px] border bg-[#FBFAF8] p-3" style={{ borderColor: 'rgba(26,26,26,.10)' }}>
          <button type="button" onClick={rebuildWeekSet} className="flex min-h-12 w-full items-center justify-between rounded-[10px] bg-white px-3 text-left"><span><span className="block text-[13px] font-bold text-[#1A1A1A]">献立を組み直す</span><span className="mt-0.5 block text-[11px] text-[#7A7570]">履歴や保存料理は残したまま、5皿を選び直します</span></span><span className="text-[#DE5528]">↻</span></button>
          {shopping.checkedCount > 0 ? <button type="button" onClick={() => shopping.clearChecks()} className="mt-2 flex min-h-11 w-full items-center rounded-[10px] bg-white px-3 text-[12px] font-bold text-[#5A554F]">買い物チェックをすべて外す</button> : null}
          {activeIds.length ? <button type="button" onClick={emptyWeekSet} className="mt-2 flex min-h-11 w-full items-center rounded-[10px] px-3 text-[12px] font-bold text-[#7A7570]">今週のセットを空にする</button> : null}
        </div> : null}

        {!activeIds.length ? <section className="rounded-[14px] border border-dashed px-5 py-10 text-center" style={{ borderColor: 'rgba(26,26,26,.18)' }}><p className="text-[14px] font-bold text-[#1A1A1A]">今週のセットはまだありません</p><p className="mt-2 text-[12px] leading-[1.6] text-[#7A7570]">いつでも組み直せます。料理履歴や保存したレシピは消えません。</p><button type="button" onClick={rebuildWeekSet} className="mt-4 min-h-12 rounded-[10px] bg-[#DE5528] px-5 text-[14px] font-bold text-white">献立を作る</button></section> : null}

        <div className="border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.08)' }}>
          {displayDishes.map((dish) => {
            const rank = rankForDish(state.made_records, dish.id)
            const alternatives = candidatePool
              .filter((candidate) => candidate.id !== dish.id && !activeIds.includes(candidate.id))
              .map((candidate) => ({
                ...candidate,
                diff: ingredientDiff(
                  shoppingDishesFromWeekSet(activeIds.filter((id) => id !== dish.id), customDishes),
                  shoppingDishesFromWeekSet([...activeIds.filter((id) => id !== dish.id), candidate.id], customDishes),
                ),
              }))
              .sort((left, right) => left.diff - right.diff || left.name.localeCompare(right.name, 'ja'))
              .slice(0, 3)
            const isOpen = openSwapId === dish.id

            return (
              <div key={dish.id}>
                {dish.isNew ? (
                  <NewDishCard
                    dish={dish}
                    onToggleSwap={() => setOpenSwapId(isOpen ? null : dish.id)}
                  />
                ) : (
                  <NormalDishCard
                    dish={dish}
                    lastMade={formatLastMade(latestMadeFor(state.made_records, dish.id))}
                    rank={rank}
                    onToggleSwap={() => setOpenSwapId(isOpen ? null : dish.id)}
                  />
                )}

                {isOpen ? (
                  <div className="pb-4 pt-1">
                    <p className="mb-[9px] ml-[2px] text-[11.5px] font-bold" style={{ color: '#7A7570' }}>
                      ほかの候補
                    </p>
                    <div className="flex flex-col gap-2">
                      {alternatives.map((alternative) => (
                        <button
                          key={alternative.id}
                          type="button"
                          onClick={() => {
                            replaceDish(dish.id, alternative.id)
                            setOpenSwapId(null)
                          }}
                          className="flex w-full items-center gap-[11px] rounded-[10px] border bg-white p-[9px_11px] text-left"
                          style={{ borderColor: 'rgba(26, 26, 26, 0.1)' }}
                        >
                          <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[7px]" style={{ background: '#F2F2F2' }}>
                            <DishArt dish={alternative.name} seed={alternative.id} radius={7} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-bold" style={{ color: '#1A1A1A' }}>{alternative.name}</div>
                            <div className="mt-[2px] text-[11px]" style={{ color: '#7A7570' }}>{alternative.detail}</div>
                          </div>
                          <span className="shrink-0 text-[12px] font-bold" style={{ color: '#DE5528' }}>選ぶ</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {activeIds.length ? <section className="mt-[22px] border-t pt-[18px]" style={{ borderColor: 'rgba(26, 26, 26, 0.09)' }}>
          <div className="flex items-baseline gap-[7px]">
            <h2 className="text-[13.5px] font-bold" style={{ color: '#1A1A1A' }}>買うもの</h2>
            <span className="text-[13px]" style={{ color: '#7A7570' }}><b className="text-[15px]" style={{ color: '#DE5528' }}>{shopping.items.length}</b> 品</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {shopping.items.map((item) =>
              item.manual ? (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-[6px] rounded-[10px] border py-2 pl-3 pr-2 text-[13px] font-bold"
                  style={{ borderColor: '#F0D3B8', color: '#C25A20', background: '#FBEBDD' }}
                >
                  {item.name}
                  <button type="button" onClick={() => shopping.removeItem(item.id)} aria-label={`${item.name}を削除`} className="flex h-4 w-4 items-center justify-center">
                    <CloseIcon color="#C25A20" />
                  </button>
                </span>
              ) : (
                <span
                  key={item.id}
                  className="inline-flex items-baseline gap-[6px] rounded-[10px] border px-3 py-2 text-[13px] font-bold"
                  style={{ borderColor: 'rgba(26, 26, 26, 0.14)', color: '#1A1A1A', background: '#FFFFFF' }}
                >
                  {item.name}
                  {item.quantity ? <span className="text-[11px]" style={{ color: '#B7852F' }}>{item.quantity}</span> : null}
                </span>
              ),
            )}
            {addingItem ? (
              <span className="inline-flex items-center gap-[6px] rounded-[10px] border bg-white py-[5px] pl-3 pr-[6px]" style={{ borderColor: '#DE5528' }}>
                <input
                  autoFocus
                  value={draftItem}
                  onChange={(event) => setDraftItem(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitItem()
                    if (event.key === 'Escape') { setDraftItem(''); setAddingItem(false) }
                  }}
                  onBlur={commitItem}
                  placeholder="買うもの"
                  className="w-[88px] border-0 bg-transparent text-[13px] font-bold outline-none"
                  style={{ color: '#1A1A1A' }}
                />
                <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={commitItem} aria-label="追加" className="flex h-6 w-6 items-center justify-center rounded-[7px]" style={{ background: '#DE5528' }}>
                  <PlusIcon color="#FFFFFF" />
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAddingItem(true)}
                className="inline-flex items-center gap-[5px] rounded-[10px] border border-dashed px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: 'rgba(26, 26, 26, 0.28)', color: '#7A7570', background: '#FFFFFF' }}
              >
                <PlusIcon color="#7A7570" />追加
              </button>
            )}
          </div>
        </section> : null}
      </div>

      <div className="shrink-0 border-t bg-white px-[22px] pb-[30px] pt-[14px]" style={{ borderColor: 'rgba(26, 26, 26, 0.09)' }}>
        {activeIds.length ? <Link href="/shopping" className="flex w-full items-center justify-center gap-2 rounded-[12px] py-[15px] text-[15.5px] font-bold tracking-[.5px]" style={{ background: '#DE5528', color: '#FFFFFF', boxShadow: '0 6px 16px rgba(222, 85, 40, 0.28)' }}>
          このセットで買い物リストへ <ArrowRight color="#FFFFFF" />
        </Link> : <button type="button" onClick={rebuildWeekSet} className="flex min-h-12 w-full items-center justify-center rounded-[12px] text-[15px] font-bold text-white" style={{ background: '#DE5528' }}>献立を作る</button>}
      </div>
    </main>
  )
}

function FlowHeader({ title }: { title: string }) {
  return (
    <header className="shrink-0 bg-white px-[22px] pb-4 pt-[58px]">
      <div className="flex items-center gap-[10px]">
        <Link href="/home" aria-label="ホームへ戻る" className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]" style={{ background: '#DE5528' }}>
          <BackIcon color="#FFFFFF" />
        </Link>
        <h1 className="text-[16px] font-bold tracking-[.5px]" style={{ color: '#1A1A1A', fontFamily: 'var(--font-heading)' }}>{title}</h1>
      </div>
    </header>
  )
}

function NormalDishCard({ dish, lastMade, rank, onToggleSwap }: { dish: DisplayDish; lastMade: string; rank: ReturnType<typeof rankForDish>; onToggleSwap: () => void }) {
  return (
    <div className="flex items-center gap-[13px] border-b py-[15px]" style={{ borderColor: 'rgba(26, 26, 26, 0.08)' }}>
      <div className="w-[62px] shrink-0 overflow-hidden rounded-[8px] shadow-sm aspect-[4/3]" style={{ background: '#F2F2F2' }}>
        <DishArt dish={dish.name} seed={dish.id} radius={8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15.5px] font-bold" style={{ color: '#1A1A1A' }}>{dish.name}</div>
        <div className="mt-[5px] flex items-center gap-[7px]">
          {rank === 'regular' ? <span className="rounded-[20px] px-2 py-[2px] text-[10.5px] font-bold" style={{ color: '#8A5A16', background: '#F6ECD8' }}>定番</span> : null}
          <span className="text-[11.5px]" style={{ color: '#7A7570' }}>{lastMade}</span>
        </div>
      </div>
      <SwapButton onClick={onToggleSwap} />
    </div>
  )
}

function NewDishCard({ dish, onToggleSwap }: { dish: DisplayDish; onToggleSwap: () => void }) {
  return (
    <div className="my-[14px] rounded-[14px] border p-[15px_16px]" style={{ borderColor: 'rgba(26, 26, 26, 0.07)', background: '#FBF8F4' }}>
      <div className="flex items-center gap-[10px]">
        <span className="inline-flex items-center gap-[5px] rounded-[20px] px-[9px] py-1 text-[11px] font-bold" style={{ color: '#C25A20', background: '#FBEBDD' }}><span className="h-[6px] w-[6px] rounded-full" style={{ background: '#C25A20' }} />新しい一皿</span>
        <div className="ml-auto"><SwapButton onClick={onToggleSwap} compact /></div>
      </div>
      <div className="mt-[13px] flex items-start gap-[13px]">
        <div className="w-[86px] shrink-0 overflow-hidden rounded-[10px] shadow-sm aspect-[4/3]" style={{ background: '#F2F2F2' }}>
          <DishArt dish={dish.name} seed={dish.id} radius={10} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-bold leading-[1.3]" style={{ color: '#1A1A1A', fontFamily: 'var(--font-heading)' }}>{dish.name}</div>
          <p className="mt-[6px] text-[12.5px] leading-[1.65]" style={{ color: '#7A7570' }}>{dish.intro}</p>
        </div>
      </div>
      {dish.missing?.length ? (
        <div className="mt-[13px] flex flex-wrap items-center gap-[7px]">
          <span className="text-[11.5px] font-bold" style={{ color: '#5A554F' }}>新しく必要</span>
          {dish.missing.map((item) => <span key={item} className="inline-flex items-center gap-[3px] rounded-[8px] border px-[10px] py-[5px] text-[12px] font-bold" style={{ color: '#C25A20', borderColor: '#F0D3B8', background: '#FBEBDD' }}><span className="text-[13px]">＋</span>{item}</span>)}
        </div>
      ) : null}
      {dish.unlock ? <p className="mt-3 border-t pt-[11px] text-[11.5px] leading-[1.5]" style={{ color: '#7A7570', borderColor: 'rgba(26, 26, 26, 0.08)' }}>{dish.unlock}</p> : null}
    </div>
  )
}

function SwapButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  const size = compact ? 34 : 38
  return <button type="button" onClick={onClick} aria-label="入れ替え候補を開く" className="flex shrink-0 items-center justify-center rounded-full border bg-white" style={{ width: size, height: size, borderColor: 'rgba(26, 26, 26, 0.12)' }}><SwapIcon /></button>
}

function buildDraft(knownIds: Set<string>, customDishes: ReturnType<typeof useDishLibrary>['customDishes'], state: ReturnType<typeof useUserState>['state'], revision = 0) {
  const sourceIds = knownIds.size > 0 ? [...knownIds] : dishes.slice(0, 5).map((dish) => dish.id)
  const familiar = sourceIds.flatMap((id) => resolveDish(id, customDishes)).filter((dish): dish is DisplayDish => Boolean(dish))
  const byOldest = (left: DisplayDish, right: DisplayDish) => {
    const leftDate = latestMadeFor(state.made_records, left.id)
    const rightDate = latestMadeFor(state.made_records, right.id)
    return (toTime(leftDate) - toTime(rightDate)) || left.name.localeCompare(right.name, 'ja')
  }
  const regulars = familiar.filter((dish) => {
    const rank = rankForDish(state.made_records, dish.id)
    return rank === 'regular' || rank === 'specialty'
  }).sort(byOldest)
  const bookmarks = familiar.filter((dish) => state.bookmarked.includes(dish.id)).sort(byOldest)
  const normal = rotate(uniqueById([...regulars, ...bookmarks, ...familiar.sort(byOldest)]), revision)
  const bridges = rotate(relations
    .filter((relation) => sourceIds.includes(relation.source) && !knownIds.has(relation.target))
    .map((relation) => {
      const target = dishes.find((dish) => dish.id === relation.target)
      return target ? {
        id: target.id,
        name: target.name,
        isNew: true,
        intro: relation.description_line1,
        missing: relation.new_ingredients.slice(0, 2),
        unlock: relation.new_ingredients[0] ? `${relation.new_ingredients[0]}があれば、この先にも近い一皿がひろがります。` : undefined,
      } : null
    })
    .filter((dish): dish is NonNullable<typeof dish> => Boolean(dish)), revision)

  const bridgeCount = normal.length < 4 ? Math.min(2, 5 - normal.length, bridges.length) : Math.min(1, bridges.length)
  const selectedBridges = bridges.slice(0, bridgeCount)

  const first = normal.slice(0, selectedBridges.length ? 2 : 5)
  const rest = normal.filter((dish) => !first.some((picked) => picked.id === dish.id))
  return uniqueById([...first, ...selectedBridges, ...rest]).slice(0, 5)
}

function buildCandidatePool(knownIds: Set<string>, customDishes: ReturnType<typeof useDishLibrary>['customDishes']) {
  const known = [...knownIds].flatMap((id) => resolveDish(id, customDishes)).filter((dish): dish is DisplayDish => Boolean(dish))
  const bridges = relations
    .filter((relation) => knownIds.has(relation.source))
    .map((relation) => resolveDish(relation.target, customDishes))
    .filter((dish): dish is DisplayDish => Boolean(dish))
  return uniqueById<DisplayDish>([...known, ...bridges]).map((dish) => ({ ...dish, detail: dish.isNew ? '新しい一皿' : 'あなたのレパートリー' }))
}

function resolveDish(id: string, customDishes: ReturnType<typeof useDishLibrary>['customDishes']) {
  const builtIn = dishes.find((dish) => dish.id === id)
  if (builtIn) return { id: builtIn.id, name: builtIn.name, isNew: false }
  const custom = customDishes.find((dish) => dish.id === id)
  return custom ? { id: custom.id, name: custom.name, isNew: false } : null
}

function uniqueById<T extends { id: string }>(items: readonly T[]) {
  return items.filter((item, index) => items.findIndex((candidate) => candidate.id === item.id) === index)
}

function rotate<T>(items: readonly T[], offset: number) {
  if (!items.length) return []
  const start = Math.abs(offset) % items.length
  return [...items.slice(start), ...items.slice(0, start)]
}

function ingredientDiff(base: ReturnType<typeof shoppingDishesFromWeekSet>, candidate: ReturnType<typeof shoppingDishesFromWeekSet>) {
  const baseItems = new Set(deriveShoppingList(base).map((item) => item.id))
  const candidateItems = new Set(deriveShoppingList(candidate).map((item) => item.id))
  return [...baseItems].filter((item) => !candidateItems.has(item)).length + [...candidateItems].filter((item) => !baseItems.has(item)).length
}

function latestMadeFor(records: ReturnType<typeof useUserState>['state']['made_records'], dishId: string) {
  return records.filter((record) => record.dish_id === dishId).map((record) => record.made_at).sort((left, right) => right.localeCompare(left))[0]
}

function toTime(value: string | undefined) {
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function BackIcon({ color }: { color: string }) { return <svg aria-hidden="true" width="12" height="18" viewBox="0 0 12 20" fill="none"><path d="m10 2-8 8 8 8" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function ArrowRight({ color }: { color: string }) { return <svg aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 10h11m-4-5 5 5-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function SwapIcon() { return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4.5 9a7.5 7.5 0 0 1 12.4-3.2L20 8.5M19.5 15a7.5 7.5 0 0 1-12.4 3.2L4 15.5M20 4v4.5h-4.5M4 20v-4.5h4.5" stroke="#7A7570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function PlusIcon({ color }: { color: string }) { return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg> }
function CloseIcon({ color }: { color: string }) { return <svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m2 2 8 8m0-8-8 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></svg> }
