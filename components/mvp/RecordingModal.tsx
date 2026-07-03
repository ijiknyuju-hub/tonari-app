'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { dishes } from '@/data/v3'
import { trackEvent } from '@/lib/mvp/analytics'
import { useDishLibrary } from '@/lib/mvp/useDishLibrary'
import { todaysPick } from '@/lib/mvp/todaysPick'
import { useUserState } from '@/lib/mvp/useUserState'
import type { HomeMode } from '@/lib/mvp/todaysPick'
import type { MadeRecord } from '@/types/dish'

type Step = 'select' | 'impression' | 'complete'

interface RecordingModalProps {
  onClose: () => void
  dateISO: string
  mode: HomeMode
}

const MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100]

const RATING_OPTIONS: { rating: MadeRecord['rating']; emoji: string; label: string }[] = [
  { rating: 'great', emoji: '😋', label: '最高' },
  { rating: 'ok', emoji: '🙂', label: 'まあまあ' },
  { rating: 'meh', emoji: '🤔', label: '微妙' },
]

export function RecordingModal({ onClose, dateISO, mode }: RecordingModalProps) {
  const { state, recordMade } = useUserState()
  const { customDishes } = useDishLibrary()
  const [step, setStep] = useState<Step>('select')
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedDishIds = state.selected_dishes

  const yesterday = useMemo(() => {
    const d = new Date(dateISO)
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  }, [dateISO])

  const recentPicks = useMemo(() => {
    const todayPick = todaysPick(selectedDishIds, mode, dateISO)
    const yesterdayPick = todaysPick(selectedDishIds, mode, yesterday)
    const ids = new Set<string>()
    const picks: { id: string; name: string }[] = []
    for (const pick of [todayPick, yesterdayPick]) {
      if (pick && !ids.has(pick.target)) {
        ids.add(pick.target)
        const dish = dishes.find((d) => d.id === pick.target)
        if (dish) picks.push({ id: dish.id, name: dish.name })
      }
    }
    return picks
  }, [selectedDishIds, mode, dateISO, yesterday])

  const bookmarkedDishes = useMemo(() => {
    return state.bookmarked
      .map((id) => dishes.find((d) => d.id === id))
      .filter((d): d is (typeof dishes)[number] => d != null)
  }, [state.bookmarked])

  const filteredDishes = useMemo(() => {
    const allDishes = [
      ...customDishes.map((dish) => ({ id: dish.id, name: dish.name })),
      ...dishes,
    ]
    if (!searchQuery) return allDishes
    const q = searchQuery.toLowerCase()
    return allDishes.filter((d) => d.name.toLowerCase().includes(q) || d.id.includes(q))
  }, [customDishes, searchQuery])

  const selectedDishName = useMemo(() => {
    if (!selectedDishId) return ''
    return customDishes.find((d) => d.id === selectedDishId)?.name ?? dishes.find((d) => d.id === selectedDishId)?.name ?? selectedDishId
  }, [customDishes, selectedDishId])

  const repertoireCount = useMemo(
    () => new Set(state.made_records.map((r) => r.dish_id)).size,
    [state.made_records],
  )

  const cumulativeDays = useMemo(
    () => new Set(state.made_records.map((r) => r.made_at.slice(0, 10))).size,
    [state.made_records],
  )

  const nextMilestone = MILESTONES.find((m) => m > repertoireCount) ?? 100
  const remaining = nextMilestone - repertoireCount

  const handleSelectDish = useCallback((dishId: string) => {
    setSelectedDishId(dishId)
    setStep('impression')
  }, [])

  const handlePhoto = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRate = useCallback(
    (rating: MadeRecord['rating']) => {
      if (!selectedDishId) return
      const record: MadeRecord = {
        dish_id: selectedDishId,
        made_at: new Date().toISOString(),
        rating,
        ...(photoUrl ? { photo_url: photoUrl } : {}),
      }
      recordMade(record)
      trackEvent('fab_record', { dishId: selectedDishId, rating })
      setStep('complete')
    },
    [selectedDishId, photoUrl, recordMade],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl"
        style={{ background: 'var(--tn-bg)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--tn-text)' }}>
            {step === 'select' && '何を作りましたか？'}
            {step === 'impression' && 'どうでしたか？'}
            {step === 'complete' && '🎉'}
          </h2>
          {step !== 'complete' && (
            <button
              type="button"
              onClick={onClose}
              className="text-2xl leading-none"
              style={{ color: 'var(--tn-text-sub)' }}
            >
              ×
            </button>
          )}
        </div>

        {/* Step 1: Dish selection */}
        {step === 'select' && (
          <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: '70vh' }}>
            {recentPicks.length > 0 && (
              <>
                <p className="mb-2 mt-2 text-xs font-bold" style={{ color: 'var(--tn-text-sub)' }}>
                  最近のおすすめ
                </p>
                {recentPicks.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectDish(dish.id)}
                    className="mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
                    style={{ background: 'var(--tn-surface)', border: '1px solid var(--tn-border)' }}
                  >
                    <span className="text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
                      {dish.name}
                    </span>
                  </button>
                ))}
              </>
            )}

            {bookmarkedDishes.length > 0 && (
              <>
                <p className="mb-2 mt-3 text-xs font-bold" style={{ color: 'var(--tn-text-sub)' }}>
                  作りたいリスト
                </p>
                {bookmarkedDishes.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectDish(dish.id)}
                    className="mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
                    style={{ background: 'var(--tn-surface)', border: '1px solid var(--tn-border)' }}
                  >
                    <span className="text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
                      {dish.name}
                    </span>
                  </button>
                ))}
              </>
            )}

            {!showSearch ? (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold"
                style={{ color: 'var(--tn-accent)', border: '1px solid var(--tn-border)' }}
              >
                🔍 他の料理を探す
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="料理名で検索..."
                  className="mt-3 w-full rounded-2xl px-4 py-3 text-sm"
                  style={{
                    background: 'var(--tn-surface-soft)',
                    border: '1px solid var(--tn-border)',
                    color: 'var(--tn-text)',
                  }}
                  autoFocus
                />
                <div className="mt-2">
                  {filteredDishes.slice(0, 10).map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => handleSelectDish(dish.id)}
                      className="mb-1 flex w-full items-center rounded-2xl px-4 py-2 text-left"
                      style={{ color: 'var(--tn-text)' }}
                    >
                      <span className="text-sm">{dish.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Impression + photo */}
        {step === 'impression' && (
          <div className="px-5 pb-5">
            <p className="mb-3 text-sm font-bold" style={{ color: 'var(--tn-text)' }}>
              {selectedDishName}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handlePhoto}
              className="mb-4 flex w-full items-center justify-center rounded-2xl py-8"
              style={{
                background: 'var(--tn-surface-soft)',
                border: '2px dashed var(--tn-border)',
                color: 'var(--tn-text-sub)',
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="撮影した写真"
                  className="h-32 rounded-xl object-cover"
                />
              ) : (
                <span className="text-sm">📷 写真を撮る（任意）</span>
              )}
            </button>

            <div className="flex justify-center gap-4">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.rating}
                  type="button"
                  onClick={() => handleRate(opt.rating)}
                  className="flex flex-col items-center gap-1 rounded-2xl px-6 py-4"
                  style={{
                    background: 'var(--tn-surface)',
                    border: '1px solid var(--tn-border)',
                  }}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--tn-text-sub)' }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Completion */}
        {step === 'complete' && (
          <div className="flex flex-col items-center px-5 pb-8 pt-4">
            <p className="mb-2 text-4xl">🎉</p>
            <p className="mb-4 text-lg font-black" style={{ color: 'var(--tn-text)' }}>
              {selectedDishName}を記録しました！
            </p>

            <div
              className="mb-4 flex w-full flex-col items-center gap-2 rounded-2xl py-4"
              style={{ background: 'var(--tn-surface-soft)' }}
            >
              <p className="text-2xl font-black" style={{ color: 'var(--tn-accent)' }}>
                レパートリー {repertoireCount}品
              </p>
              <p className="text-sm" style={{ color: 'var(--tn-text-sub)' }}>
                累計 {cumulativeDays}日目
              </p>
              {remaining > 0 && (
                <p className="text-sm font-bold" style={{ color: 'var(--tn-accent)' }}>
                  あと{remaining}品で{nextMilestone}品！
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl py-3 text-sm font-bold text-white"
              style={{ background: 'var(--tn-accent)' }}
            >
              ホームに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
