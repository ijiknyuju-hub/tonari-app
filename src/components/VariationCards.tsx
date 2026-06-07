'use client'

import { Dish, VariationResult } from '@/lib/recommend'
import {
  WISH_LIST_CHANGE_EVENT,
  getTriedVariations,
  promoteVariation,
  recordVariation,
} from '@/lib/storage'
import { useState } from 'react'

type Props = {
  selected: Dish[]
  variations: VariationResult[]
}

type TriedState = {
  result?: 'done' | 'meh'
  promoted: boolean
}

const TYPE_LABELS: Record<VariationResult['variation']['type'], string> = {
  seasoning: 'たれ変え',
  ingredient: '具材変え',
  method: '調理法変え',
}

export default function VariationCards({ selected, variations }: Props) {
  const [triedMap, setTriedMap] = useState(() => getInitialTriedMap())

  function handleRecord(result: 'done' | 'meh', variation: VariationResult) {
    const key = getVariationKey(variation)
    if (triedMap[key]?.result) return

    recordVariation(
      variation.variation.base,
      variation.variation.title,
      result
    )
    setTriedMap((prev) => ({
      ...prev,
      [key]: {
        result,
        promoted: prev[key]?.promoted ?? false,
      },
    }))
  }

  function handlePromote(variation: VariationResult) {
    if (!variation.promoteDish) return
    const key = getVariationKey(variation)

    promoteVariation(
      variation.variation.base,
      variation.variation.title,
      variation.promoteDish.id,
      variation.promoteDish.name
    )
    window.dispatchEvent(new Event(WISH_LIST_CHANGE_EVENT))
    setTriedMap((prev) => ({
      ...prev,
      [key]: {
        result: prev[key]?.result ?? 'done',
        promoted: true,
      },
    }))
  }

  if (variations.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-3xl bg-white border border-orange-100 px-6 py-14 text-center shadow-sm">
          <p className="text-5xl mb-4" aria-hidden="true">🧂</p>
          <p className="font-black text-gray-800">
            選んだ料理のバリエーションデータがまだ準備中です。
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            おすすめタブから別の料理を探してみてください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="rounded-3xl bg-white border border-orange-100 shadow-sm px-5 py-4">
        <p className="text-xs font-bold text-[#6B8F5E]">いつもの一歩先</p>
        <h1 className="mt-1 text-2xl font-black text-gray-900">ちょい変え案</h1>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          {selected.map((dish) => dish.name).join('・')} を少し変えるだけ。
          気軽に試して、よかったら定番に育てられます。
        </p>
      </div>

      {variations.map((variation) => {
        const key = getVariationKey(variation)
        const tried = triedMap[key]
        const isTried = tried?.result !== undefined
        const isPromoted = tried?.promoted === true

        return (
          <article
            key={key}
            className="rounded-3xl bg-white border border-orange-100 shadow-md p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#FFF3E8] px-3 py-1 text-xs font-black text-[#FF6B35]">
                {TYPE_LABELS[variation.variation.type]}
              </span>
              <span className="text-xs font-bold text-gray-500">
                {variation.baseDish.name} から
              </span>
            </div>

            <h2 className="text-xl font-black leading-tight text-gray-900">
              {variation.variation.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {variation.variation.display_text}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRecord('done', variation)}
                disabled={isTried}
                className={`min-h-11 rounded-2xl text-sm font-black transition-colors ${
                  tried?.result === 'done'
                    ? 'bg-[#E8F3E3] text-[#4F7D43]'
                    : isTried
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-[#6B8F5E] text-white active:scale-95'
                }`}
              >
                {tried?.result === 'done' ? 'やった ✓' : 'やった'}
              </button>
              <button
                onClick={() => handleRecord('meh', variation)}
                disabled={isTried}
                className={`min-h-11 rounded-2xl text-sm font-black transition-colors ${
                  tried?.result === 'meh'
                    ? 'bg-gray-200 text-gray-600'
                    : isTried
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-600 border border-gray-200 active:scale-95'
                }`}
              >
                {tried?.result === 'meh' ? '記録済み' : '微妙...'}
              </button>
            </div>

            {variation.promoteDish && (
              <button
                onClick={() => handlePromote(variation)}
                disabled={isPromoted}
                className={`mt-3 w-full rounded-2xl py-3 text-sm font-black transition-colors ${
                  isPromoted
                    ? 'bg-[#E8F3E3] text-[#4F7D43]'
                    : 'bg-[#FF6B35] text-white active:scale-95'
                }`}
              >
                {isPromoted
                  ? `${variation.promoteDish.name}を候補に追加済み`
                  : `${variation.promoteDish.name}として定番に追加 →`}
              </button>
            )}
          </article>
        )
      })}
    </div>
  )
}

function getInitialTriedMap(): Record<string, TriedState> {
  return Object.fromEntries(
    getTriedVariations().map((item) => [
      getTriedKey(item.base, item.title),
      {
        result: item.result,
        promoted: item.promoted,
      },
    ])
  )
}

function getVariationKey(variation: VariationResult): string {
  return getTriedKey(variation.variation.base, variation.variation.title)
}

function getTriedKey(base: string, title: string): string {
  return `${base}::${title}`
}
