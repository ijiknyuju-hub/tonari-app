'use client'

import type { RecommendedDish } from '@/lib/phase0/recommendDishes'

type Phase0DishCardProps = {
  recommendation: RecommendedDish
  isSaved: boolean
  onToggleSave: (dishId: string) => void
  onOpenDetail: (recommendation: RecommendedDish) => void
}

export default function DishCard({
  recommendation,
  isSaved,
  onToggleSave,
  onOpenDetail,
}: Phase0DishCardProps) {
  const { card, closestBaseDishTitle, label } = recommendation
  const reasons = [...card.reusableSkills.slice(0, 1), ...card.changedPoints.slice(0, 1)]

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#E8611A]">{label}</p>
          <h2 className="mt-1 text-xl font-black leading-tight tracking-normal text-zinc-950">
            {card.title}
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-zinc-700">
            {closestBaseDishTitle}が作れるなら近い
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-[#F7F8F5] px-3 py-2 text-right">
          <p className="text-xs font-bold text-zinc-500">目安</p>
          <p className="text-sm font-black text-zinc-900">{card.timeMinutes}分</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <section>
          <h3 className="text-xs font-black text-zinc-500">近い理由</h3>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-700">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8611A]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-[#F7F8F5] p-3">
          <div className="min-w-0">
            <p className="text-xs font-black text-zinc-500">買い足し</p>
            <p className="mt-1 text-sm font-bold leading-6 text-zinc-800">
              {card.extraIngredients.length > 0 ? card.extraIngredients.join('、') : 'なし'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-zinc-500">難易度</p>
            <p className="mt-1 text-sm font-black text-zinc-800">{'★'.repeat(card.difficulty)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onToggleSave(card.id)}
          className={[
            'min-h-12 rounded-2xl px-3 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20',
            isSaved
              ? 'bg-[#E8611A]/10 text-[#B9470F]'
              : 'bg-[#E8611A] text-white shadow-[0_10px_22px_rgba(232,97,26,0.22)]',
          ].join(' ')}
        >
          {isSaved ? '保存済み' : '作ってみたい'}
        </button>
        <button
          type="button"
          onClick={() => onOpenDetail(recommendation)}
          className="min-h-12 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-black text-zinc-800 transition hover:border-[#E8611A]/50 focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20"
        >
          詳しく見る
        </button>
      </div>
    </article>
  )
}
