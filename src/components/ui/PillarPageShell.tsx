import type { ComponentType, FormEvent, ReactNode } from 'react'
import { DateNav } from './DateNav'

export type SaveState = 'loading' | 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  logDate: string
  isToday: boolean
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  saveState: SaveState
  errorMessage: string | null
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  footer?: ReactNode
}

export function PillarPageShell({
  icon: Icon,
  title,
  logDate,
  isToday,
  onPrevDay,
  onNextDay,
  onToday,
  saveState,
  errorMessage,
  onSubmit,
  children,
  footer,
}: Props) {
  if (saveState === 'loading') return null

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 lg:px-10">
      <div>
        <p className="flex items-center gap-2 font-mono text-xs tracking-wide text-brass">
          <Icon size={13} />
          {title.toUpperCase()}
        </p>
        <DateNav logDate={logDate} isToday={isToday} onPrevDay={onPrevDay} onNextDay={onNextDay} onToday={onToday} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start">
        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          <button
            type="submit"
            disabled={saveState === 'saving'}
            className="w-full rounded-md bg-brass py-2.5 font-body text-base font-medium text-ink disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Salvando...' : 'Salvar'}
          </button>

          {saveState === 'saved' && <p className="text-center font-mono text-xs text-moss">registrado ✓</p>}
          {saveState === 'error' && errorMessage && (
            <p className="font-mono text-xs text-rust">{errorMessage}</p>
          )}
        </form>

        {footer}
      </div>
    </div>
  )
}
