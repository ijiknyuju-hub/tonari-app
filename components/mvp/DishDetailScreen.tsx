'use client'

import Link from 'next/link'
import type { NearbyRelation } from '@/types/dish'
import { useUserState } from '@/lib/mvp/useUserState'

// Difficulty label text
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'かんたん',
  stretch: '少し広げる',
  full: 'しっかり作る',
}

function DifficultyTag({ difficulty }: { difficulty: string }) {
  const className =
    difficulty === 'easy'
      ? 'tn-tag tn-tag-easy'
      : difficulty === 'stretch'
        ? 'tn-tag tn-tag-stretch'
        : 'tn-tag tn-tag-full'
  return <span className={className}>{DIFFICULTY_LABEL[difficulty] ?? difficulty}</span>
}

interface DishDetailScreenProps {
  relation: NearbyRelation
  targetName: string
  sourceName: string
}

export default function DishDetailScreen({
  relation,
  targetName,
  sourceName,
}: DishDetailScreenProps) {
  const { isBookmarked, bookmark, unbookmark, madeRecordsFor, recordMade } = useUserState()
  const saved = isBookmarked(relation.target)
  const madeCount = madeRecordsFor(relation.target).length

  function handleMadeIt() {
    recordMade({
      dish_id: relation.target,
      made_at: new Date().toISOString(),
      rating: 'ok',
    })
  }

  return (
    <main className="tn-screen">
      <div className="tn-container tn-bottom-safe pt-4">
        {/* Back link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm font-bold"
          style={{ color: 'var(--tn-accent)' }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          戻る
        </Link>

        {/* Dish name + label */}
        <div className="mt-4">
          <DifficultyTag difficulty={relation.tab} />
          <h1
            className="mt-2 font-black leading-snug"
            style={{ fontSize: '1.625rem', color: 'var(--tn-text)' }}
          >
            {targetName}
          </h1>
          <p className="mt-1 text-sm font-bold" style={{ color: 'var(--tn-text-sub)' }}>
            {sourceName}から広げる
          </p>
        </div>

        {/* Description */}
        <div className="tn-card mt-5 p-4">
          <p className="text-sm leading-6" style={{ color: 'var(--tn-text)' }}>
            {relation.description_line1}
          </p>
          <p className="text-sm leading-6" style={{ color: 'var(--tn-text)' }}>
            {relation.description_line2}
          </p>
        </div>

        {/* New ingredients */}
        {relation.new_ingredients.length > 0 && (
          <section className="mt-5">
            <h2 className="text-sm font-black" style={{ color: 'var(--tn-text)' }}>
              材料リスト — 新しく必要なもの
            </h2>
            <ul className="mt-2 space-y-2">
              {relation.new_ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold"
                  style={{ background: 'var(--tn-accent-soft)', color: 'var(--tn-accent)' }}
                >
                  <span>•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Rough steps */}
        {relation.rough_steps && relation.rough_steps.length > 0 && (
          <section className="mt-5">
            <h2 className="text-sm font-black" style={{ color: 'var(--tn-text)' }}>
              ざっくり手順
            </h2>
            <ol className="mt-2 space-y-2">
              {relation.rough_steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl px-4 py-2 text-sm"
                  style={{ background: 'var(--tn-surface-soft)', color: 'var(--tn-text)' }}
                >
                  <span
                    className="shrink-0 font-black"
                    style={{ color: 'var(--tn-accent)' }}
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Cooking time */}
        {relation.cooking_time_minutes != null && (
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
            style={{ background: 'var(--tn-surface-soft)', color: 'var(--tn-text-sub)' }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" strokeLinecap="round" />
            </svg>
            調理時間 約{relation.cooking_time_minutes}分
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => (saved ? unbookmark(relation.target) : bookmark(relation.target))}
            className="tn-pill-button flex items-center justify-center gap-2 py-3 text-sm font-bold"
            style={
              saved
                ? { background: 'var(--tn-accent-soft)', borderColor: 'var(--tn-accent)' }
                : undefined
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill={saved ? 'var(--tn-accent)' : 'none'}
              stroke="var(--tn-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1Z" />
            </svg>
            {saved ? '保存済み ♡' : '作りたい ♡'}
          </button>
          <button
            type="button"
            onClick={handleMadeIt}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white"
            style={{ background: madeCount > 0 ? '#6aab40' : 'var(--tn-accent)' }}
          >
            {madeCount > 0 ? `✓ ${madeCount}回作った` : '作った ✓'}
          </button>
        </div>
      </div>
    </main>
  )
}
