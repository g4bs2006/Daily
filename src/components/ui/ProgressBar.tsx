type Props = {
  done: number
  total: number
}

export function ProgressBar({ done, total }: Props) {
  const pct = total > 0 ? (done / total) * 100 : 0
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
      </div>
      <span className="whitespace-nowrap font-mono text-xs text-parchment-dim">
        {done}/{total} exercícios
      </span>
    </div>
  )
}
