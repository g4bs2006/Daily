import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDateShort, isoDateDaysAgo, todayIsoDate } from '../../lib/date'

const DAYS = 7

type DailyLogRow = { log_date: string; overall_note: string | null }
type AcademiaRow = { log_date: string; treinou: boolean; duracao_min: number | null }

export function History() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dailyLogs, setDailyLogs] = useState<DailyLogRow[]>([])
  const [academiaRows, setAcademiaRows] = useState<AcademiaRow[]>([])

  useEffect(() => {
    let active = true
    const from = isoDateDaysAgo(DAYS - 1)
    const to = todayIsoDate()

    Promise.all([
      supabase.from('daily_log').select('log_date, overall_note').gte('log_date', from).lte('log_date', to),
      supabase
        .from('pillar_academia')
        .select('log_date, treinou, duracao_min')
        .gte('log_date', from)
        .lte('log_date', to),
    ]).then(([dailyLogRes, academiaRes]) => {
      if (!active) return
      const error = dailyLogRes.error ?? academiaRes.error
      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }
      setDailyLogs(dailyLogRes.data ?? [])
      setAcademiaRows(academiaRes.data ?? [])
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  if (loading) return null
  if (errorMessage) {
    return <p className="p-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
  }

  const days = Array.from({ length: DAYS }, (_, i) => isoDateDaysAgo(DAYS - 1 - i))
  const logByDate = new Map(dailyLogs.map((row) => [row.log_date, row]))
  const academiaByDate = new Map(academiaRows.map((row) => [row.log_date, row]))

  const treinos = academiaRows.filter((row) => row.treinou)
  const totalDuracao = treinos.reduce((sum, row) => sum + (row.duracao_min ?? 0), 0)

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Últimos {DAYS} dias</h1>

      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Academia</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {treinos.length} treino{treinos.length === 1 ? '' : 's'} em {DAYS} dias
          {treinos.length > 0 && ` · ${Math.round(totalDuracao / treinos.length)} min em média`}
        </p>
      </div>

      <ul className="space-y-2">
        {[...days].reverse().map((date) => {
          const log = logByDate.get(date)
          const academia = academiaByDate.get(date)
          const registrado = Boolean(log)
          return (
            <li
              key={date}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                  {formatDateShort(date)}
                </span>
                {!registrado && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">não registrado</span>
                )}
                {registrado && academia && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {academia.treinou ? `Treinou · ${academia.duracao_min ?? '?'} min` : 'Não treinou'}
                  </span>
                )}
              </div>
              {log?.overall_note && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{log.overall_note}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
