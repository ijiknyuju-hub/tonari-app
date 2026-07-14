import { relations, dishes } from '@/data/v3'
import DishDetailScreen from '@/components/mvp/DishDetailScreen'
import BottomNav from '@/components/mvp/BottomNav'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DishDetailPage({ params }: Props) {
  const { id } = await params

  // Find the relation where this dish is the target
  const relation = relations.find((r) => r.target === id)
  const targetDish = dishes.find((d) => d.id === id)

  return (
    <>
      <DishDetailScreen
        relation={relation}
        dishId={id}
        targetName={targetDish?.name ?? id}
      />
      <BottomNav />
    </>
  )
}

// Generate static params for all target dish ids
export function generateStaticParams() {
  return dishes.map((dish) => ({ id: dish.id }))
}
