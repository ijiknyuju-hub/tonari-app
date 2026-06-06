import type { Dish } from './types'

const CATEGORY_COLORS: Record<string, string> = {
  炒め物: '#FFE8D0',
  煮物: '#E8F0E0',
  揚げ物: '#FFF5D0',
  焼き物: '#FFF0E8',
  ご飯もの: '#E8F5FF',
  麺: '#F3E8FF',
  汁物: '#E0F2FE',
  サラダ: '#DCFCE7',
}

const CATEGORY_PHOTOS: Record<string, string> = {
  炒め物: 'stir-fry',
  煮物: 'japanese-soup',
  揚げ物: 'tempura',
  焼き物: 'grilled-food',
  ご飯もの: 'japanese-rice-bowl',
  麺: 'noodles',
  汁物: 'miso-soup',
  サラダ: 'salad',
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#F4F4F5'
}

export function getDishPhotoUrl(dish: Dish): string {
  if (dish.photoUri) return dish.photoUri

  return `/images/dishes/${dish.id}.png`
}
