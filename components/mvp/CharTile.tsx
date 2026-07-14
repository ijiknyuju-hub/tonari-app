import type { CSSProperties } from 'react'

export const CHAR_TILE_TONES = [
  { background: '#ECEFEA', color: '#93A38C' },
  { background: '#EEF1EA', color: '#93A382' },
  { background: '#F5EDEA', color: '#C29A85' },
  { background: '#F4E4D5', color: '#96502C' },
  { background: '#E9EEF0', color: '#8AA1AC' },
  { background: '#F5F0E2', color: '#C4AE77' },
] as const

export type CharTileTone = (typeof CHAR_TILE_TONES)[number]

export type CharTileProps = {
  name: string
  size?: number | string
  radius?: number | string
  tone?: CharTileTone
  className?: string
  style?: CSSProperties
}

export default function CharTile({
  name,
  size = 56,
  radius = 9,
  tone,
  className,
  style,
}: CharTileProps) {
  const resolvedTone = tone ?? CHAR_TILE_TONES[stableHash(name) % CHAR_TILE_TONES.length]
  const firstCharacter = Array.from(name.trim())[0] ?? '？'
  const numericSize = typeof size === 'number' ? size : undefined

  return (
    <div
      aria-label={name}
      className={className}
      style={{
        display: 'flex',
        width: size,
        height: size,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: radius,
        background: resolvedTone.background,
        color: resolvedTone.color,
        fontFamily: 'var(--font-heading)',
        fontSize: numericSize ? Math.round(numericSize * 0.46) : '46%',
        fontWeight: 700,
        lineHeight: 1,
        ...style,
      }}
    >
      {firstCharacter}
    </div>
  )
}

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}
