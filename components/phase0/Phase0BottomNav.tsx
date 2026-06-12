import Link from 'next/link'

type Phase0BottomNavProps = {
  savedCount?: number
}

export default function Phase0BottomNav({ savedCount }: Phase0BottomNavProps) {
  return (
    <nav
      aria-label="Phase 0 navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-10px_28px_rgba(24,24,27,0.08)] backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-2">
        <Link
          href="/"
          className="pointer-events-auto flex min-h-11 items-center justify-center rounded-xl text-sm font-black text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20"
        >
          トップ
        </Link>
        <Link
          href="/saved"
          className="pointer-events-auto flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F7F8F5] text-sm font-black text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20"
        >
          <span>保存リスト</span>
          {typeof savedCount === 'number' ? (
            <span className="rounded-full bg-[#E8611A]/10 px-2 py-0.5 text-xs text-[#B9470F]">{savedCount}</span>
          ) : null}
        </Link>
      </div>
    </nav>
  )
}
