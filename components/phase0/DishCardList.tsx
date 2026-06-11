'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import DishCard from '@/components/phase0/DishCard'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import type { RecommendedDish } from '@/lib/phase0/recommendDishes'
import type { BaseDish } from '@/types/dish'

type DishCardListProps = {
  recommendations: RecommendedDish[]
  selectedDishes: BaseDish[]
}

export default function DishCardList({ recommendations, selectedDishes }: DishCardListProps) {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [openRecommendation, setOpenRecommendation] = useState<RecommendedDish | null>(null)
  const selectedNames = useMemo(() => selectedDishes.map((dish) => dish.title), [selectedDishes])

  function toggleSave(dishId: string) {
    setSavedIds((current) =>
      current.includes(dishId) ? current.filter((id) => id !== dishId) : [...current, dishId],
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F8F5] text-zinc-950">
      <section className="mx-auto w-full max-w-md px-5 pb-8 pt-6">
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

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
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
                isSaved={savedIds.includes(recommendation.card.id)}
                onToggleSave={toggleSave}
                onOpenDetail={setOpenRecommendation}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
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
          isSaved={savedIds.includes(openRecommendation.card.id)}
          onClose={() => setOpenRecommendation(null)}
          onToggleSave={toggleSave}
        />
      ) : null}
    </main>
  )
}
