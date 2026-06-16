import { notFound } from 'next/navigation'
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
  if (!relation) notFound()

  const targetDish = dishes.find((d) => d.id === id)
  const sourceDish = dishes.find((d) => d.id === relation.source)

  return (
    <>
      <DishDetailScreen
        relation={relation}
        targetName={targetDish?.name ?? id}
        sourceName={sourceDish?.name ?? relation.source}
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
