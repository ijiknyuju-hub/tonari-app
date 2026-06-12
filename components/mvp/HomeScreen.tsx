'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/mvp/BottomNav'
import DishDetailModal from '@/components/phase0/DishDetailModal'
import { baseDishes } from '@/data/baseDishes'
import { dishCards } from '@/data/dishCards'
import { recommendDishes, type RecommendedDish } from '@/lib/phase0/recommendDishes'
import { trackEvent } from '@/lib/phase0/analytics'
import { useSavedDishes } from '@/lib/phase0/useSavedDishes'
import { todaysPick, type HomeMode } from '@/lib/mvp/todaysPick'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'

const MODES: Array<{
  id: HomeMode
  label: string
  description: string
  tagClass: string
}> = [
  { id: 'easy', label: 'かんたん', description: 'すぐ作れる・工程少なめ', tagClass: 'tn-tag-easy' },
  { id: 'stretch', label: '少し広げる', description: 'いつもと少し違う', tagClass: 'tn-tag-stretch' },
  { id: 'full', label: 'しっかり作る', description: '満足感のある一品', tagClass: 'tn-tag-full' },
]

export default function HomeScreen({ dateISO }: { dateISO: string }) {
  const [mode, setMode] = useState<HomeMode>('easy')
  const [openRecommendation, setOpenRecommendation] = useState<RecommendedDish | null>(null)
  const [showSaveFeedbackFor, setShowSaveFeedbackFor] = useState<string | null>(null)
  const { selectedBaseDishIds } = useSelectedBaseDishes()
  const { savedDishes, madeDishes, isSaved, isMade, save, unsave, markMade, unmarkMade } = useSavedDishes()

  const recommendations = useMemo(() => recommendDishes(selectedBaseDishIds), [selectedBaseDishIds])
  const featured = useMemo(
    () => todaysPick(selectedBaseDishIds, mode, dateISO),
    [mode, selectedBaseDishIds, dateISO],
  )
  const secondary = useMemo(
    () => recommendations.filter((recommendation) => recommendation.card.id !== featured?.card.id).slice(0, 3),
    [featured?.card.id, recommendations],
  )
  const savedTitles = useMemo(() => {
    const savedIds = new Set(savedDishes.map((dish) => dish.dishId))
    return dishCards.filter((card) => savedIds.has(card.id)).slice(0, 3).map((card) => card.title)
  }, [savedDishes])
  const recentMadeRecommendations = useMemo(() => {
    const recommendationsById = new Map(
      recommendDishes(baseDishes.map((dish) => dish.id)).map((recommendation) => [
        recommendation.card.id,
        recommendation,
      ]),
    )

    return madeDishes
      .map((dish) => ({
        madeAt: dish.madeAt,
        recommendation: recommendationsById.get(dish.dishId),
      }))
      .filter((item): item is { madeAt: string; recommendation: RecommendedDish } => Boolean(item.recommendation))
      .slice(0, 2)
  }, [madeDishes])

  const baseDishTitle = featured?.closestBaseDishTitle ?? getBaseDishTitle(selectedBaseDishIds[0])
  const recommendHref = `/recommend?base=${encodeURIComponent(selectedBaseDishIds.join(','))}`

  function toggleSave(dishId: string) {
    if (isSaved(dishId)) {
      unsave(dishId)
      setShowSaveFeedbackFor(null)
      return
    }

    save(dishId)
    trackEvent('click_want_to_make', { dishId })
    setShowSaveFeedbackFor(dishId)
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
    <main className="tn-screen">
      <section className="tn-container tn-bottom-safe pt-8">
        <header>
          <p className="text-center text-3xl font-black tracking-normal">となりごはん</p>
          <div className="mt-9">
            <h1 className="text-2xl font-black tracking-normal">{greeting(dateISO)}</h1>
            <p className="mt-2 text-base font-bold text-[var(--tn-text-sub)]">今日のおすすめはこちら</p>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-3 gap-2.5">
          {MODES.map((item) => {
            const selected = item.id === mode

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(item.id)}
                className={[
                  'min-h-[4.7rem] rounded-[1.25rem] border px-2 text-center shadow-[var(--tn-shadow-soft)] transition',
                  selected ? 'border-[var(--tn-accent)] bg-[var(--tn-accent-soft)]' : 'border-[var(--tn-border)]',
                ].join(' ')}
              >
                <span
                  className={[
                    'block text-sm font-black',
                    selected ? 'text-[var(--tn-accent)]' : 'text-[var(--tn-text)]',
                  ].join(' ')}
                >
                  {item.label}
                </span>
                <span className="mt-1 block text-xs font-bold leading-5 text-[var(--tn-text-sub)]">
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>

        {selectedBaseDishIds.length === 0 ? (
          <LeadInCard />
        ) : featured ? (
          <>
            <section className="tn-card mt-7 overflow-hidden p-4">
              <div className="flex items-start justify-between gap-3 border-b border-[var(--tn-border)] pb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tn-accent-soft)] text-xl">
                      💡
                    </span>
                    <h2 className="text-xl font-black">{baseDishTitle}から広げる</h2>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-6 text-[var(--tn-text-sub)]">
                    いつもの料理から、少し変えてみませんか？
                  </p>
                </div>
                <Link href="/select" className="tn-pill-button flex min-h-10 shrink-0 items-center px-4 text-sm">
                  起点を変更
                </Link>
              </div>

              <FeaturedCard
                recommendation={featured}
                mode={mode}
                isSaved={isSaved(featured.card.id)}
                onOpenDetail={openDetail}
                onToggleSave={toggleSave}
              />
              <div className="mt-6 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">他にもこんな広げ方があります</h2>
                <Link href={recommendHref} className="shrink-0 text-xs font-extrabold text-[var(--tn-text-sub)]">
                  すべて見る 〉
                </Link>
              </div>
              <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
                {secondary.map((recommendation) => (
                  <SecondaryCard
                    key={recommendation.card.id}
                    recommendation={recommendation}
                    isSaved={isSaved(recommendation.card.id)}
                    onOpenDetail={openDetail}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <LeadInCard />
        )}

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="tn-card p-4">
            <div className="flex flex-col gap-2">
              <h2 className="flex items-center gap-1 text-sm font-black">
                <BookmarkIcon saved={false} className="h-5 w-5" />
                作りたいリスト
              </h2>
              <Link href="/saved" className="text-xs font-extrabold text-[var(--tn-text-sub)]">
                一覧を見る &gt;
              </Link>
            </div>
            {savedTitles.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm font-bold leading-5 text-[var(--tn-text)]">
                {savedTitles.map((title) => (
                  <li key={title} className="rounded-xl bg-[var(--tn-surface-soft)] px-3 py-2">
                    {title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl bg-[var(--tn-surface-soft)] px-3 py-2 text-sm leading-6 text-[var(--tn-text-sub)]">
                保存した料理はまだありません。
              </p>
            )}
          </div>
          <div className="tn-card p-4">
            <div className="flex flex-col gap-2">
              <h2 className="flex items-center gap-1 text-sm font-black">
                <ClockIcon className="h-5 w-5" />
                最近作った料理
              </h2>
              <Link href="/saved" className="text-xs font-extrabold text-[var(--tn-text-sub)]">
                一覧を見る &gt;
              </Link>
            </div>
            {recentMadeRecommendations.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recentMadeRecommendations.map(({ madeAt, recommendation }) => (
                  <li key={recommendation.card.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(recommendation)}
                      className="block w-full rounded-2xl bg-[var(--tn-surface-soft)] px-3 py-2 text-left"
                    >
                      <span className="block text-sm font-black leading-5 text-[var(--tn-text)]">
                        {recommendation.card.title}
                      </span>
                      <span className="mt-1 block text-xs font-bold leading-5 text-[var(--tn-text-sub)]">
                        作った日: {formatMadeDate(madeAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl bg-[var(--tn-surface-soft)] px-3 py-2 text-sm leading-6 text-[var(--tn-text-sub)]">
                作った記録はまだありません
              </p>
            )}
          </div>
        </section>
      </section>

      {openRecommendation ? (
        <DishDetailModal
          recommendation={openRecommendation}
          isSaved={isSaved(openRecommendation.card.id)}
          isMade={isMade(openRecommendation.card.id)}
          showSaveFeedback={showSaveFeedbackFor === openRecommendation.card.id}
          onClose={() => setOpenRecommendation(null)}
          onToggleSave={toggleSave}
          onToggleMade={toggleMade}
        />
      ) : null}
      <BottomNav />
    </main>
  )
}

function FeaturedCard({
  recommendation,
  mode,
  isSaved,
  onOpenDetail,
  onToggleSave,
}: {
  recommendation: RecommendedDish
  mode: HomeMode
  isSaved: boolean
  onOpenDetail: (recommendation: RecommendedDish) => void
  onToggleSave: (dishId: string) => void
}) {
  const { card } = recommendation
  const activeMode = MODES.find((item) => item.id === mode) ?? MODES[0]

  return (
    <article className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--tn-border)] bg-white p-3">
      <div className="grid gap-4 sm:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-56 overflow-hidden rounded-2xl bg-[var(--tn-surface-soft)]">
          <DishPhotoMark className="h-full min-h-56" />
          <span className="absolute left-0 top-0 rounded-br-2xl bg-[var(--tn-tag-easy-bg)] px-4 py-2 text-sm font-black text-[var(--tn-tag-easy-text)]">
            おすすめ！
          </span>
        </div>
        <div className="min-w-0 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`tn-tag ${activeMode.tagClass}`}>{activeMode.label}</span>
            <span className="tn-tag bg-[var(--tn-accent-soft)] text-[var(--tn-accent)]">人気</span>
          </div>
          <h3 className="mt-4 text-2xl font-black leading-tight tracking-normal">{card.title}</h3>
          <p className="mt-3 text-sm font-bold leading-7 text-[var(--tn-text-sub)]">{card.shortCopy}</p>
          <div className="mt-4 rounded-2xl bg-[var(--tn-surface-soft)] p-3">
            <DetailRow icon="✧" label="変わるところ" value={card.changedPoints[0] ?? '少しだけ変える'} />
            <DetailRow icon="♨" label="工程量" value={`${recommendation.closestBaseDishTitle}＋${card.changedPoints.length}工程`} />
            <DetailRow
              icon="□"
              label="新しく必要な食材"
              value={card.extraIngredients.length > 0 ? card.extraIngredients.join('、') : 'なし'}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => onOpenDetail(recommendation)} className="tn-pill-button flex flex-1 items-center justify-center px-4">
          詳しく見る
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(card.id)}
          aria-label={isSaved ? `${card.title}を保存から外す` : `${card.title}を保存する`}
          className="flex min-h-11 w-12 items-center justify-center rounded-full border border-[var(--tn-border)] bg-white text-[var(--tn-accent)]"
        >
          <BookmarkIcon saved={isSaved} />
        </button>
      </div>
    </article>
  )
}

function formatMadeDate(madeAt: string): string {
  const date = new Date(madeAt)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function SecondaryCard({
  recommendation,
  isSaved,
  onOpenDetail,
  onToggleSave,
}: {
  recommendation: RecommendedDish
  isSaved: boolean
  onOpenDetail: (recommendation: RecommendedDish) => void
  onToggleSave: (dishId: string) => void
}) {
  const { card } = recommendation
  const mode = modeForDifficulty(card.difficulty)

  return (
    <article className="tn-card w-[72%] min-w-[15rem] max-w-[18rem] shrink-0 snap-start overflow-hidden p-3">
      <div className="relative h-32 overflow-hidden rounded-2xl bg-[var(--tn-surface-soft)]">
        <DishPhotoMark className="h-full" compact />
        <span className={`tn-tag absolute left-2 top-2 ${mode.tagClass}`}>{mode.label}</span>
        <button
          type="button"
          onClick={() => onToggleSave(card.id)}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--tn-accent)] shadow-[var(--tn-shadow-soft)]"
          aria-label={isSaved ? `${card.title}を保存から外す` : `${card.title}を保存する`}
        >
          <BookmarkIcon saved={isSaved} />
        </button>
      </div>
      <button type="button" onClick={() => onOpenDetail(recommendation)} className="mt-3 block w-full text-left">
        <span className="block text-lg font-black leading-6">{card.title}</span>
        <span className="mt-2 line-clamp-2 block min-h-10 text-sm font-bold leading-5 text-[var(--tn-text-sub)]">
          {card.shortCopy}
        </span>
        <span className="mt-4 flex items-end justify-between gap-2 text-xs font-extrabold text-[var(--tn-text-sub)]">
          <span>
            <span className="block">工程量</span>
            <span className="mt-1 block text-[var(--tn-text)]">
              {recommendation.closestBaseDishTitle}＋{card.changedPoints.length}工程
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--tn-accent)] text-lg text-[var(--tn-accent)]">
            〉
          </span>
        </span>
      </button>
    </article>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1.15rem_6.25rem_1fr] gap-2 py-1.5 text-xs">
      <span className="text-center font-black text-[var(--tn-text-sub)]">{icon}</span>
      <span className="font-extrabold text-[var(--tn-text-sub)]">{label}</span>
      <span className="font-bold leading-5 text-[var(--tn-text)]">{value}</span>
    </div>
  )
}

function DishPhotoMark({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={[
        'flex w-full items-center justify-center bg-[linear-gradient(135deg,#f7f0e6_0%,#fff8ef_45%,#f1e2d0_100%)]',
        className,
      ].join(' ')}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <span className={compact ? 'text-5xl' : 'text-7xl'}>🍚</span>
        <span className="absolute bottom-5 left-8 h-14 w-20 rounded-full bg-[rgba(232,112,42,0.18)] blur-xl" />
        <span className="absolute right-7 top-7 h-12 w-12 rounded-full bg-[rgba(78,124,54,0.14)] blur-xl" />
      </div>
    </div>
  )
}

function BookmarkIcon({ saved, className = 'h-5 w-5' }: { saved: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={saved ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6.5 4.75h11v15l-5.5-3.5-5.5 3.5v-15Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LeadInCard() {
  return (
    <section className="tn-card mt-6 p-5">
      <h2 className="text-xl font-black">まずは作れる料理を選びましょう</h2>
      <p className="mt-3 text-sm font-bold leading-7 text-[var(--tn-text-sub)]">
        作れる料理を選ぶと、今日のおすすめを1品だけ表示します。
      </p>
      <Link href="/select" className="tn-pill-button mt-5 flex w-full items-center justify-center px-4">
        作れる料理を選ぶ
      </Link>
    </section>
  )
}

function greeting(dateISO: string): string {
  const day = Number(dateISO.slice(-2))
  const hour = Number.isFinite(day) ? 12 : 12
  if (hour < 11) return 'おはようございます！'
  if (hour < 18) return 'こんにちは！'
  return 'こんばんは！'
}

function getBaseDishTitle(id: string | undefined): string {
  return baseDishes.find((dish) => dish.id === id)?.title ?? 'いつもの料理'
}

function modeForDifficulty(difficulty: 1 | 2 | 3) {
  if (difficulty === 1) return MODES[0]
  if (difficulty === 2) return MODES[1]
  return MODES[2]
}
