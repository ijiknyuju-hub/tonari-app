import { useState } from 'react'
import { filterMatches, type RecommendFilter } from '@/lib/closeness'
import type { AppState, Dish } from '@/lib/types'

type RecommendScreenProps = {
  dishes: Dish[]
  onOpenDish: (id: string) => void
  onStateChange: (next: AppState) => void
  appState: AppState
}

const filters: { id: RecommendFilter; label: string }[] = [
  { id: 'easy', label: 'かんたん' },
  { id: 'expand', label: '少し広げる' },
  { id: 'challenge', label: 'しっかり作る' },
]

function getCategoryColor(category: string): string {
  if (category === '炒め物') return '#FFE8D0'
  if (category === '煮物') return '#E8F0E0'
  if (category === '揚げ物') return '#FFF5D0'
  if (category === '焼き物') return '#FFF0E8'
  if (category === 'ご飯もの') return '#E8F5FF'
  return '#F0F0F0'
}

export default function RecommendScreen({
  dishes,
  onOpenDish,
  onStateChange,
  appState,
}: RecommendScreenProps) {
  const [filter, setFilter] = useState<RecommendFilter>('easy')
  const [baseIndex, setBaseIndex] = useState(0)
  const cookedDishes = dishes.filter((dish) => dish.status === 'cooked' && dish.axes.seasoning !== '')
  const safeBaseIndex = cookedDishes[baseIndex] ? baseIndex : 0
  const baseDish = cookedDishes[safeBaseIndex]

  if (!baseDish) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center text-sm text-zinc-500">
        レパートリーを追加してください
      </div>
    )
  }

  const candidates =
    filter === 'easy'
      ? []
      : dishes.filter((dish) => filterMatches(baseDish, dish, filter) && dish.id !== baseDish.id)

  function handleWant(id: string) {
    const nextState: AppState = {
      ...appState,
      dishes: appState.dishes.map((dish) =>
        dish.id === id ? { ...dish, status: 'want' as const } : dish,
      ),
      lastUpdated: new Date().toISOString(),
    }

    onStateChange(nextState)
  }

  return (
    <section className="space-y-4">
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {cookedDishes.map((dish, index) => {
            const isSelected = safeBaseIndex === index

            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => setBaseIndex(index)}
                className={`shrink-0 rounded-full border border-zinc-200 px-4 py-2 text-sm ${
                  isSelected ? 'bg-[#E8611A] text-white' : 'bg-white text-zinc-700'
                }`}
              >
                {dish.name}
              </button>
            )
          })}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold text-zinc-500">起点の料理</p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-14 w-14 shrink-0 rounded-xl"
            style={{ backgroundColor: getCategoryColor(baseDish.category) }}
          />
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{baseDish.name}</h2>
            <p className="text-xs text-zinc-500">
              {baseDish.category}・{'★'.repeat(baseDish.effort)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {filters.map((item) => {
          const isSelected = filter === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-sm ${
                isSelected ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="space-y-3">
        {filter === 'easy'
          ? baseDish.arrangements.map((arrangement) => (
              <button
                key={arrangement.id}
                type="button"
                onClick={() => onOpenDish(baseDish.id)}
                className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left"
              >
                <span className="rounded-full bg-[#DCF5E4] px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  アレンジ
                </span>
                <h3 className="mt-3 text-base font-semibold text-zinc-900">{arrangement.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{arrangement.reason}</p>
              </button>
            ))
          : candidates.map((dish) => (
              <div key={dish.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <button type="button" onClick={() => onOpenDish(dish.id)} className="w-full text-left">
                  <span className="rounded-full bg-[#FFF0DC] px-2.5 py-1 text-xs font-semibold text-zinc-700">
                    となりの料理
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-zinc-900">{dish.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{dish.changePoint ?? dish.summary ?? dish.category}</p>
                </button>
                {dish.status !== 'want' ? (
                  <button
                    type="button"
                    onClick={() => handleWant(dish.id)}
                    className="mt-3 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-[#E8611A]"
                  >
                    作りたい
                  </button>
                ) : null}
              </div>
            ))}
      </div>
    </section>
  )
}
