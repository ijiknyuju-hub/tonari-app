import { useMemo, useState } from 'react'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { Dish, DishStatus } from '@/lib/types'

type IngredientsScreenProps = {
  dishes: Dish[]
  onOpenDish: (id: string) => void
}

const COMMON_INGREDIENTS = ['豚こま', '鶏むね', '卵', 'キャベツ', '玉ねぎ']

export default function IngredientsScreen({ dishes, onOpenDish }: IngredientsScreenProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['豚こま'])
  const [activeTab, setActiveTab] = useState<DishStatus>('cooked')

  const visibleIngredients = useMemo(() => {
    const text = searchText.trim().toLowerCase()
    if (!text) return COMMON_INGREDIENTS
    return COMMON_INGREDIENTS.filter((ingredient) => ingredient.toLowerCase().includes(text))
  }, [searchText])

  const filteredDishes = useMemo(() => {
    const matches = dishes.filter((dish) => {
      if (dish.status !== activeTab) return false
      if (selectedIngredients.length === 0) return true

      const target = `${dish.name} ${dish.axes.ingredient} ${dish.ingredients ?? ''} ${dish.newIngredients ?? ''}`
      return selectedIngredients.every((ingredient) => target.includes(ingredient))
    })

    return matches.length > 0 ? matches : dishes.filter((dish) => dish.status === activeTab).slice(0, 6)
  }, [activeTab, dishes, selectedIngredients])

  function toggleIngredient(ingredient: string) {
    setSelectedIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  return (
    <section className="-mx-1 space-y-6 pb-3 pt-1">
      <h1 className="px-1 text-[32px] font-black tracking-wide text-[#F24812]">食材から探す</h1>

      <label className="flex h-16 items-center gap-4 rounded-[20px] border border-[#D6D0C9] bg-white px-5 shadow-sm">
        <span className="text-[34px] leading-none text-[#5F5F5F]">⌕</span>
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="食材を入力（例: 豚こま、玉ねぎ）"
          className="min-w-0 flex-1 bg-transparent text-[20px] font-bold text-[#2A2521] outline-none placeholder:text-[#817B75]"
        />
      </label>

      <div className="space-y-4">
        <h2 className="px-1 text-[22px] font-black tracking-wide text-[#2A2521]">最近よく使う食材</h2>
        <div className="flex flex-wrap gap-3">
          {visibleIngredients.map((ingredient) => {
            const isSelected = selectedIngredients.includes(ingredient)

            return (
              <button
                key={ingredient}
                type="button"
                onClick={() => toggleIngredient(ingredient)}
                className={`h-12 rounded-full border px-5 text-[17px] font-bold shadow-sm transition ${
                  isSelected
                    ? 'border-[#F24812] bg-[#F24812] text-white'
                    : 'border-[#BDB7B0] bg-white text-[#2A2521]'
                }`}
              >
                {ingredient}
              </button>
            )
          })}
        </div>
        {selectedIngredients.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {selectedIngredients.map((ingredient) => (
              <button
                key={ingredient}
                type="button"
                onClick={() => toggleIngredient(ingredient)}
                className="h-11 rounded-full border border-[#F24812] bg-white px-5 text-[16px] font-bold text-[#F24812] shadow-sm"
              >
                {ingredient} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 border-b border-[#D8D0C7] pt-1">
        {[
          { id: 'cooked' as const, label: '作ったことがある' },
          { id: 'want' as const, label: '作りたいリスト' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-4 pb-4 text-[18px] font-black ${
              activeTab === tab.id
                ? 'border-[#F24812] text-[#F24812]'
                : 'border-transparent text-[#2A2521]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filteredDishes.map((dish) => (
          <button
            key={dish.id}
            type="button"
            onClick={() => onOpenDish(dish.id)}
            className="min-w-0 overflow-hidden rounded-[14px] border border-[#EEE6DD] bg-white text-left shadow-[0_2px_10px_rgba(56,41,25,0.10)]"
          >
            <div className="h-[104px]" style={{ backgroundColor: getCategoryColor(dish.category) }}>
              <Photo dish={dish} className="h-full w-full object-cover" />
            </div>
            <div className="px-3 py-3">
              <p className="truncate text-[17px] font-black tracking-wide text-[#2A2521]">{dish.name}</p>
              <p className="mt-2 text-[15px] tracking-widest">
                <span className="text-[#F24812]">{'★'.repeat(dish.effort)}</span>
                <span className="text-[#9A948D]">{'★'.repeat(3 - dish.effort)}</span>
              </p>
            </div>
          </button>
        ))}
        {filteredDishes.length === 0 ? (
          <div className="col-span-3 rounded-[18px] border border-dashed border-[#D8D0C7] bg-white p-6 text-center text-[15px] font-semibold text-[#6D6258]">
            条件に合う料理がまだありません
          </div>
        ) : null}
      </div>
    </section>
  )
}

function Photo({ dish, className }: { dish: Dish; className: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div className={className} style={{ backgroundColor: getCategoryColor(dish.category) }} />
  }

  return <img src={getDishPhotoUrl(dish)} alt="" onError={() => setHasError(true)} className={className} />
}
