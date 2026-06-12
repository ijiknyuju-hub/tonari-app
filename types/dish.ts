export type Difficulty = 1 | 2 | 3

export type ClosenessLabel = 'かなり近い' | '少し変えれば作れる' | 'ちょっと挑戦'

export type BaseDish = {
  id: string
  title: string
}

export type DishCard = {
  id: string
  title: string
  baseDishIds: string[]
  image?: string
  shortCopy: string
  difficulty: Difficulty
  timeMinutes: number
  tags: string[]
  reusableSkills: string[]
  changedPoints: string[]
  extraIngredients: string[]
  roughSteps: string[]
  tasteAxis: string[]
  cookingMethod: string[]
  mainIngredients: string[]
}

export type SavedDish = {
  dishId: string
  savedAt: string
  madeAt?: string
}
