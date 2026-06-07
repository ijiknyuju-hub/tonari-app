import { useState } from 'react'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import { PRESET_DISHES } from '@/lib/presets'
import type { Dish } from '@/lib/types'

type OnboardingPresetsProps = {
  onComplete: (selected: Dish[]) => void
}

const presets = PRESET_DISHES.filter((dish) => dish.status === 'cooked' && dish.axes.seasoning !== '').slice(0, 8)

export default function OnboardingPresets({ onComplete }: OnboardingPresetsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(presets.slice(0, 3).map((dish) => dish.id)))
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
    <main className="mx-auto min-h-screen max-w-md bg-[#FFFDF8] px-6 pb-40 pt-14 text-[#211D1A] sm:max-w-lg">
      <div className="mb-14 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#F24812]" />
          <span className="h-1 w-12 bg-[#F24812]" />
          <span className="h-3 w-3 rounded-full bg-[#D8D8D8]" />
          <span className="h-1 w-12 bg-[#D8D8D8]" />
          <span className="h-3 w-3 rounded-full bg-[#D8D8D8]" />
          <span className="h-1 w-12 bg-[#D8D8D8]" />
          <span className="h-3 w-3 rounded-full bg-[#D8D8D8]" />
        </div>
      </div>

      <header className="mb-9 text-center">
        <h1 className="text-[34px] font-black leading-tight tracking-wide sm:text-[38px]">作れる料理を選んでね</h1>
        <p className="mt-6 text-[23px] font-medium tracking-wide text-[#79736D]">3〜5品くらいから始めよう</p>
      </header>

      <div className="grid grid-cols-2 gap-x-7 gap-y-7">
        {presets.map((dish) => {
          const isSelected = selectedIds.has(dish.id)

          return (
            <button
              key={dish.id}
              type="button"
              onClick={() => toggleDish(dish.id)}
              className={`overflow-hidden rounded-[16px] border-2 bg-white text-center shadow-[0_2px_10px_rgba(56,41,25,0.12)] transition ${
                isSelected ? 'border-[#F24812] bg-[#FFF0DC]' : 'border-[#E6E0D8]'
              }`}
            >
              <div className="h-[132px] p-1" style={{ backgroundColor: getCategoryColor(dish.category) }}>
                <Photo dish={dish} className="h-full w-full rounded-[10px] object-cover" />
              </div>
              <p className="px-2 py-4 text-[25px] font-black tracking-wide text-[#211D1A]">{dish.name}</p>
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#FFFDF8] via-[#FFFDF8] to-transparent px-6 pb-6 pt-10">
        <div className="mx-auto max-w-md sm:max-w-lg">
          <button
            type="button"
            disabled={!canComplete}
            onClick={handleComplete}
            className={`w-full rounded-[12px] px-4 py-5 text-[26px] font-black text-white shadow-[0_4px_12px_rgba(242,72,18,0.24)] sm:text-[30px] ${
              canComplete ? 'bg-[#F24812]' : 'cursor-not-allowed bg-[#CFC8BF]'
            }`}
          >
            {selectedIds.size}品で始める
          </button>
        </div>
      </div>
    </main>
  )
}

function Photo({ dish, className }: { dish: Dish; className: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div className={className} style={{ backgroundColor: getCategoryColor(dish.category) }} />
  }

  return <img src={getDishPhotoUrl(dish)} alt="" onError={() => setHasError(true)} className={className} />
}
