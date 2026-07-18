import type { MadeRecord } from '@/types/dish'

export type DishRank = 'made' | 'regular' | 'specialty' | null

export const RANK_LABELS: Readonly<Record<Exclude<DishRank, null>, string>> = {
  made: '作った',
  regular: '定番',
  specialty: '十八番',
}

export function deriveRank(recordCount: number): DishRank {
  const count = Math.max(0, Math.floor(recordCount))
  if (count === 0) return null
  if (count >= 3) return 'specialty'
  if (count >= 2) return 'regular'
  return 'made'
}

export function madeCountForDish(records: readonly MadeRecord[], dishId: string) {
  return records.reduce((count, record) => count + (record.dish_id === dishId ? 1 : 0), 0)
}

export function rankForDish(records: readonly MadeRecord[], dishId: string) {
  return deriveRank(madeCountForDish(records, dishId))
}

export function latestMadeAt(records: readonly MadeRecord[], dishId: string) {
  return records
    .filter((record) => record.dish_id === dishId)
    .map((record) => record.made_at)
    .sort((left, right) => right.localeCompare(left))[0]
}

export function formatLastMade(value: string | Date | null | undefined, now = new Date()) {
  if (!value) return 'まだ作っていません'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return 'まだ作っていません'

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMadeDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.floor((startOfToday.getTime() - startOfMadeDay.getTime()) / 86_400_000)

  if (days <= 0) return '今日'
  if (days === 1) return '昨日'
  if (days < 7) return `${days}日前`
  if (days < 14) return '先週'
  if (days < 28) return `${Math.floor(days / 7)}週間前`
  if (days < 60) return '先月'
  if (days < 365) return `${Math.floor(days / 30)}か月前`
  if (days < 730) return '去年'
  return `${Math.floor(days / 365)}年前`
}
