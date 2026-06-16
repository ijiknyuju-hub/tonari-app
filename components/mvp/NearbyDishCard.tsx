'use client'

import Link from 'next/link'
import type { Difficulty, NearbyRelation } from '@/types/dish'
import { useUserState } from '@/lib/mvp/useUserState'

// Emoji placeholders keyed by dish id (fallback to generic)
const DISH_EMOJI: Record<string, string> = {
  curry: '🍛',
  'curry-udon': '🍜',
  'curry-rice-gratin': '🧀',
  'keema-curry': '🍛',
  'butter-chicken-curry': '🍗',
  'curry-soup': '🥘',
  'curry-bread': '🥖',
  'curry-yakisoba': '🍜',
  'mapo-curry': '🌶️',
  'omelette-rice-curry': '🍳',
  'fried-rice': '🍳',
  'salmon-fried-rice': '🐟',
  'kimchi-fried-rice': '🌶️',
  'takikomi-fried-rice': '🍚',
  'stir-fry-rice-noodles': '🍜',
  'pad-thai': '🍜',
  'paella-style-rice': '🥘',
  karaage: '🍗',
  yurinchi: '🍗',
  'chicken-nanban': '🍗',
  'tatsuta-age': '🍗',
  'tebasaki-karaage': '🍗',
  'yannyom-chicken': '🍗',
  'tori-ten': '🍗',
  'chicken-katsu-don': '🍗',
  'tandoori-chicken': '🍗',
  'thai-basil-rice': '🌿',
  'mapo-tofu': '🌶️',
  'mapo-harusame': '🥡',
  'mapo-nasu': '🍆',
  'mapo-tofu-hot-pot': '🍲',
  'dan-dan-noodles': '🍜',
  napolitan: '🍝',
  'napolitan-egg-wrap': '🍳',
  'napolitan-meat-sauce': '🍝',
  'napolitan-pizza-toast': '🍕',
  bolognese: '🍝',
  arrabiata: '🍝',
  'clam-pasta': '🐚',
  peperoncino: '🌶️',
  'anchovy-pasta': '🐟',
  'garlic-shrimp-pasta': '🦐',
  'pasta-al-limone': '🍋',
  'peperoncino-cabbage': '🥬',
  nikujaga: '🥔',
  'nikujaga-croquette': '🍟',
  tonjiru: '🍲',
  'potato-gratin': '🧀',
  chikuzenni: '🥕',
  'beef-stew': '🥩',
  omurice: '🍳',
  'omurice-demi': '🍳',
  'chicken-rice-doria': '🧀',
  oyakodon: '🍳',
  'tori-soboro-don': '🍚',
  'oyako-udon': '🍜',
  'oyakodon-nabe': '🍲',
  yakisoba: '🍜',
  'ankake-yakisoba': '🍜',
  'yakisoba-bread': '🥖',
  'yakisoba-omelette': '🍳',
  'pork-kimchi-udon': '🌶️',
  'kimchi-udon': '🌶️',
}

function getDishEmoji(dishId: string): string {
  return DISH_EMOJI[dishId] ?? '🍽️'
}

function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  const config = {
    easy: { label: 'かんたん', className: 'tn-tag tn-tag-easy' },
    stretch: { label: '少し広げる', className: 'tn-tag tn-tag-stretch' },
    full: { label: 'しっかり作る', className: 'tn-tag tn-tag-full' },
  }
  const { label, className } = config[difficulty]
  return <span className={className}>{label}</span>
}

function BookmarkButton({ dishId }: { dishId: string }) {
  const { isBookmarked, bookmark, unbookmark } = useUserState()
  const saved = isBookmarked(dishId)

  return (
    <button
      type="button"
      aria-label={saved ? '保存済み' : '作りたいリストに追加'}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        if (saved) { unbookmark(dishId) } else { bookmark(dishId) }
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm"
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
    </button>
  )
}

// ─── Featured Card (large) ────────────────────────────────────────────────────

interface FeaturedCardProps {
  relation: NearbyRelation
  targetName: string
  onMadeIt: () => void
}

export function FeaturedCard({ relation, targetName, onMadeIt }: FeaturedCardProps) {
  const emoji = getDishEmoji(relation.target)
  const ingredients = relation.new_ingredients.join('、')

  return (
    <div className="tn-card overflow-hidden">
      {/* Card body: image left, info right */}
      <div className="flex">
        {/* Left: placeholder image */}
        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{
            width: '46%',
            minHeight: '9rem',
            background: 'var(--tn-surface-soft)',
          }}
        >
          <span className="text-5xl" aria-hidden="true">{emoji}</span>
          {/* Bookmark overlaid top-right of image */}
          <div className="absolute right-2 top-2">
            <BookmarkButton dishId={relation.target} />
          </div>
        </div>

        {/* Right: text info */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <DifficultyTag difficulty={relation.tab} />
            <p
              className="mt-2 font-black leading-snug"
              style={{ fontSize: '1.375rem', color: 'var(--tn-text)' }}
            >
              {targetName}
            </p>
            <p className="mt-1 text-xs leading-5" style={{ color: 'var(--tn-text-sub)' }}>
              {relation.description_line1}
            </p>
            <p className="text-xs leading-5" style={{ color: 'var(--tn-text-sub)' }}>
              {relation.description_line2}
            </p>
          </div>

          {ingredients && (
            <div
              className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: 'var(--tn-accent-soft)',
                color: 'var(--tn-accent)',
              }}
            >
              <span>新しく必要：{ingredients}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-2 border-t px-4 py-3" style={{ borderColor: 'var(--tn-border)' }}>
        <button
          type="button"
          onClick={onMadeIt}
          className="flex-1 rounded-2xl border py-2 text-sm font-bold"
          style={{ borderColor: 'var(--tn-border)', color: 'var(--tn-text-sub)' }}
        >
          ✓ 作ったことある
        </button>
        <Link
          href={`/dish/${relation.target}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2 text-sm font-bold text-white"
          style={{ background: 'var(--tn-accent)' }}
        >
          詳しく見る ›
        </Link>
      </div>
    </div>
  )
}

// ─── Compact Card (horizontal scroll) ────────────────────────────────────────

interface CompactCardProps {
  relation: NearbyRelation
  targetName: string
}

export function CompactCard({ relation, targetName }: CompactCardProps) {
  const emoji = getDishEmoji(relation.target)
  const ingredients = relation.new_ingredients.slice(0, 2).join('・')

  return (
    <Link
      href={`/dish/${relation.target}`}
      className="tn-card flex shrink-0 flex-col overflow-hidden"
      style={{ width: '9.5rem' }}
    >
      {/* Image area */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '6rem', background: 'var(--tn-surface-soft)' }}
      >
        <span className="text-4xl" aria-hidden="true">{emoji}</span>
        <div className="absolute left-2 top-2">
          <DifficultyTag difficulty={relation.tab} />
        </div>
        <div className="absolute right-2 top-2">
          <BookmarkButton dishId={relation.target} />
        </div>
      </div>

      {/* Text info */}
      <div className="flex flex-col gap-1 p-2">
        <p className="text-sm font-black leading-snug" style={{ color: 'var(--tn-text)' }}>
          {targetName}
        </p>
        <p className="text-xs leading-4" style={{ color: 'var(--tn-text-sub)' }}>
          {relation.description_line1}
        </p>
        {ingredients && (
          <p className="text-xs font-bold" style={{ color: 'var(--tn-accent)' }}>
            {ingredients}
          </p>
        )}
      </div>
    </Link>
  )
}
