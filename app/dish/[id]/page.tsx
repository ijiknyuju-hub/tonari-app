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
  const sourceDish = relation ? dishes.find((d) => d.id === relation.source) : undefined

  return (
    <>
      <DishDetailScreen
        relation={relation}
        dishId={id}
        targetName={targetDish?.name ?? id}
        sourceName={sourceDish?.name ?? relation?.source}
      />
      <BottomNav />
    </>
  )
}

// Generate static params for all target dish ids
export function generateStaticParams() {
  const targetIds = [...new Set(relations.map((r) => r.target))]
  return targetIds.map((id) => ({ id }))
}
