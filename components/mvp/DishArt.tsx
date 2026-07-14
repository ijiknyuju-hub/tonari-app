import { useId, type CSSProperties } from 'react'

type DishArtMotif = 'bowl' | 'plate' | 'soup' | 'pan'

type DishArtProps = {
  dish?: string
  motif?: DishArtMotif
  palette?: number
  radius?: number | string
  seed?: string | number
  className?: string
  style?: CSSProperties
}

type Palette = {
  bg: readonly [string, string]
  vessel: string
  rim: string
  foods: readonly string[]
}

const PALETTES: readonly Palette[] = [
  { bg: ['#F7E2CB', '#F1CDA6'], vessel: '#E7B98C', rim: '#D9A470', foods: ['#D25A2B', '#E8912F', '#B7492F'] },
  { bg: ['#EBEBD2', '#DADEB4'], vessel: '#C6CD9C', rim: '#B4BC84', foods: ['#7E8C43', '#AEAE3C', '#C9863A'] },
  { bg: ['#F4DCBE', '#EBC298'], vessel: '#E3B583', rim: '#D19E66', foods: ['#C9702F', '#E4A93C', '#8C4A2B'] },
  { bg: ['#F2DACD', '#E7BBA6'], vessel: '#DDA98F', rim: '#CB937A', foods: ['#C15640', '#E08A5B', '#9C4636'] },
  { bg: ['#EFE6D0', '#E0D0AE'], vessel: '#CFC094', rim: '#BCAB7E', foods: ['#C79A3E', '#E4C255', '#8A6B32'] },
  { bg: ['#E7EBDF', '#CFDAC4'], vessel: '#B7C6A6', rim: '#A2B48F', foods: ['#6E8858', '#9AAE6B', '#C08A45'] },
  { bg: ['#F6DCC6', '#EFBF98'], vessel: '#E4B487', rim: '#D29B67', foods: ['#D96A2E', '#EFA63A', '#7E9A3E'] },
  { bg: ['#EEE0CB', '#DFC7A2'], vessel: '#D3BB90', rim: '#C0A778', foods: ['#B06A3A', '#D99E4B', '#6E5233'] },
]

export default function DishArt({
  dish,
  motif,
  palette,
  radius = 18,
  seed,
  className,
  style,
}: DishArtProps) {
  const hash = hashString(`${seed ?? ''}${dish ?? 'dish'}`)
  const random = mulberry32(hash || 1)
  const selectedPalette = PALETTES[palette ?? (hash % PALETTES.length)] ?? PALETTES[0]
  const motifs: readonly DishArtMotif[] = ['bowl', 'plate', 'soup', 'pan', 'bowl', 'plate']
  const selectedMotif = motif ?? motifs[hash % motifs.length]
  const idSuffix = useId().replaceAll(':', '')
  const gradientId = `dish-art-${hash % 100000}-${idSuffix}`

  const foods = Array.from({ length: 4 + Math.floor(random() * 2) }, (_, index) => {
    const angle = random() * Math.PI * 2
    const distance = random() * 22
    const centerX = 100 + Math.cos(angle) * distance
    const centerY = (selectedMotif === 'plate' ? 94 : 90) + Math.sin(angle) * distance * 0.5
    return {
      d: blobPath(random, centerX, centerY, 16 + random() * 13, 6 + Math.floor(random() * 3), 0.22, 0.85),
      fill: selectedPalette.foods[index % selectedPalette.foods.length] ?? selectedPalette.foods[0],
      highlighted: random() > 0.4,
    }
  })

  const specks = Array.from({ length: 5 }, (_, index) => ({
    cx: 74 + random() * 52,
    cy: 74 + random() * 26,
    r: 1.6 + random() * 2.2,
    fill: selectedPalette.foods[(index + 1) % selectedPalette.foods.length] ?? selectedPalette.foods[0],
  }))

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: radius,
        background: `linear-gradient(150deg, ${selectedPalette.bg[0]}, ${selectedPalette.bg[1]})`,
        ...style,
      }}
    >
      <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={`${gradientId}i`} cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor={selectedPalette.bg[0]} stopOpacity="0.55" />
            <stop offset="100%" stopColor={selectedPalette.rim} stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id={`${gradientId}l`} cx="34%" cy="24%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="200" height="160" fill={`url(#${gradientId}l)`} />
        <Vessel motif={selectedMotif} palette={selectedPalette} gradientId={gradientId} />
        {foods.map((food, index) => (
          <g key={`${food.d}-${index}`}>
            <path d={food.d} fill={food.fill} />
            {food.highlighted ? (
              <path
                d={food.d}
                fill="#FFFFFF"
                fillOpacity="0.14"
                transform="translate(-2,-3) scale(0.86)"
                style={{ transformOrigin: '100px 88px' }}
              />
            ) : null}
          </g>
        ))}
        {specks.map((speck, index) => (
          <circle key={`${speck.cx}-${index}`} cx={speck.cx} cy={speck.cy} r={speck.r} fill={speck.fill} fillOpacity="0.9" />
        ))}
        {selectedMotif === 'soup' ? (
          <g stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M84 66q-6-10 0-20q6-10 0-20" />
            <path d="M108 62q-6-10 0-20q6-10 0-20" />
          </g>
        ) : null}
      </svg>
    </div>
  )
}

