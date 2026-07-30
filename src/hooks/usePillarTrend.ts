import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isoDateDaysAgo, todayIsoDate } from '../lib/date'
import type { TrendPoint } from '../components/ui/TrendBarChart'

export function usePillarTrend<Row extends Record<string, unknown>>(
  table: string,
  columns: string,
  days: number,
  extractValue: (row: Row) => number | null,
) {
  const [points, setPoints] = useState<TrendPoint[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    const to = todayIsoDate()
    const from = isoDateDaysAgo(days - 1)

    Promise.all([
      supabase.from('daily_log').select('log_date').gte('log_date', from).lte('log_date', to),
      supabase
        .from(table)
        .select(`log_date, ${columns}` as '*')
        .gte('log_date', from)
        .lte('log_date', to),
    ]).then(([logRes, pillarRes]) => {
      if (!active) return
      const error = logRes.error ?? pillarRes.error
      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      const registeredDates = new Set((logRes.data ?? []).map((r) => r.log_date))
      const pillarRows = (pillarRes.data ?? []) as Row[]
      const rowByDate = new Map(pillarRows.map((r) => [r.log_date as string, r]))
      const dateList = Array.from({ length: days }, (_, i) => isoDateDaysAgo(days - 1 - i))

      setPoints(
        dateList.map((date) => {
          const row = rowByDate.get(date)
          return {
            date,
            value: row ? extractValue(row) : null,
            registrado: registeredDates.has(date),
          }
        }),
      )
      setRows(pillarRows)
      setLoading(false)
    })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columns, days])

  return { points, rows, loading, errorMessage }
}
