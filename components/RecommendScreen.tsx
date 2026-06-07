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

type Candidate = Dish | { id: string; name: string; reason: string; baseDish: Dish }

const filters: { id: RecommendFilter; label: string }[] = [
  { id: 'easy', label: 'かんたん' },
  { id: 'expand', label: '少し広げる' },
  { id: 'challenge', label: 'しっかり作る' },
]

export default function RecommendScreen({
  dishes,
  onOpenDish,
  onStateChange,
  appState,
}: RecommendScreenProps) {
  const [filter, setFilter] = useState<RecommendFilter>('expand')
  const cookedDishes = dishes.filter((dish) => dish.status === 'cooked' && dish.axes.seasoning !== '')
  const baseDish = cookedDishes[0]

  if (!baseDish) {
    return (
      <section className="rounded-[22px] border border-[#E7DED2] bg-white px-5 py-10 text-center text-[15px] font-semibold text-[#6D6258] shadow-sm">
        作ったことがある料理を選ぶと、おすすめが表示されます。
      </section>
    )
  }

  const candidates: Candidate[] =
    filter === 'easy'
      ? baseDish.arrangements.map((arrangement) => ({
          id: arrangement.id,
          name: arrangement.name,
          reason: arrangement.reason,
          baseDish,
        }))
      : dishes.filter((dish) => filterMatches(baseDish, dish, filter) && dish.id !== baseDish.id)

  const visibleCandidates =
    candidates.length > 0
      ? candidates
      : baseDish.arrangements.map((arrangement) => ({
          id: arrangement.id,
          name: arrangement.name,
          reason: arrangement.reason,
          baseDish,
        }))
  const heroCandidate = visibleCandidates[0]
  const tileCandidates = visibleCandidates.slice(1, 5)

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
    <section className="-mx-1 space-y-5 pb-3">
      <div className="px-1 pt-1">
        <p className="text-[24px] font-black leading-tight tracking-wide text-[#2A2521]">おはようございます！</p>
        <p className="mt-1 text-[24px] font-black leading-tight tracking-wide text-[#2A2521]">
          今日のおすすめはこちら
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 px-1">
        {filters.map((item) => {
          const isSelected = filter === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`h-12 rounded-full border text-[15px] font-bold shadow-sm transition ${
                isSelected
                  ? 'border-[#F24812] bg-[#F24812] text-white'
                  : 'border-[#DED8D0] bg-white text-[#3D3833]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="text-[21px] font-black tracking-wide text-[#2A2521]">{baseDish.name}から広げる</h2>
        <button type="button" className="text-[15px] font-bold text-[#F24812]">
          すべて見る 〉
        </button>
      </div>

      {heroCandidate ? (
        <CandidateHero
          candidate={heroCandidate}
          baseDish={baseDish}
          filter={filter}
          onOpenDish={onOpenDish}
          onWant={handleWant}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {tileCandidates.map((candidate) => (
          <CandidateTile
            key={candidate.id}
            candidate={candidate}
            baseDish={baseDish}
            onOpenDish={onOpenDish}
          />
        ))}
      </div>
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
  candidate: Candidate
  baseDish: Dish
  filter: RecommendFilter
  onOpenDish: (id: string) => void
  onWant: (id: string) => void
}) {
  const isDish = 'status' in candidate
  const targetDish = isDish ? candidate : baseDish

  return (
    <article className="grid grid-cols-[1.08fr_0.92fr] overflow-hidden rounded-[18px] border border-[#E9DED3] bg-white shadow-[0_3px_14px_rgba(56,41,25,0.16)]">
      <button
        type="button"
        onClick={() => onOpenDish(targetDish.id)}
        className="min-h-[176px] text-left"
        style={{ backgroundColor: getCategoryColor(targetDish.category) }}
      >
        <Photo dish={targetDish} className="h-full min-h-[176px] w-full object-cover" />
      </button>
      <div className="flex min-w-0 flex-col px-3 py-4">
        <span className="mb-2 w-fit rounded-full bg-[#F24812] px-3 py-1 text-[12px] font-bold text-white">
          {filter === 'easy' ? 'アレンジ' : 'おすすめ'}
        </span>
        <button type="button" onClick={() => onOpenDish(targetDish.id)} className="text-left">
          <h3 className="text-[24px] font-black leading-tight tracking-wide text-[#2A2521]">{candidate.name}</h3>
          <p className="mt-2 line-clamp-2 text-[15px] font-medium leading-6 text-[#4B443E]">
            {getCandidateSummary(candidate, baseDish, targetDish)}
          </p>
        </button>
        <p className="mt-3 text-[15px] font-medium text-[#5C554F]">
          難易度 <Stars effort={isDish ? candidate.effort : baseDish.effort} />
        </p>
        <div className="mt-auto grid grid-cols-3 border-t border-[#E7DED2] pt-3 text-center text-[11px] font-semibold leading-5 text-[#5C554F]">
          <span>⏱<br />約20分</span>
          <span className="border-x border-[#E7DED2]">♨<br />{targetDish.category || '和食'}</span>
          <span>◆<br />少し広げる</span>
        </div>
        {isDish && candidate.status !== 'want' ? (
          <button type="button" onClick={() => onWant(candidate.id)} className="sr-only">
            作りたいに追加
          </button>
        ) : null}
      </div>
    </article>
  )
}

function CandidateTile({
  candidate,
  baseDish,
  onOpenDish,
}: {
  candidate: Candidate
  baseDish: Dish
  onOpenDish: (id: string) => void
}) {
  const isDish = 'status' in candidate
  const targetDish = isDish ? candidate : baseDish

  return (
    <button
      type="button"
      onClick={() => onOpenDish(targetDish.id)}
      className="overflow-hidden rounded-[16px] border border-[#E9DED3] bg-white text-left shadow-[0_3px_12px_rgba(56,41,25,0.14)]"
    >
      <div className="h-28" style={{ backgroundColor: getCategoryColor(targetDish.category) }}>
        <Photo dish={targetDish} className="h-full w-full object-cover" />
      </div>
      <div className="px-3 py-3">
        <p className="truncate text-[20px] font-black tracking-wide text-[#2A2521]">{candidate.name}</p>
        <p className="mt-1 line-clamp-2 min-h-[40px] text-[14px] font-medium leading-5 text-[#5C554F]">
          {getCandidateSummary(candidate, baseDish, targetDish)}
        </p>
        <p className="mt-2 text-[14px] font-medium text-[#5C554F]">
          難易度 <Stars effort={isDish ? candidate.effort : baseDish.effort} />
        </p>
        <div className="mt-2 flex justify-between border-t border-[#E7DED2] pt-2 text-[12px] font-semibold text-[#5C554F]">
          <span>⏱ 約20分</span>
          <span>♨ {targetDish.category || '和食'}</span>
        </div>
      </div>
    </button>
  )
}

function getCandidateSummary(candidate: Candidate, baseDish: Dish, targetDish: Dish) {
  if ('status' in candidate) {
    return candidate.changePoint ?? candidate.summary ?? `${baseDish.name}を少し広げる`
  }

  return candidate.reason || `${targetDish.name}の近くから試せます`
}

function Stars({ effort }: { effort: Dish['effort'] }) {
  return (
    <span aria-label={`難易度${effort}`} className="ml-2 tracking-widest">
      <span className="text-[#F24812]">{'★'.repeat(effort)}</span>
      <span className="text-[#A8A29E]">{'★'.repeat(3 - effort)}</span>
    </span>
  )
}

function Photo({ dish, className }: { dish: Dish; className: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div className={className} style={{ backgroundColor: getCategoryColor(dish.category) }} />
  }

  return <img src={getDishPhotoUrl(dish)} alt="" onError={() => setHasError(true)} className={className} />
}
