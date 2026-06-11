import DishCardList from '@/components/phase0/DishCardList'
import { baseDishes } from '@/data/baseDishes'
import { recommendDishes } from '@/lib/phase0/recommendDishes'

type RecommendPageProps = {
  searchParams: Promise<{
    base?: string
  }>
}

export default async function RecommendPage({ searchParams }: RecommendPageProps) {
  const params = await searchParams
  const selectedIds = params.base?.split(',').filter(Boolean) ?? []
  const selectedDishes = baseDishes.filter((dish) => selectedIds.includes(dish.id))
  const recommendations = recommendDishes(selectedIds)

  return <DishCardList recommendations={recommendations} selectedDishes={selectedDishes} />
}
