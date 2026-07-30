import { IconChevron } from './icons'

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

type Props = {
  year: number
  month: number
  countByDate: Map<string, number>
  registeredDates: Set<string>
  todayDate: string
  onSelectDay: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  disableNext: boolean
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function HeatmapCalendar({
  year,
  month,
  countByDate,
  registeredDates,
  todayDate,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  disableNext,
}: Props) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(month + 1)}-${pad(i + 1)}`),
  ]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Mês anterior"
          className="rounded-md p-1 text-parchment-dim hover:bg-white/5 hover:text-parchment"
        >
          <IconChevron direction="left" size={16} />
        </button>
        <p className="font-mono text-xs tracking-wide text-parchment-dim">
          {MONTH_LABELS[month].toUpperCase()} {year}
        </p>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={disableNext}
          aria-label="Mês seguinte"
          className="rounded-md p-1 text-parchment-dim hover:bg-white/5 hover:text-parchment disabled:opacity-30"
        >
          <IconChevron direction="right" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center font-mono text-[10px] text-parchment-dim">
            {label}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const registered = registeredDates.has(date)
          const count = countByDate.get(date) ?? 0
          const isToday = date === todayDate
          const opacity = registered ? Math.max(0.28, count / 5) : 0
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDay(date)}
              title={`${date} · ${registered ? `${count}/5 pilares` : 'não registrado'}`}
              className={`aspect-square rounded-md border text-[10px] transition-transform hover:scale-110 ${
                isToday ? 'border-brass' : 'border-white/10'
              }`}
              style={{
                background: registered ? `rgba(200, 147, 63, ${opacity})` : 'transparent',
                backgroundImage: registered
                  ? undefined
                  : 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 4px, transparent 4px 8px)',
              }}
            >
              <span className="text-parchment-dim">{Number(date.slice(-2))}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
