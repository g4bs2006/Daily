type Props = {
  label: string
  spent: number
  limit: number
}

export function BudgetMeter({ label, spent, limit }: Props) {
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  const clamped = Math.min(100, Math.max(0, pct))
  const color = pct > 100 ? '#d03b3b' : pct > 80 ? '#fab219' : '#0ca30c'

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between font-mono text-xs text-parchment-dim">
        <span>{label}</span>
        <span>
          R$ {spent.toFixed(0)} / R$ {limit.toFixed(0)} · {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, background: color }} />
      </div>
    </div>
  )
}
