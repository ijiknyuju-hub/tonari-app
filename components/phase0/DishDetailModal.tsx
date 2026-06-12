'use client'

import Link from 'next/link'
import type { RecommendedDish } from '@/lib/phase0/recommendDishes'

type DishDetailModalProps = {
  recommendation: RecommendedDish
  isSaved: boolean
  isMade: boolean
  showSaveFeedback?: boolean
  onClose: () => void
  onToggleSave: (dishId: string) => void
  onToggleMade: (dishId: string) => void
}

export default function DishDetailModal({
  recommendation,
  isSaved,
  isMade,
  showSaveFeedback,
  onClose,
  onToggleSave,
  onToggleMade,
}: DishDetailModalProps) {
  const { card, closestBaseDishTitle, label } = recommendation

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-detail-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 px-3 pt-8"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F7F8F5] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="w-fit rounded-full bg-[#E8611A]/10 px-3 py-1 text-xs font-black text-[#B9470F]">{label}</p>
            <h2 id="dish-detail-title" className="mt-3 text-2xl font-black leading-tight tracking-normal">
              {card.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 rounded-full border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700"
          >
            閉じる
          </button>
        </div>

        <section className="mt-5 rounded-2xl bg-[#FFF3EC] p-4">
          <h3 className="text-lg font-black leading-7 text-[#B9470F]">
            {closestBaseDishTitle}が作れるなら近い
          </h3>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="phase0-card rounded-2xl p-3">
            <p className="text-xs font-black text-zinc-500">時間</p>
            <p className="mt-1 text-lg font-black text-zinc-950">{card.timeMinutes}分</p>
          </div>
          <div className="phase0-card rounded-2xl p-3">
            <p className="text-xs font-black text-zinc-500">難易度</p>
            <p className="mt-1 text-lg font-black text-zinc-950">{'★'.repeat(card.difficulty)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <DetailSection title="そのまま使える" items={card.reusableSkills} />
          <DetailSection title="変えるところ" items={card.changedPoints} />
          <DetailSection
            title="買い足す食材"
            items={card.extraIngredients.length > 0 ? card.extraIngredients : ['なし']}
          />
          <DetailSection title="ざっくり手順" items={card.roughSteps} ordered />
        </div>

        <div className="sticky bottom-0 mt-5 bg-[#F7F8F5] pb-1 pt-4">
          {showSaveFeedback ? (
            <div className="mb-3 rounded-2xl border border-[#E8611A]/20 bg-[#E8611A]/10 p-4">
              <p className="text-sm font-bold leading-6 text-[#B9470F]">
                {card.title}を作ってみたいリストに追加しました。
              </p>
              <Link href="/saved" className="mt-2 inline-flex text-sm font-black text-[#B9470F] underline">
                リストを見る
              </Link>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onToggleSave(card.id)}
              className={[
                'flex min-h-16 items-center justify-center rounded-2xl px-3 text-base font-black transition focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20',
                isSaved
                  ? 'bg-[#E8611A]/10 text-[#B9470F]'
                  : 'bg-[#E8611A] text-white shadow-[0_14px_30px_rgba(232,97,26,0.25)]',
              ].join(' ')}
            >
              {isSaved ? '保存済み' : '作ってみたい'}
            </button>
            <button
              type="button"
              onClick={() => onToggleMade(card.id)}
              className={[
                'flex min-h-16 items-center justify-center rounded-2xl border px-3 text-base font-black transition focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20',
                isMade
                  ? 'border-[#E8611A]/30 bg-[#FFF3EC] text-[#B9470F]'
                  : 'border-zinc-200 bg-white text-zinc-800',
              ].join(' ')}
            >
              {isMade ? '作った済み' : '作った'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailSection({
  title,
  items,
  ordered = false,
}: {
  title: string
  items: string[]
  ordered?: boolean
}) {
  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <section className="phase0-card rounded-2xl p-4">
      <h3 className="text-sm font-black text-zinc-950">{title}</h3>
      <ListTag className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
        {items.map((item, index) => (
          <li key={`${title}-${item}`} className="flex gap-2">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8611A]/10 text-xs font-black text-[#B9470F]">
              {ordered ? index + 1 : '・'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ListTag>
    </section>
  )
}
