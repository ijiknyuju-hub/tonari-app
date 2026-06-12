'use client'

import { trackEvent } from '@/lib/phase0/analytics'

const FIRST_VISIT_KEY = 'tonari.v28.firstVisitAt'
const LAST_VISIT_KEY = 'tonari.v28.lastVisitAt'
const DAY_MS = 24 * 60 * 60 * 1000

export type ReturnVisitDaysBucket = '1-2d' | '3-7d' | '8d+'

export function recordVisit() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const now = new Date()
    const nowIso = now.toISOString()
    const firstVisitAt = readStoredDate(FIRST_VISIT_KEY)
    const lastVisitAt = readStoredDate(LAST_VISIT_KEY)

    if (!firstVisitAt || !lastVisitAt) {
      writeVisitDates(nowIso, nowIso)
      return
    }

    const elapsedMs = now.getTime() - lastVisitAt.getTime()
    if (elapsedMs >= DAY_MS) {
      trackEvent('return_visit', { daysBucket: getDaysBucket(elapsedMs) })
    }

    window.localStorage.setItem(LAST_VISIT_KEY, nowIso)
  } catch {
    // Analytics must never interfere with app usage. Resetting may fail in
    // restricted storage modes, so keep the failure contained.
  }
}

function readStoredDate(key: string): Date | null {
  const value = window.localStorage.getItem(key)
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    window.localStorage.removeItem(key)
    return null
  }

  return date
}

function writeVisitDates(firstVisitAt: string, lastVisitAt: string) {
  window.localStorage.setItem(FIRST_VISIT_KEY, firstVisitAt)
  window.localStorage.setItem(LAST_VISIT_KEY, lastVisitAt)
}

function getDaysBucket(elapsedMs: number): ReturnVisitDaysBucket {
  const elapsedDays = elapsedMs / DAY_MS

  if (elapsedDays < 3) {
    return '1-2d'
  }

  if (elapsedDays < 8) {
    return '3-7d'
  }

  return '8d+'
}
