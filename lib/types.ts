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

export interface RecipeNode {
  id: string
  name: string
  status: 'cooked' | 'want' | 'suggested'
  type: 'base' | 'variation' | 'adjacent'
  parentId: string | null
  reason: string
  position: { x: number; y: number }
  createdAt: string
  category?: string
  ingredients?: string
  steps?: string
  referenceUrl?: string
  isPreset?: boolean
}

export interface RecipeEdge {
  id: string
  source: string
  target: string
  label?: string
  edgeType?: string
}

export interface AppStateLegacy {
  nodes: RecipeNode[]
  edges: RecipeEdge[]
  lastUpdated: string
}
