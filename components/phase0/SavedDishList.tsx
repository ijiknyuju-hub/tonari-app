'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { baseDishes } from '@/data/baseDishes'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import { recommendDishes, type RecommendedDish } from '@/lib/phase0/recommendDishes'
import { useSavedDishes } from '@/lib/phase0/useSavedDishes'

export default function SavedDishList() {
  const { savedDishes, isSaved, save, unsave } = useSavedDishes()
  const [openRecommendation, setOpenRecommendation] = useState<RecommendedDish | null>(null)

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

  function toggleSave(dishId: string) {
    if (isSaved(dishId)) {
      unsave(dishId)
      if (openRecommendation?.card.id === dishId) {
        setOpenRecommendation(null)
      }
      return
    }

    save(dishId)
  }

  return (
    <main className="min-h-screen bg-[#F7F8F5] text-zinc-950">
      <section className="mx-auto w-full max-w-md px-5 pb-8 pt-6">
        <header className="space-y-5">
          <Link href="/select" className="inline-flex text-sm font-bold text-zinc-500 transition hover:text-[#E8611A]">
            料理を選ぶ
          </Link>

          <div className="space-y-3">
            <p className="text-sm font-bold text-[#E8611A]">作ってみたいリスト</p>
            <h1 className="text-3xl font-black leading-tight tracking-normal">あとで作りたい料理</h1>
            <p className="text-base leading-7 text-zinc-700">
              気になった料理をここに残しておけます。
            </p>
          </div>
        </header>

        {savedRecommendations.length > 0 ? (
          <div className="mt-5 space-y-3">
            {savedRecommendations.map((recommendation) => (
              <article
                key={recommendation.card.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#E8611A]">
                      {recommendation.closestBaseDishTitle}が作れるなら近い
                    </p>
                    <h2 className="mt-1 text-xl font-black leading-tight tracking-normal">
                      {recommendation.card.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      保存日: {formatSavedAt(savedDishes.find((dish) => dish.dishId === recommendation.card.id)?.savedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#E8611A]/10 px-3 py-2 text-xs font-black text-[#B9470F]">
                    {recommendation.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenRecommendation(recommendation)}
                    className="min-h-12 rounded-2xl bg-[#E8611A] px-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(232,97,26,0.22)]"
                  >
                    詳しく見る
                  </button>
                  <button
                    type="button"
                    onClick={() => unsave(recommendation.card.id)}
                    className="min-h-12 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-black text-zinc-800"
                  >
                    保存を外す
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-zinc-950">まだ保存した料理はありません。</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-700">
              気になる料理カードで「作ってみたい」を押してみてください。
            </p>
            <Link
              href="/select"
              className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-[#E8611A] px-4 text-sm font-black text-white"
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
          onClose={() => setOpenRecommendation(null)}
          onToggleSave={toggleSave}
        />
      ) : null}
    </main>
  )
}

function formatSavedAt(savedAt?: string): string {
  if (!savedAt) {
    return '-'
  }

  const date = new Date(savedAt)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}
