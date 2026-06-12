'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import DishCard from '@/components/phase0/DishCard'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import Phase0BottomNav from '@/components/phase0/Phase0BottomNav'
import { trackEvent } from '@/lib/phase0/analytics'
import type { RecommendedDish } from '@/lib/phase0/recommendDishes'
import { useSavedDishes } from '@/lib/phase0/useSavedDishes'
import type { BaseDish } from '@/types/dish'

type DishCardListProps = {
  recommendations: RecommendedDish[]
  selectedDishes: BaseDish[]
}

export default function DishCardList({ recommendations, selectedDishes }: DishCardListProps) {
  const { savedDishes, isSaved, isMade, save, unsave, markMade, unmarkMade } = useSavedDishes()
  const [openRecommendation, setOpenRecommendation] = useState<RecommendedDish | null>(null)
  const [feedbackDishTitle, setFeedbackDishTitle] = useState<string | null>(null)
  const trackedRecommendations = useRef(false)
  const selectedNames = useMemo(() => selectedDishes.map((dish) => dish.title), [selectedDishes])

  useEffect(() => {
    if (trackedRecommendations.current) {
      return
    }

    trackedRecommendations.current = true
    trackEvent('show_recommendations', { count: selectedDishes.length })
  }, [selectedDishes.length])

  function toggleSave(dishId: string) {
    if (isSaved(dishId)) {
      unsave(dishId)
      setFeedbackDishTitle(null)
      return
    }

    save(dishId)
    trackEvent('click_want_to_make', { dishId })
    setFeedbackDishTitle(recommendations.find((recommendation) => recommendation.card.id === dishId)?.card.title ?? null)
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
            選び直す
          </Link>

          <div className="space-y-3">
            <p className="text-sm font-bold text-[#E8611A]">あなたに近い料理</p>
            <h1 className="text-3xl font-black leading-tight tracking-normal">
              これなら作れるかも、から選ぶ
            </h1>
            <p className="text-base leading-7 text-zinc-700">
              選んだ料理との差分が小さいものから並べています。
            </p>
          </div>

          {feedbackDishTitle ? (
            <div className="rounded-2xl border border-[#E8611A]/20 bg-[#E8611A]/10 p-4">
              <p className="text-sm font-bold leading-6 text-[#B9470F]">
                {feedbackDishTitle}を作ってみたいリストに追加しました。
              </p>
              <Link href="/saved" className="mt-2 inline-flex text-sm font-black text-[#B9470F] underline">
                リストを見る
              </Link>
            </div>
          ) : null}

          <div className="phase0-card rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-zinc-950">起点になる料理</h2>
              <p className="text-xs font-bold text-zinc-500">{selectedDishes.length}個</p>
            </div>
            {selectedNames.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedNames.map((name) => (
                  <span key={name} className="rounded-full bg-[#E8611A]/10 px-3 py-2 text-sm font-bold text-[#B9470F]">
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-500">選択された料理がありません。</p>
            )}
          </div>
        </header>

        {recommendations.length > 0 ? (
          <div className="mt-5 space-y-4">
            {recommendations.map((recommendation) => (
              <DishCard
                key={recommendation.card.id}
                recommendation={recommendation}
                isSaved={isSaved(recommendation.card.id)}
                onToggleSave={toggleSave}
                onOpenDetail={openDetail}
              />
            ))}
          </div>
        ) : (
          <div className="phase0-card mt-5 rounded-2xl p-5">
            <h2 className="text-xl font-black text-zinc-950">近い料理がまだ見つかりませんでした</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-700">
              別の作れる料理を選ぶと、候補が出てくるかもしれません。
            </p>
            <Link
              href="/select"
              className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-[#E8611A] px-4 text-sm font-black text-white"
            >
              選び直す
            </Link>
          </div>
        )}
      </section>

      {openRecommendation ? (
        <DishDetailModal
          recommendation={openRecommendation}
          isSaved={isSaved(openRecommendation.card.id)}
          isMade={isMade(openRecommendation.card.id)}
          showSaveFeedback={feedbackDishTitle === openRecommendation.card.title}
          onClose={() => setOpenRecommendation(null)}
          onToggleSave={toggleSave}
          onToggleMade={toggleMade}
        />
      ) : null}
      <Phase0BottomNav savedCount={savedDishes.length} />
    </main>
  )
}
