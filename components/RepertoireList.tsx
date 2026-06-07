import { useState } from 'react'
import { getCategoryColor, getDishPhotoUrl } from '@/lib/photos'
import type { Dish } from '@/lib/types'

type RepertoireListProps = {
  dishes: Dish[]
  onOpenDish: (id: string) => void
}

export default function RepertoireList({ dishes, onOpenDish }: RepertoireListProps) {
  const cooked = dishes.filter((dish) => dish.status === 'cooked')
  const want = dishes.filter((dish) => dish.status === 'want')

  return (
    <section className="space-y-6">
      <DishSection title="作れる料理" dishes={cooked} onOpenDish={onOpenDish} />
      {want.length > 0 ? (
        <div className="opacity-60">
          <DishSection title="作りたい料理" dishes={want} onOpenDish={onOpenDish} />
        </div>
      ) : null}
    </section>
  )
}

function DishSection({
  title,
  dishes,
  onOpenDish,
}: {
  title: string
  dishes: Dish[]
  onOpenDish: (id: string) => void
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-zinc-900">{title}</h2>
      <div className="space-y-2">
        {dishes.map((dish) => (
          <button
            key={dish.id}
            type="button"
            onClick={() => onOpenDish(dish.id)}
            className="flex w-full items-center gap-4 rounded-[18px] border border-[#EEE6DD] bg-white p-3 text-left shadow-[0_2px_10px_rgba(56,41,25,0.08)]"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[10px]" style={{ backgroundColor: getCategoryColor(dish.category) }}>
              <Photo dish={dish} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[22px] font-black tracking-wide text-[#2A2521]">{dish.name}</p>
              <p className="mt-1 text-[15px] font-semibold text-[#5F5953]">
                {dish.category}・{'★'.repeat(dish.effort)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function Photo({ dish }: { dish: Dish }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div className="h-full w-full" style={{ backgroundColor: getCategoryColor(dish.category) }} />
  }

  return (
    <img
      src={getDishPhotoUrl(dish)}
      alt=""
      onError={() => setHasError(true)}
      className="h-full w-full object-cover"
    />
  )
}
