'use client'

import { useEffect } from 'react'
import { recordVisit } from '@/lib/mvp/visitTracking'

let hasRecordedVisit = false

export function VisitTracker() {
  useEffect(() => {
    if (hasRecordedVisit) {
      return
    }

    hasRecordedVisit = true
    recordVisit()
  }, [])

  return null
}
