'use client'

import { FormEvent, useState } from 'react'
import { CATEGORIES, PRESET_DISHES, type Category } from '@/lib/presets'

interface AddDishPanelProps {
  cookedCount: number
  recentDishes: string[]
  onAddDish: (dish: string) => void
  onAddPreset: (dishName: string) => void
  isLoading: boolean
}

export default function AddDishPanel({
  cookedCount,
  recentDishes,
  onAddDish,
  onAddPreset,
  isLoading,
}: AddDishPanelProps) {
  const [dish, setDish] = useState('')
  const [openCategories, setOpenCategories] = useState<Record<Category, boolean>>(() =>
    CATEGORIES.reduce(
      (result, category, index) => ({
        ...result,
        [category]: index === 0,
      }),
      {} as Record<Category, boolean>,
    ),
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextDish = dish.trim()

    if (!nextDish || isLoading) {
      return
    }

    onAddDish(nextDish)
    setDish('')
  }

  function toggleCategory(category: Category) {
    setOpenCategories((current) => ({
      ...current,
      [category]: !current[category],
    }))
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-zinc-200 bg-white px-5 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#315E3D]">となりごはん</h1>
        <p className="mt-2 text-sm text-zinc-500">作れる料理: {cookedCount}品</p>
      </div>

      <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
        <input
          value={dish}
          onChange={(event) => setDish(event.target.value)}
          placeholder="料理名を入力（例：唐揚げ）"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-[#5C9E6E] focus:ring-2 focus:ring-[#A8D5B5]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5C9E6E] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#4D865D] disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : null}
          + 追加
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          プリセットから追加
        </h2>
        <div className="mt-3 space-y-4">
          {CATEGORIES.map((category) => {
            const dishes = PRESET_DISHES.filter((presetDish) => presetDish.category === category)
            const isOpen = openCategories[category]

            return (
              <div key={category}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between text-xs font-bold text-zinc-400"
                >
                  <span>{category}</span>
                  <span>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dishes.map((presetDish) => (
                      <button
                        key={presetDish.name}
                        type="button"
                        onClick={() => onAddPreset(presetDish.name)}
                        disabled={isLoading}
                        className="rounded-full bg-[#F3F4F6] px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-[#A8D5B5] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {presetDish.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-400">最近追加</h2>
        {recentDishes.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {recentDishes.slice(0, 5).map((name) => (
              <li key={name} className="rounded-md bg-[#F3F4F6] px-3 py-2 text-sm text-zinc-700">
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">まだありません</p>
        )}
      </div>
    </aside>
  )
}
