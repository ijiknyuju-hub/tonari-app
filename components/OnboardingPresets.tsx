import { useState } from 'react'
import { PRESET_DISHES } from '@/lib/presets'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { Dish } from '@/lib/types'

type OnboardingPresetsProps = {
  onComplete: (selected: Dish[]) => void
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
        <div className="mb-5 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#E8611A]" />
          <span className="h-2 w-2 rounded-full bg-zinc-200" />
          <span className="h-2 w-2 rounded-full bg-zinc-200" />
        </div>
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
              className={`overflow-hidden rounded-xl border bg-white text-left transition ${
                isSelected ? 'border-[#E8611A] ring-2 ring-[#E8611A] ring-offset-2' : 'border-zinc-200'
              }`}
            >
              <div className="h-24" style={{ backgroundColor: getCategoryColor(dish.category) }}>
                <img src={getDishPhotoUrl(dish)} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="p-3 text-sm font-semibold text-zinc-900">{dish.name}</p>
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
