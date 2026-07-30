import type { ComponentType, ReactNode } from 'react'

type Props = {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  children: ReactNode
}

export function InstrumentCard({ icon: Icon, title, children }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-white/10 bg-ink-2 p-4">
      <legend className="flex items-center gap-2 px-1 font-mono text-xs tracking-wide text-brass">
        <Icon size={14} />
        <span>{title.toUpperCase()}</span>
      </legend>
      {children}
    </fieldset>
  )
}

export const fieldLabelClass = 'font-mono text-xs tracking-wide text-parchment-dim'
export const fieldInputClass =
  'w-full rounded-md border border-white/15 bg-ink px-3 py-2 font-body text-base text-parchment outline-none focus:border-brass'
