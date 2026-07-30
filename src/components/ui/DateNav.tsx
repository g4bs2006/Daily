import { formatDateLong } from '../../lib/date'
import { IconChevron } from './icons'

type Props = {
  logDate: string
  isToday: boolean
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
}

export function DateNav({ logDate, isToday, onPrevDay, onNextDay, onToday }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrevDay}
        aria-label="Dia anterior"
        className="rounded-md p-1 text-parchment-dim hover:bg-white/5 hover:text-parchment"
      >
        <IconChevron direction="left" size={16} />
      </button>
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl capitalize text-parchment">{formatDateLong(logDate)}</h1>
      </div>
      <button
        type="button"
        onClick={onNextDay}
        disabled={isToday}
        aria-label="Dia seguinte"
        className="rounded-md p-1 text-parchment-dim hover:bg-white/5 hover:text-parchment disabled:opacity-30"
      >
        <IconChevron direction="right" size={16} />
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={onToday}
          className="font-mono text-xs text-brass hover:underline"
        >
          hoje
        </button>
      )}
    </div>
  )
}
