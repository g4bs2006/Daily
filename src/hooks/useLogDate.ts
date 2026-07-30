import { useSearchParams } from 'react-router-dom'
import { shiftIsoDate, todayIsoDate } from '../lib/date'

function isValidIsoDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function useLogDate() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('d')
  const today = todayIsoDate()
  const logDate = isValidIsoDate(raw) && raw <= today ? raw : today
  const isToday = logDate === today

  function goTo(nextDate: string) {
    if (nextDate === today) {
      searchParams.delete('d')
    } else {
      searchParams.set('d', nextDate)
    }
    setSearchParams(searchParams, { replace: true })
  }

  return {
    logDate,
    isToday,
    goToday: () => goTo(today),
    goPrevDay: () => goTo(shiftIsoDate(logDate, -1)),
    goNextDay: () => goTo(shiftIsoDate(logDate, 1)),
    goTo,
  }
}
