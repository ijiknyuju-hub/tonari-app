export type Difficulty = 'easy' | 'stretch' | 'full'

export type Dish = {
  id: string
  name: string
  photo_url?: string
  variations: Variation[]
}

export type Variation = {
  id: string
  name: string
  description: string
  can_promote: boolean
}

export type NearbyRelation = {
  source: string
  target: string
  proximity: number
  tab: Difficulty
  description_line1: string
  description_line2: string
  new_ingredients: string[]
  rough_steps?: string[]
  cooking_time_minutes?: number
}

export type MadeRecord = {
  dish_id: string
  made_at: string
  rating: 'great' | 'ok' | 'meh'
  memo?: string
}

export type UserState = {
  selected_dishes: string[]
  bookmarked: string[]
  made_records: MadeRecord[]
  promoted_variations: string[]
}
