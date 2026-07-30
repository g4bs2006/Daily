type Props = {
  label: string
  value: string
  caption?: string
}

export function StatTile({ label, value, caption }: Props) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-2 p-3">
      <p className="font-mono text-[10px] tracking-wide text-parchment-dim">{label.toUpperCase()}</p>
      <p className="mt-1 font-display text-xl text-parchment">{value}</p>
      {caption && <p className="font-mono text-[10px] text-parchment-dim">{caption}</p>}
    </div>
  )
}
