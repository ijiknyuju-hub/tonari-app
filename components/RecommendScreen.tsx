import { useState } from 'react'
import { filterMatches, type RecommendFilter } from '@/lib/closeness'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { AppState, Dish } from '@/lib/types'

type RecommendScreenProps = {
  dishes: Dish[]
  onOpenDish: (id: string) => void
  onStateChange: (next: AppState) => void
  appState: AppState
}

const filters: { id: RecommendFilter; label: string }[] = [
  { id: 'easy', label: 'すぐできる' },
  { id: 'expand', label: '少し広げる' },
  { id: 'challenge', label: '挑戦する' },
]

export default function RecommendScreen({
  dishes,
  onOpenDish,
  onStateChange,
  appState,
}: RecommendScreenProps) {
  const [filter, setFilter] = useState<RecommendFilter>('expand')
  const [baseIndex, setBaseIndex] = useState(0)
  const cookedDishes = dishes.filter((dish) => dish.status === 'cooked' && dish.axes.seasoning !== '')
  const safeBaseIndex = cookedDishes[baseIndex] ? baseIndex : 0
  const baseDish = cookedDishes[safeBaseIndex]

  if (!baseDish) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center text-sm text-zinc-500">
        レパートリーを追加すると、おすすめが表示されます。
      </div>
    )
  }

  const candidates =
    filter === 'easy'
      ? baseDish.arrangements.map((arrangement) => ({
          id: arrangement.id,
          name: arrangement.name,
          reason: arrangement.reason,
          baseDish,
        }))
      : dishes
          .filter((dish) => filterMatches(baseDish, dish, filter) && dish.id !== baseDish.id)
          .map((dish) => ({ ...dish, baseDish }))
  const heroCandidate = candidates[0]
  const remainingCandidates = candidates.slice(1, 5)

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
    <section className="space-y-5">
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {cookedDishes.map((dish, index) => {
            const isSelected = safeBaseIndex === index

            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => setBaseIndex(index)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                  isSelected
                    ? 'border-[#E8611A] bg-[#E8611A] text-white'
                    : 'border-zinc-200 bg-white text-zinc-700'
                }`}
              >
                {dish.name}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => {
          const isSelected = filter === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                isSelected ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#E8611A]">今日のとなりごはん</p>
        <h2 className="mt-1 text-xl font-bold text-zinc-900">{baseDish.name}から広げる</h2>
      </div>
      {heroCandidate ? (
        <CandidateHero
          candidate={heroCandidate}
          baseDish={baseDish}
          filter={filter}
          onOpenDish={onOpenDish}
          onWant={handleWant}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-5 text-center text-sm text-zinc-500">
          この条件のおすすめはまだありません。
        </div>
      )}
      {remainingCandidates.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {remainingCandidates.map((candidate) => (
            <CandidateTile
              key={candidate.id}
              candidate={candidate}
              baseDish={baseDish}
              filter={filter}
              onOpenDish={onOpenDish}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function CandidateHero({
  candidate,
  baseDish,
  filter,
  onOpenDish,
  onWant,
}: {
  candidate: Dish | { id: string; name: string; reason: string; baseDish: Dish }
  baseDish: Dish
  filter: RecommendFilter
  onOpenDish: (id: string) => void
  onWant: (id: string) => void
}) {
  const isDish = 'status' in candidate
  const targetDish = isDish ? candidate : baseDish

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <button type="button" onClick={() => onOpenDish(targetDish.id)} className="block w-full text-left">
        <div className="relative h-44" style={{ backgroundColor: getCategoryColor(targetDish.category) }}>
          <img src={getDishPhotoUrl(targetDish)} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-[#E8611A] px-3 py-1 text-xs font-bold text-white">
            {filter === 'easy' ? 'アレンジ' : 'おすすめ'}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-zinc-900">{candidate.name}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {isDish ? candidate.changePoint ?? candidate.summary ?? candidate.category : candidate.reason}
          </p>
        </div>
      </button>
      {isDish && candidate.status !== 'want' ? (
        <button
          type="button"
          onClick={() => onWant(candidate.id)}
          className="mx-4 mb-4 rounded-full border border-[#E8611A] px-4 py-2 text-sm font-bold text-[#E8611A]"
        >
          作りたいに追加
        </button>
      ) : null}
    </article>
  )
}

function CandidateTile({
  candidate,
  baseDish,
  filter,
  onOpenDish,
}: {
  candidate: Dish | { id: string; name: string; reason: string; baseDish: Dish }
  baseDish: Dish
  filter: RecommendFilter
  onOpenDish: (id: string) => void
}) {
  const isDish = 'status' in candidate
  const targetDish = isDish ? candidate : baseDish

  return (
    <button
      type="button"
      onClick={() => onOpenDish(targetDish.id)}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white text-left"
    >
      <div className="relative h-24" style={{ backgroundColor: getCategoryColor(targetDish.category) }}>
        <img src={getDishPhotoUrl(targetDish)} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#E8611A]">
          {filter === 'easy' ? 'アレンジ' : targetDish.category}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-bold text-zinc-900">{candidate.name}</p>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
          {isDish ? candidate.changePoint ?? candidate.summary ?? candidate.axes.method : candidate.reason}
        </p>
      </div>
    </button>
  )
}
