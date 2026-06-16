import { relations } from '@/data/v3'
import type { Difficulty, NearbyRelation } from '@/types/dish'

export type HomeMode = Difficulty

export function todaysPick(
  selectedDishIds: string[],
  mode: HomeMode,
  dateISO: string,
): NearbyRelation | null {
  const candidates = relations.filter(
    (r) => r.tab === mode && selectedDishIds.includes(r.source),
  )
  if (candidates.length === 0) return null
  const index = stableHash(`${dateISO}:${mode}:${selectedDishIds.join(',')}`) % candidates.length
  return candidates[index] ?? null
}

function stableHash(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}
