'use client'

import { track } from '@vercel/analytics'

export type Phase0EventName =
  | 'page_view'
  | 'start_select_dishes'
  | 'select_base_dish'
  | 'show_recommendations'
  | 'open_dish_card'
  | 'click_want_to_make'
  | 'open_saved_list'

export type Phase0EventParams = {
  dishId?: string
  count?: number
}

export function trackEvent(name: Phase0EventName, params?: Phase0EventParams) {
  if (typeof window === 'undefined') {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[phase0:event]', name, params ?? {})
  }

  try {
    track(name, params)
  } catch {
    if (process.env.NODE_ENV === 'production') {
      return
    }
  }
}
