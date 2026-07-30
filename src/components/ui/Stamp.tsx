const TONE_COLOR: Record<Tone, string> = {
  brass: 'var(--color-brass)',
  moss: 'var(--color-moss)',
  muted: 'var(--color-parchment-dim)',
}

type Tone = 'brass' | 'moss' | 'muted'

type Props = {
  ringText: string
  value: string | number
  caption: string
  tone?: Tone
  size?: number
  dashed?: boolean
}

export function Stamp({ ringText, value, caption, tone = 'brass', size = 108, dashed = false }: Props) {
  const color = TONE_COLOR[tone]
  const id = `stamp-ring-${ringText.replace(/\s+/g, '-')}`
  const r = 42

  return (
    <div
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, transform: 'rotate(-4deg)' }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity={0.8}
          strokeDasharray={dashed ? '3 4' : undefined}
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity={0.5}
          strokeDasharray={dashed ? '2 3' : undefined}
        />
        <path id={id} d={`M 50,50 m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} fill="none" />
        <text fill={color} fontFamily="var(--font-mono)" fontSize="7.2" letterSpacing="2" opacity={0.9}>
          <textPath href={`#${id}`} startOffset="2%">
            {ringText}
          </textPath>
        </text>
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-display)"
          fontSize="22"
          fontWeight={600}
        >
          {value}
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-mono)"
          fontSize="6"
          letterSpacing="1.5"
          opacity={0.8}
        >
          {caption}
        </text>
      </svg>
    </div>
  )
}
