'use client'

import { useMemo, useState } from 'react'
import BottomNav from '@/components/mvp/BottomNav'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import { baseDishes } from '@/data/baseDishes'
import { allIngredients, almostMakeable, dishesByIngredients } from '@/lib/mvp/ingredientIndex'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { trackEvent } from '@/lib/phase0/analytics'
import type { RecommendedDish } from '@/lib/phase0/recommendDishes'
import { useSavedDishes } from '@/lib/phase0/useSavedDishes'
import type { DishCard } from '@/types/dish'

type TabId = 'made' | 'saved' | 'challenge'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'made', label: '作ったことがある' },
  { id: 'saved', label: '作りたいリスト' },
  { id: 'challenge', label: 'チャレンジしてみたい' },
]

export default function IngredientsSearch() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<TabId>('made')
  const [openRecommendation, setOpenRecommendation] = useState<RecommendedDish | null>(null)
  const [showSaveFeedbackFor, setShowSaveFeedbackFor] = useState<string | null>(null)
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { isSaved, isMade, save, unsave, markMade, unmarkMade } = useSavedDishes()

  const frequentIngredients = useMemo(() => allIngredients().slice(0, 8), [])
  const matchingCards = useMemo(() => dishesByIngredients(selectedIngredients), [selectedIngredients])
  const almostCards = useMemo(() => almostMakeable(selectedIngredients).slice(0, 3), [selectedIngredients])
  const baseDishSet = useMemo(() => new Set(selectedBaseDishIds), [selectedBaseDishIds])

  const groups = useMemo(() => {
    const made: DishCard[] = []
    const saved: DishCard[] = []
    const challenge: DishCard[] = []

    matchingCards.forEach((card) => {
      if (isMade(card.id) || card.baseDishIds.some((id) => baseDishSet.has(id))) {
        made.push(card)
      } else if (isSaved(card.id)) {
        saved.push(card)
      } else {
        challenge.push(card)
      }
    })

    return { made, saved, challenge }
  }, [baseDishSet, isMade, isSaved, matchingCards])

  const activeCards = groups[activeTab]

  function toggleIngredient(ingredient: string) {
    setSelectedIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  function toggleSave(dishId: string) {
    if (isSaved(dishId)) {
      unsave(dishId)
      setShowSaveFeedbackFor(null)
      return
    }

    save(dishId)
    trackEvent('click_want_to_make', { dishId })
    setShowSaveFeedbackFor(dishId)
  }

  function toggleMade(dishId: string) {
    if (isMade(dishId)) {
      unmarkMade(dishId)
      return
    }

    markMade(dishId)
  }

  function openDetail(card: DishCard) {
    trackEvent('open_dish_card', { dishId: card.id })
    setOpenRecommendation(toRecommendation(card))
  }

  return (
    <main className="tn-screen">
      <section className="tn-container tn-bottom-safe pt-5">
        <header className="flex items-center justify-center">
          <p className="text-2xl font-black tracking-normal">となりごはん</p>
        </header>

        <section className="mt-6">
          <h1 className="text-2xl font-black tracking-normal">食材から探す</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-[var(--tn-text-sub)]">
            冷蔵庫にある食材から、作れる料理を見つけよう
          </p>
        </section>

        <section className="mt-7">
          <h2 className="text-base font-black">最近よく使う食材</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {frequentIngredients.map((ingredient) => {
              const selected = selectedIngredients.includes(ingredient)

              return (
                <button
                  key={ingredient}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleIngredient(ingredient)}
                  className={[
                    'min-h-12 shrink-0 rounded-2xl border bg-white px-4 text-sm font-black shadow-[var(--tn-shadow-soft)]',
                    selected
                      ? 'border-[var(--tn-accent)] bg-[var(--tn-accent-soft)] text-[var(--tn-accent)]'
                      : 'border-[var(--tn-border)]',
                  ].join(' ')}
                >
                  {ingredient}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-5 rounded-2xl bg-[var(--tn-surface-soft)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black">選択中の食材</h2>
            <button
              type="button"
              onClick={() => setSelectedIngredients([])}
              className="text-xs font-extrabold text-[var(--tn-text-sub)]"
            >
              クリア
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <button
                key={ingredient}
                type="button"
                onClick={() => toggleIngredient(ingredient)}
                className="min-h-10 rounded-full border border-[var(--tn-border)] bg-white px-4 text-sm font-black"
              >
                {ingredient} ×
              </button>
            ))}
            <span className="flex min-h-10 items-center rounded-full border border-dashed border-[var(--tn-border)] bg-white px-4 text-sm font-black text-[var(--tn-text-sub)]">
              ＋ 追加
            </span>
          </div>
        </section>

        <section className="tn-card mt-6 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-[var(--tn-border)] bg-white">
            {TABS.map((tab) => {
              const active = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'min-h-14 px-2 text-xs font-black',
                    active
                      ? 'border-b-2 border-[var(--tn-accent)] text-[var(--tn-accent)]'
                      : 'text-[var(--tn-text)]',
                  ].join(' ')}
                >
                  {tab.label}
                  <span className="ml-1 rounded-full bg-[var(--tn-surface-soft)] px-2 py-0.5 text-[11px] text-[var(--tn-text)]">
                    {groups[tab.id].length}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="p-4">
            {activeTab === 'made' ? (
              <p className="mb-4 text-sm font-bold leading-6 text-[var(--tn-text-sub)]">
                あなたが作ったことがある料理を、食材に合わせて表示しています
              </p>
            ) : null}

            {activeCards.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {activeCards.map((card) => (
                  <ResultCard
                    key={card.id}
                    card={card}
                    isSaved={isSaved(card.id)}
                    onOpenDetail={openDetail}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-[var(--tn-surface-soft)] p-4 text-sm font-bold leading-6 text-[var(--tn-text-sub)]">
                この食材で表示できる料理がまだありません
              </p>
            )}
          </div>
        </section>

        {almostCards.length > 0 ? (
          <section className="mt-5 rounded-2xl border border-[#f4d994] bg-[#fff7dd] p-4">
            <h2 className="text-base font-black">もう少し食材を足すと、こんな料理も作れます</h2>
            <div className="mt-3 space-y-2">
              {almostCards.map((item) => (
                <button
                  key={item.card.id}
                  type="button"
                  onClick={() => openDetail(item.card)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-2 text-left"
                >
                  <div className="tn-surface-soft h-14 w-16 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{item.card.title}</span>
                    <span className="mt-1 block text-xs font-bold text-[var(--tn-text-sub)]">
                      ＋{item.missing.join('、')}
                    </span>
                  </span>
                  <span className="text-lg font-black text-[var(--tn-text-sub)]">›</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      {openRecommendation ? (
        <DishDetailModal
          recommendation={openRecommendation}
          isSaved={isSaved(openRecommendation.card.id)}
          isMade={isMade(openRecommendation.card.id)}
          showSaveFeedback={showSaveFeedbackFor === openRecommendation.card.id}
          onClose={() => setOpenRecommendation(null)}
          onToggleSave={toggleSave}
          onToggleMade={toggleMade}
        />
      ) : null}
      <BottomNav />
    </main>
  )
}

function ResultCard({
  card,
  isSaved,
  onOpenDetail,
  onToggleSave,
}: {
  card: DishCard
  isSaved: boolean
  onOpenDetail: (card: DishCard) => void
  onToggleSave: (dishId: string) => void
}) {
  const mode = modeForDifficulty(card.difficulty)

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--tn-border)] bg-white shadow-[var(--tn-shadow-soft)]">
      <div className="relative">
        <button type="button" onClick={() => onOpenDetail(card)} className="block w-full">
          <div className="tn-surface-soft flex aspect-[4/3] items-center justify-center rounded-none text-4xl">
            🍳
          </div>
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(card.id)}
          aria-label={isSaved ? `${card.title}を保存から外す` : `${card.title}を保存する`}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-black text-[var(--tn-accent)] shadow"
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>
      <div className="p-3">
        <button type="button" onClick={() => onOpenDetail(card)} className="block w-full text-left">
          <h3 className="text-base font-black leading-6">{card.title}</h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[var(--tn-text-sub)]">
            {card.shortCopy}
          </p>
        </button>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span className={`tn-tag ${mode.tagClass}`}>{mode.label}</span>
            <span className="tn-tag bg-[var(--tn-surface-soft)] text-[var(--tn-text-sub)]">
              工程：{card.roughSteps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenDetail(card)}
            aria-label={`${card.title}の詳細を見る`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--tn-accent)] text-lg font-black text-[var(--tn-accent)]"
          >
            ›
          </button>
        </div>
      </div>
    </article>
  )
}

function toRecommendation(card: DishCard): RecommendedDish {
  const closestBaseDishId = card.baseDishIds[0] ?? ''

  return {
    card,
    label: card.difficulty === 1 ? 'かなり近い' : card.difficulty === 2 ? '少し変えれば作れる' : 'ちょっと挑戦',
    closestBaseDishId,
    closestBaseDishTitle: baseDishes.find((dish) => dish.id === closestBaseDishId)?.title ?? 'いつもの料理',
    score: 0,
    matchCount: 1,
  }
}

function modeForDifficulty(difficulty: 1 | 2 | 3) {
  if (difficulty === 1) return { label: 'かんたん', tagClass: 'tn-tag-easy' }
  if (difficulty === 2) return { label: 'ふつう', tagClass: 'tn-tag-stretch' }
  return { label: 'しっかり', tagClass: 'tn-tag-full' }
}
