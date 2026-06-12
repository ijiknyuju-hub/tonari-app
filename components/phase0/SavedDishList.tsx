'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { baseDishes } from '@/data/baseDishes'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import Phase0BottomNav from '@/components/phase0/Phase0BottomNav'
import { trackEvent } from '@/lib/phase0/analytics'
import { recommendDishes, type RecommendedDish } from '@/lib/phase0/recommendDishes'
import { useSavedDishes } from '@/lib/phase0/useSavedDishes'

export default function SavedDishList() {
  const { savedDishes, isSaved, isMade, save, unsave, markMade, unmarkMade } = useSavedDishes()
  const [openRecommendation, setOpenRecommendation] = useState<RecommendedDish | null>(null)
  const trackedSavedList = useRef(false)

  const savedRecommendations = useMemo(() => {
    const savedOrder = new Map(savedDishes.map((dish, index) => [dish.dishId, index]))
    return recommendDishes(baseDishes.map((dish) => dish.id))
      .filter((recommendation) => savedOrder.has(recommendation.card.id))
      .sort(
        (a, b) =>
          (savedOrder.get(a.card.id) ?? Number.MAX_SAFE_INTEGER) -
          (savedOrder.get(b.card.id) ?? Number.MAX_SAFE_INTEGER),
      )
  }, [savedDishes])

  useEffect(() => {
    if (trackedSavedList.current) {
      return
    }

    trackedSavedList.current = true
    trackEvent('open_saved_list')
  }, [])

  function toggleSave(dishId: string) {
    if (isSaved(dishId)) {
      unsave(dishId)
      if (openRecommendation?.card.id === dishId) {
        setOpenRecommendation(null)
      }
      return
    }

    save(dishId)
    trackEvent('click_want_to_make', { dishId })
  }

  function toggleMade(dishId: string) {
    if (isMade(dishId)) {
      unmarkMade(dishId)
      return
    }

    markMade(dishId)
    trackEvent('mark_made', { dishId })
  }

  function openDetail(recommendation: RecommendedDish) {
    trackEvent('open_dish_card', { dishId: recommendation.card.id })
    setOpenRecommendation(recommendation)
  }

  return (
    <main className="phase0-screen">
      <section className="phase0-container phase0-bottom-safe pt-5">
        <header className="space-y-5">
          <Link href="/select" className="inline-flex text-sm font-bold text-zinc-500 transition hover:text-[#E8611A]">
            料理を選ぶ
          </Link>

          <div className="space-y-3">
            <p className="text-sm font-bold text-[#E8611A]">作ってみたいリスト</p>
            <h1 className="text-3xl font-black leading-tight tracking-normal">あとで作りたい料理</h1>
            <p className="text-base leading-7 text-zinc-700">
              気になった料理をここに残しておけます。作った料理は記録しておきましょう。
            </p>
          </div>
        </header>

        {savedRecommendations.length > 0 ? (
          <div className="mt-5 space-y-3">
            {savedRecommendations.map((recommendation) => {
              const savedDish = savedDishes.find((dish) => dish.dishId === recommendation.card.id)

              return (
                <article key={recommendation.card.id} className="phase0-card rounded-3xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 rounded-full bg-[#E8611A]/10 px-3 py-2 text-xs font-black text-[#B9470F]">
                      {recommendation.label}
                    </span>
                    <div className="text-right">
                      {isMade(recommendation.card.id) ? (
                        <span className="inline-flex rounded-full bg-[#FFF3EC] px-3 py-1 text-xs font-black text-[#B9470F]">
                          作った済み
                        </span>
                      ) : null}
                      <p className="mt-1 text-sm leading-6 text-zinc-600">保存日: {formatDate(savedDish?.savedAt)}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#FFF3EC] p-4">
                    <p className="text-lg font-black leading-7 text-[#B9470F]">
                      {recommendation.closestBaseDishTitle}が作れるなら近い
                    </p>
                  </div>
                  <h2 className="mt-3 text-xl font-black leading-tight tracking-normal">
                    {recommendation.card.title}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => openDetail(recommendation)}
                      className="min-h-14 rounded-2xl bg-[#E8611A] px-3 text-base font-black text-white shadow-[0_10px_22px_rgba(232,97,26,0.22)]"
                    >
                      詳しく見る
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMade(recommendation.card.id)}
                      className="min-h-14 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-black text-zinc-800"
                    >
                      {isMade(recommendation.card.id) ? '作ったを外す' : '作った'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => unsave(recommendation.card.id)}
                    className="mt-3 text-sm font-black text-zinc-500 underline"
                  >
                    保存を外す
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="phase0-card mt-5 rounded-2xl p-5">
            <h2 className="text-xl font-black text-zinc-950">まだ保存した料理はありません。</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-700">
              気になる料理カードで「作ってみたい」を押してみてください。
            </p>
            <Link
              href="/select"
              className="phase0-primary-button mt-5 flex items-center justify-center px-4 text-base font-black"
            >
              料理を選ぶ
            </Link>
          </div>
        )}
      </section>

      {openRecommendation ? (
        <DishDetailModal
          recommendation={openRecommendation}
          isSaved={isSaved(openRecommendation.card.id)}
          isMade={isMade(openRecommendation.card.id)}
          onClose={() => setOpenRecommendation(null)}
          onToggleSave={toggleSave}
          onToggleMade={toggleMade}
        />
      ) : null}
      <Phase0BottomNav savedCount={savedDishes.length} />
    </main>
  )
}

function formatDate(value?: string): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
