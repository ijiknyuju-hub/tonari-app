'use client'

import { track } from '@vercel/analytics'

export type EventName =
  | 'page_view'
  | 'start_select_dishes'
  | 'select_base_dish'
  | 'show_recommendations'
  | 'open_dish_card'
  | 'bookmark'
  | 'mark_made'
  | 'open_map'
  | 'open_ingredients'
  | 'return_visit'

export type EventParams = {
  dishId?: string
  count?: number
  tab?: string
  daysBucket?: string
}

export function trackEvent(name: EventName, params?: EventParams) {
  if (typeof window === 'undefined') return

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[tonari:event]', name, params ?? {})
  }

  try {
    track(name, params)
  } catch {
    // silently ignore in production
  }
}
