'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/phase0/analytics'

export default function StartSelectDishesLink() {
  return (
    <Link
      href="/select"
      onClick={() => trackEvent('start_select_dishes')}
      className="flex min-h-14 items-center justify-center rounded-2xl bg-[#E8611A] px-5 text-center text-base font-black text-white shadow-[0_14px_30px_rgba(232,97,26,0.25)] transition hover:bg-[#d95512] focus:outline-none focus:ring-4 focus:ring-[#E8611A]/25"
    >
      作れる料理を選ぶ
    </Link>
  )
}
