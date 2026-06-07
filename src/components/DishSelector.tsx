'use client'

import { useMemo, useState } from 'react'
import { Dish, getSelectableDishesByCategory, getDishById } from '@/lib/recommend'

const CATEGORY_EMOJI: Record<string, string> = {
  揚げ物: '🍗',
  炒め物: '🥘',
  煮物: '🍲',
  煮込み: '🫕',
  焼き物: '🍳',
  麺類: '🍜',
  ご飯物: '🍚',
  丼物: '🍛',
  汁物: '🥣',
  蒸し物: '🥟',
  オーブン: '🫙',
  エスニック: '🌮',
  副菜: '🥗',
  鍋物: '🍲',
  朝食: '🍳',
}

type Props = {
  onConfirm: (selected: Dish[]) => void
  initialSelectedIds?: string[]
}

export default function DishSelector({ onConfirm, initialSelectedIds }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelectedIds ?? [])
  )
  // B3 fix: only show dishes with outgoing edges
  // Performance: compute once since data is static
  const byCategory = useMemo(() => getSelectableDishesByCategory(), [])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 3) {
        next.add(id)
      }
      return next
    })
  }

  function handleConfirm() {
    const selectedDishes = Array.from(selected)
      .map((id) => getDishById(id))
      .filter((d): d is Dish => d !== undefined)
    onConfirm(selectedDishes)
  }

  const selectableCount = Object.values(byCategory).flat().length

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FF6B35] text-white px-4 py-4 shadow-md">
        <h1 className="text-xl font-bold">となりごはん</h1>
        <p className="text-sm opacity-90 mt-1">
          よく作る料理を <span className="font-bold text-lg">3つ</span> 選んでください
        </p>
        <p className="text-xs opacity-70 mt-0.5">{selectableCount}品から選べます</p>
        <p className="sr-only" aria-live="polite">
          3つ中{selected.size}つ選択済みです
        </p>
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < selected.size ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dish list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {Object.entries(byCategory).map(([category, dishes]) => (
          <div key={category} className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
              <span>{CATEGORY_EMOJI[category] ?? '🍽️'}</span>
              {category}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {dishes.map((dish) => {
                const isSelected = selected.has(dish.id)
                const isDisabled = !isSelected && selected.size >= 3
                return (
                  <button
                    key={dish.id}
                    onClick={() => toggle(dish.id)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    className={`
                      relative min-h-12 px-2 py-3 rounded-xl text-sm font-medium text-center leading-snug
                      transition-all duration-150 border-2
                      ${
                        isSelected
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-md scale-105'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 border-transparent'
                          : 'bg-white text-gray-700 border-gray-200 active:scale-95'
                      }
                    `}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 text-xs">✓</span>
                    )}
                    {dish.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* B4 fix: Footer constrained within max-w-430px container */}
      <div className="sticky bottom-0 px-4 py-4 bg-[#FFF8F0] border-t border-gray-200">
        <button
          onClick={handleConfirm}
          disabled={selected.size < 3}
          className={`
            w-full py-4 rounded-2xl text-white font-bold text-lg
            transition-all duration-200
            ${
              selected.size >= 3
                ? 'bg-[#FF6B35] shadow-lg active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {selected.size >= 3 ? 'おすすめを見る →' : `あと ${3 - selected.size} つ選んでください`}
        </button>
      </div>
    </div>
  )
}
