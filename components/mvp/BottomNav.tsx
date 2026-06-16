'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/home', label: '今日のおすすめ', icon: HomeIcon },
  { href: '/map', label: '広がりマップ', icon: MapIcon },
  { href: '/ingredients', label: '食材から探す', icon: BasketIcon },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--tn-border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <p className="py-1 text-center text-[10px] font-bold" style={{ color: 'var(--tn-text-sub)' }}>
        試作版です — ご意見お待ちしています
      </p>
      <div className="mx-auto grid max-w-md grid-cols-3">
        {ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-extrabold"
              style={{ color: active ? 'var(--tn-accent)' : 'var(--tn-text-sub)' }}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10.5V20h13v-9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 20v-5h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="12" cy="17" r="2.5" />
      <path d="m8.2 8.2 7.5 5.8M15.8 9.4l-2.6 5.3M8 8.9l2.6 5.8" strokeLinecap="round" />
    </svg>
  )
}

function BasketIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 10h12l-1.2 9H7.2L6 10Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10 12 4l3 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14v2.5M12 14v2.5M15 14v2.5" strokeLinecap="round" />
    </svg>
  )
}
