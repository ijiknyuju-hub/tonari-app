'use client'

import { useState } from 'react'
import { dishes } from '@/data/v3'

const DISH_EMOJI: Record<string, string> = {
  'curry': '🍛',
  'fried-rice': '🍳',
  'karaage': '🍗',
  'mapo-tofu': '🌶️',
  'napolitan': '🍝',
  'nikujaga': '🥘',
  'omurice': '🍳',
  'oyakodon': '🐔',
  'peperoncino': '🧄',
  'yakisoba': '🍜',
}

// First 10 dishes in the array are base dishes
const BASE_DISHES = dishes.filter((_, i) => i < 10)

interface BaseDishSelectorProps {
  onComplete: (selectedIds: string[]) => void
}

export default function BaseDishSelector({ onComplete }: BaseDishSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggleDish(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleProceed() {
    if (selectedIds.length === 0) return
    onComplete(selectedIds)
  }

  const canProceed = selectedIds.length > 0

  return (
    <main className="tn-screen">
      <div className="tn-container flex min-h-screen flex-col py-8">
        {/* Header */}
        <h1
          className="mb-2 text-xl font-black"
          style={{ color: 'var(--tn-text)' }}
        >
          作れる料理を選んでください
        </h1>
        <p
          className="mb-4 text-sm font-bold leading-6"
          style={{ color: 'var(--tn-text-sub)' }}
        >
          よく作る料理を選ぶと、あなたに近い料理が見つかります。
        </p>

        {/* Pinned chips area — only visible when ≥1 selected */}
        {selectedIds.length > 0 && (
          <div
            className="mb-4 flex flex-wrap gap-2 border-b pb-4"
            style={{ borderColor: 'var(--tn-border)' }}
          >
            {selectedIds.map((id) => {
              const dish = BASE_DISHES.find((d) => d.id === id)
              if (!dish) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold"
                  style={{
                    borderColor: 'var(--tn-accent)',
                    background: 'var(--tn-accent-soft)',
                    color: 'var(--tn-accent)',
                  }}
                >
                  <span>{DISH_EMOJI[id] ?? '🍽️'}</span>
                  <span>{dish.name}</span>
                </span>
              )
            })}
          </div>
        )}

        {/* 2-column grid of 10 cards */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {BASE_DISHES.map((dish) => {
            const selected = selectedIds.includes(dish.id)
            return (
              <button
                key={dish.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleDish(dish.id)}
                className="flex flex-col items-center rounded-2xl border px-3 py-4 text-center transition active:scale-95"
                style={{
                  borderColor: selected ? 'var(--tn-accent)' : 'var(--tn-border)',
                  background: selected ? 'var(--tn-accent-soft)' : 'var(--tn-surface)',
                  boxShadow: 'var(--tn-shadow-soft)',
                }}
              >
                <span className="mb-2 text-3xl">{DISH_EMOJI[dish.id] ?? '🍽️'}</span>
                <span
                  className="text-sm font-black leading-5"
                  style={{ color: selected ? 'var(--tn-accent)' : 'var(--tn-text)' }}
                >
                  {dish.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Count display */}
        <p
          className="mb-5 text-center text-sm font-bold"
          style={{ color: 'var(--tn-text-sub)' }}
        >
          {selectedIds.length}つ選択中
        </p>

        {/* Proceed button */}
        <button
          type="button"
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full rounded-2xl py-4 text-base font-black transition active:opacity-80 disabled:cursor-not-allowed"
          style={{
            background: canProceed ? 'var(--tn-accent)' : 'var(--tn-border)',
            color: canProceed ? '#ffffff' : 'var(--tn-text-sub)',
          }}
        >
          あなたのとなりごはんを探す
        </button>
      </div>
    </main>
  )
}
