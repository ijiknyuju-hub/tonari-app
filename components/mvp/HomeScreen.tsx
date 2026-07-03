'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/mvp/BottomNav'
import { IngredientChipFilter } from '@/components/mvp/IngredientChipFilter'
import { FeaturedCard, CompactCard } from '@/components/mvp/NearbyDishCard'
import { RecordingModal } from '@/components/mvp/RecordingModal'
import { ReturnNudge } from '@/components/mvp/ReturnNudge'
import { dishes, relations } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useIsClient } from '@/lib/mvp/useIsClient'
import { todaysPick, type HomeMode } from '@/lib/mvp/todaysPick'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'
import { useUserState } from '@/lib/mvp/useUserState'

const INGREDIENT_CATEGORIES: Record<string, string> = {
  '鶏もも肉': '鶏肉', '手羽先': '鶏肉', '鶏ひき肉': '鶏肉',
  '合い挽き肉': 'ひき肉',
  'むきエビ（冷凍）': 'エビ', 'シーフードミックス': 'シーフード',
  'あさり（砂抜き済み）': 'シーフード',
  '鮭フレーク': '魚',
  '卵': '卵',
  '玉ねぎ': '玉ねぎ', '長ねぎ': 'ねぎ', 'にんにく': 'にんにく',
  'じゃがいも': 'じゃがいも', 'れんこん': '根菜', 'ごぼう': '根菜',
  'キャベツ': 'キャベツ', '白菜': '白菜', 'ブロッコリー': 'ブロッコリー',
  'ナス': 'ナス', 'パプリカ': 'パプリカ', 'もやし': 'もやし',
  'キムチ': 'キムチ', '春菊': '葉物',
  'トマト缶': 'トマト缶', 'デミグラスソース缶': '缶詰ソース',
  'アンチョビ缶': '缶詰ソース',
  'シュレッドチーズ': 'チーズ', 'パルメザンチーズ': 'チーズ',
  '牛乳': '乳製品', '生クリーム': '乳製品', 'ヨーグルト': '乳製品',
  '食パン': 'パン', 'コッペパン': 'パン',
  'うどん': '麺', '中華麺': '麺', '春雨': '麺', 'ビーフン': '麺', '米麺': '麺',
  'カレー（市販ルー）': 'カレールー', '鍋スープ': '鍋スープ',
  'こんにゃく': 'こんにゃく',
}

function toCategory(ingredient: string): string | null {
  return INGREDIENT_CATEGORIES[ingredient] ?? null
}

const MODES: Array<{ id: HomeMode; label: string; description: string }> = [
  { id: 'easy', label: 'かんたん', description: 'すぐ作れる・工程少なめ' },
  { id: 'stretch', label: '少し広げる', description: 'いつもと少し違う' },
  { id: 'full', label: 'しっかり作る', description: '満足感のある一品' },
]

function getDishName(id: string): string {
  return dishes.find((d) => d.id === id)?.name ?? id
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'おはようございます'
  if (hour < 18) return 'こんにちは'
  return 'こんばんは'
}

