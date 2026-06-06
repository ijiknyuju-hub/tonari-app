import { useState } from 'react'
import type { Dish } from '@/lib/types'

type DishCardProps = {
  dish: Dish
  allDishes: Dish[]
  onClose: () => void
  onUpdate: (dish: Dish) => void
  onOpenDish: (id: string) => void
}

function getCategoryColor(category: string): string {
  if (category === '炒め物') return '#FFE8D0'
  if (category === '煮物') return '#E8F0E0'
  if (category === '揚げ物') return '#FFF5D0'
  if (category === '焼き物') return '#FFF0E8'
  if (category === 'ご飯もの') return '#E8F5FF'
  return '#F0F0F0'
}

export default function DishCard({ dish, allDishes, onClose, onUpdate, onOpenDish }: DishCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState(dish.note ?? '')
  const parentDish = dish.fromDishId ? allDishes.find((item) => item.id === dish.fromDishId) : undefined

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
      <aside className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white">
        <div className="relative h-40" style={{ backgroundColor: getCategoryColor(dish.category) }}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-700"
          >
            閉じる
          </button>
        </div>
        <div className="space-y-5 px-4 pb-8 pt-5">
          <div>
            <p className="text-xs font-semibold text-zinc-500">{dish.category}</p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">{dish.name}</h2>
            {dish.summary ? <p className="mt-2 text-sm text-zinc-500">{dish.summary}</p> : null}
          </div>
          {parentDish ? (
            <button
              type="button"
              onClick={() => onOpenDish(parentDish.id)}
              className="text-sm font-semibold text-[#E8611A]"
            >
              {parentDish.name} から広げた料理
            </button>
          ) : null}
          {dish.changePoint ? (
            <section className="rounded-xl bg-[#FFF0DC] p-4">
              <h3 className="text-sm font-bold text-zinc-900">変化ポイント</h3>
              <p className="mt-2 text-sm text-zinc-700">{dish.changePoint}</p>
            </section>
          ) : null}
          {dish.newIngredients ? (
            <section>
              <h3 className="text-sm font-bold text-zinc-900">新しく使う食材</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-700">{dish.newIngredients}</p>
            </section>
          ) : null}
          {dish.ingredients ? (
            <section>
              <h3 className="text-sm font-bold text-zinc-900">材料</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-700">{dish.ingredients}</p>
            </section>
          ) : null}
          {dish.steps ? (
            <section>
              <h3 className="text-sm font-bold text-zinc-900">作り方</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-700">{dish.steps}</p>
            </section>
          ) : null}
          {dish.arrangements.length > 0 ? (
            <section>
              <h3 className="text-sm font-bold text-zinc-900">近いアレンジ</h3>
              <div className="mt-2 space-y-2">
                {dish.arrangements.map((arrangement) => (
                  <div key={arrangement.id} className="rounded-xl bg-[#DCF5E4] p-3">
                    <p className="text-sm font-semibold text-zinc-900">{arrangement.name}</p>
                    <p className="mt-1 text-xs text-zinc-600">{arrangement.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">メモ</h3>
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
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-500">{dish.note || 'メモはまだありません'}</p>
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
              作った！レパートリーに追加
            </button>
          ) : null}
        </div>
      </aside>
    </>
  )
}
