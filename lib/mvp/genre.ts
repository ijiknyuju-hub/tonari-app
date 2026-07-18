import type { Dish } from '@/types/dish'

export const GENRES = [
  { id: 'rice', label: 'ごはんもの' },
  { id: 'noodles', label: '麺類' },
  { id: 'main-meat', label: '主菜（肉）' },
  { id: 'main-fish', label: '主菜（魚）' },
  { id: 'main-egg-tofu', label: '主菜（卵・豆腐）' },
  { id: 'side', label: '副菜・おとも' },
  { id: 'soup', label: '汁もの' },
] as const

export type GenreId = (typeof GENRES)[number]['id']
export type Genre = (typeof GENRES)[number]

export const GENRE_BY_DISH_ID: Readonly<Record<string, GenreId>> = {
  curry: 'rice',
  'fried-rice': 'rice',
  karaage: 'main-meat',
  'mapo-tofu': 'main-egg-tofu',
  napolitan: 'noodles',
  nikujaga: 'main-meat',
  omurice: 'rice',
  oyakodon: 'rice',
  peperoncino: 'noodles',
  yakisoba: 'noodles',
  'anchovy-pasta': 'noodles',
  'ankake-yakisoba': 'noodles',
  arrabiata: 'noodles',
  'beef-stew': 'main-meat',
  bolognese: 'noodles',
  'butter-chicken-curry': 'rice',
  'chicken-katsu-don': 'rice',
  'chicken-nanban': 'main-meat',
  'chicken-rice-doria': 'rice',
  chikuzenni: 'main-meat',
  'clam-pasta': 'noodles',
  'curry-bread': 'side',
  'curry-rice-gratin': 'rice',
  'curry-soup': 'soup',
  'curry-udon': 'noodles',
  'curry-yakisoba': 'noodles',
  'dan-dan-noodles': 'noodles',
  'garlic-shrimp-pasta': 'noodles',
  'keema-curry': 'rice',
  'kimchi-fried-rice': 'rice',
  'mapo-curry': 'rice',
  'mapo-harusame': 'noodles',
  'mapo-nasu': 'main-egg-tofu',
  'mapo-tofu-hot-pot': 'soup',
  'napolitan-egg-wrap': 'noodles',
  'napolitan-meat-sauce': 'noodles',
  'napolitan-pizza-toast': 'side',
  'nikujaga-croquette': 'side',
  'omelette-rice-curry': 'rice',
  'omurice-demi': 'rice',
  'oyako-udon': 'noodles',
  'oyakodon-nabe': 'soup',
  'pad-thai': 'noodles',
  'paella-style-rice': 'rice',
  'pasta-al-limone': 'noodles',
  'peperoncino-cabbage': 'side',
  'pork-kimchi-udon': 'noodles',
  'potato-gratin': 'side',
  'salmon-fried-rice': 'rice',
  'stir-fry-rice-noodles': 'noodles',
  'takikomi-fried-rice': 'rice',
  'tandoori-chicken': 'main-meat',
  'tatsuta-age': 'main-meat',
  'tebasaki-karaage': 'main-meat',
  'thai-basil-rice': 'rice',
  tonjiru: 'soup',
  'tori-soboro-don': 'rice',
  'tori-ten': 'main-meat',
  'yakisoba-bread': 'side',
  'yakisoba-omelette': 'noodles',
  'yannyom-chicken': 'main-meat',
  yurinchi: 'main-meat',
  'cold-tofu': 'side',
  'cucumber-sunomono': 'side',
  'spinach-ohitashi': 'side',
  'bean-sprout-namul': 'side',
  'tomato-onion-marinade': 'side',
}

export function genreForDish(dish: Pick<Dish, 'id' | 'name'> | { id: string; name?: string } | string): GenreId {
  if (typeof dish === 'string') return GENRE_BY_DISH_ID[dish] ?? inferGenre(dish)
  return GENRE_BY_DISH_ID[dish.id] ?? inferGenre(dish.name ?? dish.id)
}

export function genreLabel(genreId: GenreId) {
  return GENRES.find((genre) => genre.id === genreId)?.label ?? '副菜・おとも'
}

export function genreForDishId(dishId: string) {
  return GENRE_BY_DISH_ID[dishId] ?? inferGenre(dishId)
}

export function groupDishesByGenre<T extends { id: string; name?: string }>(dishes: readonly T[]) {
  const groups = new Map<GenreId, T[]>()
  for (const genre of GENRES) groups.set(genre.id, [])
  for (const dish of dishes) groups.get(genreForDish(dish))?.push(dish)
  return GENRES.map((genre) => ({ ...genre, dishes: groups.get(genre.id) ?? [] }))
}

function inferGenre(name: string): GenreId {
  if (/(ごはん|丼|ライス|カレー|ドリア|チャーハン|パエリア)/.test(name)) return 'rice'
  if (/(パスタ|麺|うどん|そば|焼きそば|ナポリタン)/.test(name)) return 'noodles'
  if (/(汁|スープ|鍋)/.test(name)) return 'soup'
  if (/(豆腐|麻婆|卵|オムレツ)/.test(name)) return 'main-egg-tofu'
  if (/(魚|鮭|サーモン|さば|鯖)/.test(name)) return 'main-fish'
  if (/(鶏|肉|唐揚|揚げ|チキン|豚|牛|ハンバーグ|煮)/.test(name)) return 'main-meat'
  return 'side'
}