export default function HomeScreen({ dateISO }: { dateISO: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<HomeMode>('easy')
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const isClient = useIsClient()
  const { selectedBaseDishIds, setSelectedBaseDishIds } = useSelectedBaseDishes()
  const { state, recordMade, toggleIngredient, updateLastActiveDate } = useUserState()

  // Update last active date on mount
  useEffect(() => {
    if (isClient) updateLastActiveDate(dateISO)
  }, [isClient, dateISO, updateLastActiveDate])

  // Yesterday's date for nudge
  const yesterday = useMemo(() => {
    const d = new Date(dateISO)
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  }, [dateISO])

  // Return nudge logic
  const yesterdayPick = useMemo(
    () => todaysPick(selectedBaseDishIds, mode, yesterday),
    [selectedBaseDishIds, mode, yesterday],
  )
  const showNudge =
    !nudgeDismissed &&
    state.last_active_date !== '' &&
    state.last_active_date < dateISO &&
    yesterdayPick != null

  const handleNudgeRecord = useCallback(() => {
    if (!yesterdayPick) return
    recordMade({
      dish_id: yesterdayPick.target,
      made_at: new Date().toISOString(),
      rating: 'ok',
    })
    trackEvent('nudge_record', { dishId: yesterdayPick.target })
    setNudgeDismissed(true)
  }, [yesterdayPick, recordMade])

  const handleNudgeDismiss = useCallback(() => {
    trackEvent('nudge_dismiss')
    setNudgeDismissed(true)
  }, [])

  // The featured (today's pick) relation
  const featured = useMemo(
    () => todaysPick(selectedBaseDishIds, mode, dateISO),
    [mode, selectedBaseDishIds, dateISO],
  )

  // Other cards: same source as featured, all difficulties, max 3
  const otherCards = useMemo(() => {
    if (!featured) return []
    const candidates = relations.filter(
      (r) =>
        r.source === featured.source &&
        r.target !== featured.target,
    )
    return candidates.slice().sort((a, b) => b.proximity - a.proximity).slice(0, 3)
  }, [featured])

  // Ingredient category filter
  const activeCategories = state.available_ingredients
  const hasFilter = activeCategories.length > 0

  const matchesFilter = useCallback(
    (r: { new_ingredients: string[] }) => {
      if (!hasFilter) return true
      const needed = r.new_ingredients.map(toCategory).filter((c): c is string => c != null)
      return needed.every((c) => activeCategories.includes(c))
    },
    [hasFilter, activeCategories],
  )

  const filteredFeatured = useMemo(() => {
    if (!featured) return null
    if (matchesFilter(featured)) return featured
    const fallback = relations.find(
      (r) =>
        r.tab === mode &&
        selectedBaseDishIds.includes(r.source) &&
        matchesFilter(r),
    )
    return fallback ?? null
  }, [featured, mode, selectedBaseDishIds, matchesFilter])

  const filteredOtherCards = useMemo(
    () => otherCards.filter(matchesFilter),
    [otherCards, matchesFilter],
  )

  // Unique food categories from current relations
  const availableIngredients = useMemo(() => {
    const cats = relations
      .filter((r) => selectedBaseDishIds.includes(r.source))
      .flatMap((r) => r.new_ingredients)
      .map(toCategory)
      .filter((c): c is string => c != null)
    return [...new Set(cats)]
  }, [selectedBaseDishIds])

  const handleIngredientToggle = useCallback(
    (category: string) => {
      toggleIngredient(category)
      trackEvent('ingredient_filter_toggle', { ingredient: category, active: !activeCategories.includes(category) })
    },
    [toggleIngredient, activeCategories],
  )

  // Switch base dish context to a random different dish
  function handleSwitchBase() {
    const allIds = dishes.map((d) => d.id)
    const others = allIds.filter((id) => !selectedBaseDishIds.includes(id))
    if (others.length === 0) return
    const pick = others[Math.floor(Math.random() * others.length)]
    setSelectedBaseDishIds([...(selectedBaseDishIds ?? []), pick])
  }

  function handleMadeIt() {
    if (!filteredFeatured) return
    recordMade({
      dish_id: filteredFeatured.target,
      made_at: new Date().toISOString(),
      rating: 'ok',
    })
  }

  // Redirect first-time visitors to onboarding
  useEffect(() => {
    if (isClient && selectedBaseDishIds.length === 0) {
      router.replace('/onboarding')
    }
  }, [isClient, selectedBaseDishIds, router])

  useEffect(() => {
    if (isClient && featured) {
      trackEvent('show_recommendations', { count: selectedBaseDishIds.length })
    }
  }, [isClient, featured, selectedBaseDishIds.length])

  if (!isClient || selectedBaseDishIds.length === 0) {
    return <div className="tn-screen" />
  }

  const sourceName = filteredFeatured ? getDishName(filteredFeatured.source) : ''

  return (
    <main className="tn-screen">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur"
        style={{ borderColor: 'var(--tn-border)' }}
      >
        <div className="tn-container flex h-14 items-center justify-between">
          <button
            type="button"
            aria-label="メニュー"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: 'var(--tn-text)' }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black" style={{ color: 'var(--tn-text)' }}>
            となりごはん
          </span>
          <button
            type="button"
            aria-label="通知"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: 'var(--tn-text)' }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 10a6 6 0 0 1 12 0c0 4 2 5 2 5H4s2-1 2-5Z" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
          </button>
        </div>
      </header>

      <div className="tn-container tn-bottom-safe pt-6">
        {/* Return nudge */}
        {showNudge && yesterdayPick && (
          <ReturnNudge
            dishName={getDishName(yesterdayPick.target)}
            onRecord={handleNudgeRecord}
            onDismiss={handleNudgeDismiss}
          />
        )}

        {/* Greeting */}
        <section className="mb-5">
          <p className="text-xl font-black" style={{ color: 'var(--tn-text)' }}>
            {greeting()}
          </p>
          <p className="mt-1 text-sm font-bold" style={{ color: 'var(--tn-text-sub)' }}>
            今日のおすすめはこちら
          </p>
        </section>

        {/* Difficulty tabs */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {MODES.map((item) => {
            const selected = item.id === mode
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(item.id)}
                className="min-h-[4.5rem] rounded-2xl border px-2 text-center shadow-[var(--tn-shadow-soft)] transition"
                style={{
                  borderColor: selected ? 'var(--tn-text)' : 'var(--tn-border)',
                  background: selected ? 'var(--tn-tag-bg)' : 'var(--tn-surface)',
                }}
              >
                <span
                  className="block text-sm font-black"
                  style={{ color: 'var(--tn-text)' }}
                >
                  {item.label}
                </span>
                <span
                  className="mt-1 block text-xs font-bold leading-5"
                  style={{ color: 'var(--tn-text-sub)' }}
                >
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* Section header */}
        {filteredFeatured && (
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black" style={{ color: 'var(--tn-text)' }}>
              この前作った『{sourceName}』から広げる
            </p>
            <button
              type="button"
              onClick={handleSwitchBase}
              className="shrink-0 rounded-full border px-3 py-1 text-xs font-bold"
              style={{ borderColor: 'var(--tn-border)', color: 'var(--tn-text-sub)', background: 'var(--tn-surface)' }}
            >
              他の起点にする
            </button>
          </div>
        )}

        {/* Featured card */}
        {filteredFeatured && (
          <FeaturedCard
            relation={filteredFeatured}
            targetName={getDishName(filteredFeatured.target)}
            onMadeIt={handleMadeIt}
          />
        )}

        {/* No results after filtering */}
        {hasFilter && !filteredFeatured && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--tn-text-sub)' }}>
            もう少し食材を追加してみてください
          </p>
        )}

        {/* Other cards section */}
        {filteredOtherCards.length > 0 && (
          <section className="mt-7">
            <p className="mb-3 text-sm font-black" style={{ color: 'var(--tn-text)' }}>
              他にもこんな広げ方があります
            </p>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {filteredOtherCards.map((rel) => (
                <CompactCard
                  key={rel.target}
                  relation={rel}
                  targetName={getDishName(rel.target)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ingredient chip filter */}
        <IngredientChipFilter
          ingredients={availableIngredients}
          active={activeCategories}
          onToggle={handleIngredientToggle}
        />
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowRecordModal(true)}
        className="tn-primary-cta fixed z-40 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ bottom: '5.5rem', right: '1.25rem' }}
        aria-label="料理を記録する"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Recording modal */}
      {showRecordModal && (
        <RecordingModal
          onClose={() => setShowRecordModal(false)}
          dateISO={dateISO}
          mode={mode}
        />
      )}

      <BottomNav />
    </main>
  )
}
