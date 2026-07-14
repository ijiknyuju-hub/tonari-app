'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/home', label: 'ホーム', icon: HomeIcon },
  { href: '/search', label: '探す', icon: SearchIcon },
  { href: '/repertoire', label: '料理帳', icon: RepertoireIcon },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-[#FFFFFF]"
      style={{ borderColor: 'rgba(26, 26, 26, 0.09)' }}
    >
      <div
        className="mx-auto grid max-w-[402px] grid-cols-3"
        style={{ padding: '9px 14px calc(24px + env(safe-area-inset-bottom))' }}
      >
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex min-h-[38px] flex-col items-center justify-start gap-1"
              style={{ color: active ? '#DE5528' : '#7A7570' }}
            >
              <Icon />
              <span className="text-[10.5px]" style={{ fontWeight: active ? 700 : 600 }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none">
      <path d="M3.5 11 12 4l8.5 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function RepertoireIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none">
      <path d="M4 4.5h6c1.5 0 2 1 2 2V20c0-1-.5-2-2-2H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 4.5h-6c-1.5 0-2 1-2 2V20c0-1 .5-2 2-2h6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
