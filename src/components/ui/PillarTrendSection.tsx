import type { ReactNode } from 'react'
import { StatTile } from './StatTile'

type Stat = {
  label: string
  value: string
  caption?: string
}

type Props = {
  loading: boolean
  stats: Stat[]
  children: ReactNode
}

export function PillarTrendSection({ loading, stats, children }: Props) {
  if (loading) return null

  return (
    <div className="space-y-3 border-t border-white/10 pt-5 lg:border-t-0 lg:pt-0">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} caption={stat.caption} />
        ))}
      </div>
      <div className="rounded-lg border border-white/10 bg-ink-2 p-4">{children}</div>
    </div>
  )
}
