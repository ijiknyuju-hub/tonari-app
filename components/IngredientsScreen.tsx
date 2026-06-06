import { useMemo, useState } from 'react'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { Dish, DishStatus } from '@/lib/types'

type IngredientsScreenProps = {
  dishes: Dish[]
  onOpenDish: (id: string) => void
}

const COMMON_INGREDIENTS = [
  '豚肉',
  '鶏肉',
  '牛肉',
  '卵',
  '豆腐',
  '玉ねぎ',
  'にんじん',
  'じゃがいも',
  'キャベツ',
  'なす',
  'ピーマン',
  'きのこ',
  'トマト',
  '米',
  '麺',
  '味噌',
]

export default function IngredientsScreen({ dishes, onOpenDish }: IngredientsScreenProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<DishStatus>('cooked')

  const visibleIngredients = useMemo(() => {
    const text = searchText.trim().toLowerCase()
    if (!text) return COMMON_INGREDIENTS
    return COMMON_INGREDIENTS.filter((ingredient) => ingredient.toLowerCase().includes(text))
  }, [searchText])

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (dish.status !== activeTab) return false
      if (selectedIngredients.length === 0) return true

      const target = `${dish.name} ${dish.axes.ingredient} ${dish.ingredients ?? ''} ${dish.newIngredients ?? ''}`
      return selectedIngredients.every((ingredient) => target.includes(ingredient))
    })
  }, [activeTab, dishes, selectedIngredients])

  function toggleIngredient(ingredient: string) {
    setSelectedIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">食材から探す</h2>
        <p className="mt-1 text-sm text-zinc-500">手元にある食材で作れる料理を絞り込みます。</p>
      </div>
      <label className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3">
        <span className="text-zinc-400">🔍</span>
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="食材を検索"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleIngredients.map((ingredient) => {
          const isSelected = selectedIngredients.includes(ingredient)

          return (
            <button
              key={ingredient}
              type="button"
              onClick={() => toggleIngredient(ingredient)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                isSelected
                  ? 'border-[#E8611A] bg-[#E8611A] text-white'
                  : 'border-zinc-200 bg-white text-zinc-700'
              }`}
            >
              {ingredient}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 rounded-full bg-zinc-100 p-1">
        {[
          { id: 'cooked' as const, label: '作れる' },
          { id: 'want' as const, label: '作りたい' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-3 py-2 text-sm font-semibold ${
              activeTab === tab.id ? 'bg-white text-[#E8611A] shadow-sm' : 'text-zinc-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredDishes.map((dish) => (
          <button
            key={dish.id}
            type="button"
            onClick={() => onOpenDish(dish.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left"
          >
            <div
              className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"
              style={{ backgroundColor: getCategoryColor(dish.category) }}
            >
              <img src={getDishPhotoUrl(dish)} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900">{dish.name}</p>
              <p className="truncate text-xs text-zinc-500">{dish.axes.ingredient || dish.category}</p>
            </div>
          </button>
        ))}
        {filteredDishes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-5 text-center text-sm text-zinc-500">
            条件に合う料理がまだありません。
          </div>
        ) : null}
      </div>
    </section>
  )
}
