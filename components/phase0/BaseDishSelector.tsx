'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Phase0BottomNav from '@/components/phase0/Phase0BottomNav'
import { trackEvent } from '@/lib/phase0/analytics'
import { writeSelectedBaseDishIds } from '@/lib/mvp/useSelectedBaseDishes'
import type { BaseDish } from '@/types/dish'

type BaseDishSelectorProps = {
  baseDishes: BaseDish[]
}

export default function BaseDishSelector({ baseDishes }: BaseDishSelectorProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const selectedDishes = useMemo(
    () => baseDishes.filter((dish) => selectedIds.includes(dish.id)),
    [baseDishes, selectedIds],
  )

  function toggleDish(id: string) {
    if (!selectedIds.includes(id)) {
      trackEvent('select_base_dish', { dishId: id })
    }

    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    )
  }

  function proceed() {
    if (selectedIds.length === 0) {
      return
    }

    const params = new URLSearchParams()
    params.set('base', selectedIds.join(','))
    writeSelectedBaseDishIds(selectedIds)
    router.push(`/recommend?${params.toString()}`)
  }

  return (
    <main className="phase0-screen">
      <section className="phase0-container phase0-bottom-safe flex min-h-screen flex-col pt-5">
        <header className="space-y-4">
          <Link href="/" className="inline-flex text-sm font-bold text-zinc-500 transition hover:text-[#E8611A]">
            トップへ戻る
          </Link>
          <div className="space-y-3">
            <p className="text-sm font-bold text-[#E8611A]">となりごはん</p>
            <h1 className="text-3xl font-black leading-tight tracking-normal">
              作れる料理を選んでください
            </h1>
            <p className="text-base leading-7 text-zinc-700">
              よく作る料理を3つくらい選ぶと、
              <br />
              あなたに近い料理が出てきます。
            </p>
          </div>
        </header>

        <div className="phase0-card mt-6 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-zinc-950">選んだ料理</h2>
            <p className="text-xs font-bold text-zinc-500">{selectedIds.length}個選択中</p>
          </div>

          {selectedDishes.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDishes.map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => toggleDish(dish.id)}
                  className="min-h-11 rounded-full bg-[#E8611A] px-4 text-sm font-black text-white shadow-sm"
                  aria-label={`${dish.title}を選択から外す`}
                >
                  {dish.title}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-zinc-500">まずは1つ選んでください。</p>
          )}

          {selectedIds.length >= 5 ? (
            <p className="mt-3 text-xs font-bold text-zinc-500">十分です。もちろん、もっと選んでも大丈夫です。</p>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {baseDishes.map((dish) => {
            const selected = selectedIds.includes(dish.id)

            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => toggleDish(dish.id)}
                aria-pressed={selected}
                className={[
                  'min-h-16 rounded-2xl border px-3 text-center text-sm font-black shadow-sm transition focus:outline-none focus:ring-4 focus:ring-[#E8611A]/20',
                  selected
                    ? 'border-[#E8611A] bg-[#E8611A] text-white'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:border-[#E8611A]/50',
                ].join(' ')}
              >
                {dish.title}
              </button>
            )
          })}
        </div>

        <div className="pointer-events-none sticky bottom-[4.25rem] mt-auto bg-[#F7F8F5]/95 pb-3 pt-2 backdrop-blur">
          <button
            type="button"
            onClick={proceed}
            disabled={selectedIds.length === 0}
            className="phase0-primary-button pointer-events-auto flex w-full items-center justify-center px-5 text-center text-base font-black transition enabled:hover:bg-[#d95512] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
          >
            あなたのとなりごはんを探す
          </button>
        </div>
      </section>
      <Phase0BottomNav />
    </main>
  )
}
