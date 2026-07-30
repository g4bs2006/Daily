type Props = {
  filled: boolean
}

export function SealDot({ filled }: Props) {
  return (
    <svg viewBox="0 0 20 20" width={20} height={20} className="shrink-0">
      <circle
        cx="10"
        cy="10"
        r="8.5"
        fill="none"
        stroke={filled ? 'var(--color-moss)' : 'var(--color-parchment-dim)'}
        strokeWidth={filled ? 1.6 : 1.2}
        strokeDasharray={filled ? undefined : '2 2.4'}
        opacity={filled ? 0.9 : 0.5}
      />
      {filled && <circle cx="10" cy="10" r="3" fill="var(--color-moss)" opacity={0.85} />}
    </svg>
  )
}
