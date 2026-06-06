export type Effort = 1 | 2 | 3

export interface DishAxes {
  seasoning: string
  ingredient: string
  method: string
}

export interface Arrangement {
  id: string
  name: string
  reason: string
  type: 'generic' | 'specific'
}

export type DishStatus = 'cooked' | 'want'

export interface Dish {
  id: string
  name: string
  category: string
  axes: DishAxes
  effort: Effort
  summary?: string
  fromDishId?: string | null
  changePoint?: string
  newIngredients?: string
  ingredients?: string
  steps?: string
  referenceUrl?: string
  note?: string
  photoUri?: string
  arrangements: Arrangement[]
  status: DishStatus
  cookedAt?: string
  createdAt: string
}

export interface AppState {
  dishes: Dish[]
  lastUpdated: string
}
