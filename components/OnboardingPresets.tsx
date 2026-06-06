import { useState } from 'react'
import { PRESET_DISHES } from '@/lib/presets'
import type { Dish } from '@/lib/types'

type OnboardingPresetsProps = {
  onComplete: (selected: Dish[]) => void
}

function getCategoryColor(category: string): string {
  if (category === '炒め物') return '#FFE8D0'
  if (category === '煮物') return '#E8F0E0'
  if (category === '揚げ物') return '#FFF5D0'
  if (category === '焼き物') return '#FFF0E8'
  if (category === 'ご飯もの') return '#E8F5FF'
  return '#F0F0F0'
}

const presets = PRESET_DISHES.filter((dish) => dish.status === 'cooked' && dish.axes.seasoning !== '')

export default function OnboardingPresets({ onComplete }: OnboardingPresetsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const canComplete = selectedIds.size >= 3

  function toggleDish(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  function handleComplete() {
    if (!canComplete) return

    const cookedAt = new Date().toISOString()
    const selected = presets
      .filter((dish) => selectedIds.has(dish.id))
      .map((dish) => ({ ...dish, cookedAt, status: 'cooked' as const }))

    onComplete(selected)
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-zinc-900">作ったことがある料理を選んでね</h1>
        <p className="mt-2 text-sm text-zinc-500">近い料理を出すために、まずは3品から始めます。</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {presets.map((dish) => {
          const isSelected = selectedIds.has(dish.id)

          return (
            <button
              key={dish.id}
              type="button"
              onClick={() => toggleDish(dish.id)}
              className={`rounded-xl border bg-white p-3 text-left ${
                isSelected ? 'border-[#E8611A] ring-2 ring-[#E8611A]/20' : 'border-zinc-200'
              }`}
            >
              <div
                className="mb-3 h-16 rounded-lg"
                style={{ backgroundColor: getCategoryColor(dish.category) }}
              />
              <p className="text-sm font-semibold text-zinc-900">{dish.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{dish.category}</p>
            </button>
          )
        })}
      </div>
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white p-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            disabled={!canComplete}
            onClick={handleComplete}
            className={`w-full rounded-full px-4 py-3 text-sm font-bold text-white ${
              canComplete ? 'bg-[#E8611A]' : 'cursor-not-allowed bg-zinc-300'
            }`}
          >
            {canComplete ? `${selectedIds.size}品で始める` : `あと${3 - selectedIds.size}品選んでね`}
          </button>
        </div>
      </div>
    </main>
  )
}
