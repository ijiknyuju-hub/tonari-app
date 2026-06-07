const WISH_LIST_KEY = 'tonari_wish_list'
const COOKED_KEY = 'tonari_cooked'
const TRIED_VARIATIONS_KEY = 'tonari_tried_variations'

export const WISH_LIST_CHANGE_EVENT = 'tonari-wishlist-change'

export type WishItem = {
  id: string
  name: string
  addedAt: number
  done: boolean
}

export type TriedVariation = {
  base: string
  title: string
  result: 'done' | 'meh'
  triedAt: number
  promoted: boolean
}

function isWishItem(value: unknown): value is WishItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<WishItem>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.addedAt === 'number' &&
    typeof item.done === 'boolean'
  )
}

function isTriedVariation(value: unknown): value is TriedVariation {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<TriedVariation>
  return (
    typeof item.base === 'string' &&
    typeof item.title === 'string' &&
    (item.result === 'done' || item.result === 'meh') &&
    typeof item.triedAt === 'number' &&
    typeof item.promoted === 'boolean'
  )
}

function parseStringArray(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]')
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export function getWishList(): WishItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(WISH_LIST_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(isWishItem) : []
  } catch {
    return []
  }
}

export function addToWishList(id: string, name: string): void {
  const list = getWishList()
  if (list.some((item) => item.id === id)) return
  list.unshift({ id, name, addedAt: Date.now(), done: false })
  localStorage.setItem(WISH_LIST_KEY, JSON.stringify(list))
}

export function toggleWishItem(id: string): void {
  const list = getWishList().map((item) => {
    if (item.id !== id) return item
    const done = !item.done
    if (done) addToCooked(item.id)
    else removeFromCooked(item.id)
    return { ...item, done }
  })
  localStorage.setItem(WISH_LIST_KEY, JSON.stringify(list))
}

export function removeWishItem(id: string): void {
  const list = getWishList().filter((item) => item.id !== id)
  localStorage.setItem(WISH_LIST_KEY, JSON.stringify(list))
}

export function getCookedIds(): string[] {
  if (typeof window === 'undefined') return []
  return parseStringArray(localStorage.getItem(COOKED_KEY))
}

export function clearCookedIds(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(COOKED_KEY)
}

export function getTriedVariations(): TriedVariation[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(TRIED_VARIATIONS_KEY) || '[]'
    )
    return Array.isArray(parsed) ? parsed.filter(isTriedVariation) : []
  } catch {
    return []
  }
}

export function recordVariation(
  base: string,
  title: string,
  result: 'done' | 'meh'
): void {
  const list = upsertTriedVariation(getTriedVariations(), {
    base,
    title,
    result,
    triedAt: Date.now(),
    promoted: false,
  })
  localStorage.setItem(TRIED_VARIATIONS_KEY, JSON.stringify(list))
}

export function promoteVariation(
  base: string,
  title: string,
  promoteToId: string,
  promoteToName: string
): void {
  addToWishList(promoteToId, promoteToName)

  const current = getTriedVariations()
  const existing = current.find((item) => item.base === base && item.title === title)
  const list = upsertTriedVariation(current, {
    base,
    title,
    result: existing?.result ?? 'done',
    triedAt: existing?.triedAt ?? Date.now(),
    promoted: true,
  })
  localStorage.setItem(TRIED_VARIATIONS_KEY, JSON.stringify(list))
}

function addToCooked(id: string): void {
  const list = getCookedIds()
  if (!list.includes(id)) {
    list.push(id)
    localStorage.setItem(COOKED_KEY, JSON.stringify(list))
  }
}

function removeFromCooked(id: string): void {
  const list = getCookedIds().filter((item) => item !== id)
  localStorage.setItem(COOKED_KEY, JSON.stringify(list))
}

function upsertTriedVariation(
  list: TriedVariation[],
  nextItem: TriedVariation
): TriedVariation[] {
  const next = list.filter(
    (item) => item.base !== nextItem.base || item.title !== nextItem.title
  )
  next.unshift(nextItem)
  return next
}
