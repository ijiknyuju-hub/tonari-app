import type { Dish } from '@/lib/types'

type RepertoireListProps = {
  dishes: Dish[]
  onOpenDish: (id: string) => void
}

function getCategoryColor(category: string): string {
  if (category === '炒め物') return '#FFE8D0'
  if (category === '煮物') return '#E8F0E0'
  if (category === '揚げ物') return '#FFF5D0'
  if (category === '焼き物') return '#FFF0E8'
  if (category === 'ご飯もの') return '#E8F5FF'
  return '#F0F0F0'
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
            className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left"
          >
            <div
              className="h-10 w-10 shrink-0 rounded"
              style={{ backgroundColor: getCategoryColor(dish.category) }}
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900">{dish.name}</p>
              <p className="text-xs text-zinc-500">
                {dish.category}・{'★'.repeat(dish.effort)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
