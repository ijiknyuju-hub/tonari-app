'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dishes } from '@/data/v3'
import CharTile from '@/components/mvp/CharTile'
import { useIsClient } from '@/lib/mvp/useIsClient'
import { useSelectedBaseDishes } from '@/lib/mvp/useSelectedBaseDishes'

const ONBOARDING_IDS = [
  'thai-basil-rice', 'fried-rice', 'nikujaga', 'curry',
  'mapo-tofu', 'karaage', 'oyakodon', 'yakisoba',
  'omurice', 'napolitan', 'peperoncino', 'tonjiru',
  'tatsuta-age', 'chicken-nanban', 'pad-thai', 'beef-stew',
] as const

const INITIAL_SELECTION = ['fried-rice', 'karaage', 'nikujaga']

export default function OnboardingScreen() {
  const router = useRouter()
  const isClient = useIsClient()
  const { selectedBaseDishIds, setSelectedBaseDishIds } = useSelectedBaseDishes()
  const [selectedIds, setSelectedIds] = useState<string[]>(INITIAL_SELECTION)

  useEffect(() => {
    if (isClient && selectedBaseDishIds.length > 0) router.replace('/home')
  }, [isClient, router, selectedBaseDishIds.length])

  if (!isClient || selectedBaseDishIds.length > 0) return <main className="tn-screen" />

  const choices = ONBOARDING_IDS.flatMap((id) => {
    const dish = dishes.find((candidate) => candidate.id === id)
    return dish ? [{ id, name: dish.name }] : []
  })

  function toggleDish(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function start() {
    if (selectedIds.length === 0) return
    setSelectedBaseDishIds(selectedIds)
    router.push('/home')
  }

  return (
    <main className="flex min-h-svh flex-col" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>
      <header style={{ padding: '58px 24px 14px' }}>
        <div className="mx-auto max-w-[402px]">
          <div className="flex items-center gap-[9px]">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ background: '#DE5528' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 11h16c0 4-3.6 7-8 7s-8-3-8-7Z" fill="#FFFFFF" />
                <path d="m14.5 4.2-3 6.2m6.3-5.3-3.2 5.3" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-[16px] font-bold tracking-[.5px]" style={{ fontFamily: 'var(--font-heading)' }}>となりごはん</span>
          </div>
          <h1 className="mt-[15px] text-[27px] font-bold leading-[1.42] tracking-[.4px]" style={{ fontFamily: 'var(--font-heading)' }}>
            よく作る料理を、<br />教えてください。
          </h1>
          <p className="mt-[13px] text-[13.5px] leading-[1.75]" style={{ color: '#7A7570' }}>
            選んだ料理をもとに、近い料理をおすすめします。いつもの味から、無理なく広げていけます。
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[402px] flex-1 overflow-auto px-[22px] pb-4 pt-[6px]">
        <div className="my-[6px] mb-3 flex items-baseline justify-between">
          <span className="text-[12.5px] font-bold" style={{ color: '#7A7570' }}>よく作るものを、いくつでも</span>
          <span className="text-[11.5px] font-bold" style={{ color: '#DE5528' }}>{selectedIds.length} 品選択中</span>
        </div>
        <div className="grid grid-cols-3 gap-[11px]">
          {choices.map((dish) => {
            const selected = selectedIds.includes(dish.id)
            return (
              <button
                key={dish.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleDish(dish.id)}
                className="overflow-hidden rounded-[13px] text-center"
                style={{ border: selected ? '2px solid #DE5528' : '1px solid rgba(26, 26, 26, 0.1)', boxShadow: selected ? '0 5px 14px rgba(222, 85, 40, 0.18)' : undefined }}
              >
                <div className="relative aspect-square">
                  <CharTile name={dish.name} size="100%" radius={0} />
                  {selected ? (
                    <span className="absolute right-[6px] top-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full border-2" style={{ background: '#DE5528', borderColor: '#FFFFFF' }}>
                      <svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="m2 7 3 3 6-7" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  ) : null}
                </div>
                <div className="bg-[#FFFFFF] px-[5px] py-2">
                  <span className="block text-[11.5px] leading-[1.2]" style={{ color: selected ? '#DE5528' : '#1A1A1A', fontWeight: selected ? 700 : 500 }}>{dish.name}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <footer className="border-t bg-[#FFFFFF]" style={{ padding: '15px 24px 30px', borderColor: 'rgba(26, 26, 26, 0.09)' }}>
        <div className="mx-auto max-w-[402px]">
          <div className="mb-[13px] flex items-center justify-between">
            <span className="text-[13px]" style={{ color: '#7A7570' }}>料理帳に <b className="text-[16px]" style={{ color: '#DE5528' }}>{selectedIds.length}</b> 品</span>
            <span className="text-[11.5px]" style={{ color: '#B7B2AC' }}>あとからいつでも増やせます</span>
          </div>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={start}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] py-[15px] text-[16px] font-bold tracking-[1px] disabled:opacity-50"
            style={{ background: '#DE5528', color: '#FFFFFF', boxShadow: '0 6px 16px rgba(222, 85, 40, 0.28)' }}
          >
            はじめる
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 10h11m-4-5 5 5-5 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </footer>
    </main>
  )
}
