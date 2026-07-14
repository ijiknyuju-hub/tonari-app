import type { CSSProperties } from 'react'
import type { DishRank } from '@/lib/mvp/rank'

type RankChipProps = {
  rank: Exclude<DishRank, null>
  className?: string
  style?: CSSProperties
}

export default function RankChip({ rank, className, style }: RankChipProps) {
  if (rank === 'specialty') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #DE5528',
          borderRadius: '50%',
          background: '#FCF0EA',
          color: '#DE5528',
          fontSize: 11.5,
          fontWeight: 900,
          letterSpacing: '.5px',
          lineHeight: 1.1,
          textAlign: 'center',
          transform: 'rotate(-8deg)',
          ...style,
        }}
      >
        十八番
      </span>
    )
  }

  const regular = rank === 'regular'
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        border: regular ? '1px solid #E6D4AE' : '1px solid rgba(26, 26, 26, 0.16)',
        borderRadius: 8,
        padding: '5px 10px',
        background: regular ? '#F8F1E2' : '#FFFFFF',
        color: regular ? '#8A5A16' : '#7A7570',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: regular ? 5 : 7,
          height: regular ? 5 : 7,
          border: regular ? 0 : '1.5px solid #C7C1BA',
          borderRadius: '50%',
          background: regular ? '#D3A051' : '#FFFFFF',
        }}
      />
      {regular ? '定番' : '作った'}
    </span>
  )
}
