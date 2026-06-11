'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/phase0/analytics'

export default function StartSelectDishesLink() {
  return (
    <Link
      href="/select"
      onClick={() => trackEvent('start_select_dishes')}
      className="phase0-primary-button flex items-center justify-center px-5 text-center text-lg font-black transition hover:bg-[#d95512] focus:outline-none focus:ring-4 focus:ring-[#E8611A]/25"
    >
      作れる料理を選ぶ
    </Link>
  )
}
