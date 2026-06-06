import { useMemo, useState } from 'react'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { Dish } from '@/lib/types'

type DishCardProps = {
  dish: Dish
  allDishes: Dish[]
  onClose: () => void
  onUpdate: (dish: Dish) => void
  onOpenDish: (id: string) => void
}

export default function DishCard({ dish, allDishes, onClose, onUpdate, onOpenDish }: DishCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState(dish.note ?? '')
  const parentDish = dish.fromDishId ? allDishes.find((item) => item.id === dish.fromDishId) : undefined
  const steps = useMemo(
    () => dish.steps?.split(/\r?\n/).map((step) => step.trim()).filter(Boolean) ?? [],
    [dish.steps],
  )

  function handleSaveNote() {
    onUpdate({ ...dish, note })
    setIsEditing(false)
  }

  function handleCooked() {
    onUpdate({ ...dish, status: 'cooked', cookedAt: new Date().toISOString() })
  }

  return (
    <>
      <button type="button" aria-label="閉じる" className="fixed inset-0 z-[49] bg-black/40" onClick={onClose} />
      <aside className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white">
        <div className="relative h-48" style={{ backgroundColor: getCategoryColor(dish.category) }}>
          <img src={getDishPhotoUrl(dish)} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="戻る"
            onClick={onClose}
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-800 shadow-sm"
          >
            ←
          </button>
        </div>
        <div className="space-y-5 px-4 pb-8 pt-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFF0DC] px-3 py-1 text-xs font-bold text-[#E8611A]">
                {dish.category}
              </span>
              <span className="text-xs font-semibold text-zinc-500">{'★'.repeat(dish.effort)}</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-zinc-900">{dish.name}</h2>
            {dish.summary ? <p className="mt-2 text-sm leading-6 text-zinc-500">{dish.summary}</p> : null}
          </div>
          {parentDish ? (
            <button
              type="button"
              onClick={() => onOpenDish(parentDish.id)}
              className="rounded-full bg-[#FFF7ED] px-4 py-2 text-sm font-semibold text-[#E8611A]"
            >
              {parentDish.name}から広がった料理
            </button>
          ) : null}
          <div className="grid grid-cols-3 gap-2">
            <InfoChip label="味" value={dish.axes.seasoning} />
            <InfoChip label="食材" value={dish.axes.ingredient} />
            <InfoChip label="調理" value={dish.axes.method} />
          </div>
          {dish.changePoint ? (
            <section className="rounded-xl bg-[#FFF0DC] p-4">
              <h3 className="text-sm font-bold text-zinc-900">✨ 変化ポイント</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{dish.changePoint}</p>
            </section>
          ) : null}
          {dish.newIngredients ? (
            <IconSection title="🛒 新しく使う食材">
              <p className="whitespace-pre-line text-sm leading-6 text-zinc-700">{dish.newIngredients}</p>
            </IconSection>
          ) : null}
          {dish.ingredients ? (
            <IconSection title="🥕 材料">
              <p className="whitespace-pre-line text-sm leading-6 text-zinc-700">{dish.ingredients}</p>
            </IconSection>
          ) : null}
          {steps.length > 0 ? (
            <IconSection title="🍳 作り方">
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-6 text-zinc-700">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8611A] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step.replace(/^\d+[.)、\s-]*/, '')}</span>
                  </li>
                ))}
              </ol>
            </IconSection>
          ) : null}
          {dish.arrangements.length > 0 ? (
            <IconSection title="💡 近いアレンジ">
              <div className="space-y-2">
                {dish.arrangements.map((arrangement) => (
                  <div key={arrangement.id} className="rounded-xl bg-[#F4F4F5] p-3">
                    <div className="flex items-center gap-2">
                      <span>{arrangement.type === 'specific' ? '🎯' : '✨'}</span>
                      <p className="text-sm font-semibold text-zinc-900">{arrangement.name}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">{arrangement.reason}</p>
                  </div>
                ))}
              </div>
            </IconSection>
          ) : null}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">📝 メモ</h3>
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#E8611A]">
                  編集
                </button>
              ) : null}
            </div>
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="min-h-28 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-[#E8611A]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="rounded-full bg-[#E8611A] px-4 py-2 text-sm font-semibold text-white"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNote(dish.note ?? '')
                      setIsEditing(false)
                    }}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-500">
                {dish.note || 'メモはまだありません'}
              </p>
            )}
          </section>
          {dish.referenceUrl ? (
            <a
              href={dish.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-[#E8611A]"
            >
              参考リンクを開く
            </a>
          ) : null}
          {dish.status === 'want' ? (
            <button
              type="button"
              onClick={handleCooked}
              className="w-full rounded-full bg-[#E8611A] px-4 py-3 text-sm font-bold text-white"
            >
              作ったのでレパートリーに追加
            </button>
          ) : null}
        </div>
      </aside>
    </>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className="text-[11px] font-bold text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-800">{value || '-'}</p>
    </div>
  )
}

function IconSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}