function Vessel({ motif, palette, gradientId }: { motif: DishArtMotif; palette: Palette; gradientId: string }) {
  if (motif === 'plate') {
    return (
      <g>
        <ellipse cx="100" cy="102" rx="72" ry="22" fill={palette.rim} />
        <ellipse cx="100" cy="99" rx="66" ry="19" fill={palette.vessel} />
        <ellipse cx="100" cy="97" rx="46" ry="12.5" fill={`url(#${gradientId}i)`} />
      </g>
    )
  }

  if (motif === 'pan') {
    return (
      <g>
        <rect x="150" y="90" width="54" height="9" rx="4.5" fill={palette.rim} />
        <ellipse cx="100" cy="98" rx="58" ry="21" fill={palette.rim} />
        <ellipse cx="100" cy="95" rx="52" ry="18" fill={palette.vessel} />
        <ellipse cx="100" cy="93" rx="44" ry="14" fill={`url(#${gradientId}i)`} />
      </g>
    )
  }

  return (
    <g>
      <path d="M42 96A58 58 0 0 0 158 96Z" fill={palette.vessel} />
      <path d="M42 96A58 58 0 0 0 158 96" fill="none" stroke={palette.rim} strokeOpacity="0.5" strokeWidth="1" />
      <ellipse cx="100" cy="96" rx="58" ry="17" fill={palette.rim} />
      <ellipse cx="100" cy="94.5" rx="52" ry="14" fill={`url(#${gradientId}i)`} />
    </g>
  )
}

function hashString(value: string) {
  let hash = 2166136261 >>> 0
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number) {
  let value = seed
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function blobPath(
  random: () => number,
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  wobble: number,
  squash: number,
) {
  const rotation = random() * Math.PI
  const points = Array.from({ length: count }, (_, index) => {
    const angle = rotation + (index / count) * Math.PI * 2
    const variedRadius = radius * (1 - wobble + random() * wobble * 2)
    return [centerX + Math.cos(angle) * variedRadius, centerY + Math.sin(angle) * variedRadius * squash] as const
  })
  return smoothClosedPath(points)
}

function smoothClosedPath(points: readonly (readonly [number, number])[]) {
  let path = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} `
  for (let index = 0; index < points.length; index += 1) {
    const previous = points[(index - 1 + points.length) % points.length]
    const current = points[index]
    const next = points[(index + 1) % points.length]
    const afterNext = points[(index + 2) % points.length]
    const controlOneX = current[0] + (next[0] - previous[0]) / 6
    const controlOneY = current[1] + (next[1] - previous[1]) / 6
    const controlTwoX = next[0] - (afterNext[0] - current[0]) / 6
    const controlTwoY = next[1] - (afterNext[1] - current[1]) / 6
    path += `C ${controlOneX.toFixed(1)} ${controlOneY.toFixed(1)} ${controlTwoX.toFixed(1)} ${controlTwoY.toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)} `
  }
  return `${path}Z`
}
