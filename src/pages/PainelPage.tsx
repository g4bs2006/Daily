import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDateShort, isoDateDaysAgo, todayIsoDate } from '../lib/date'
import { StudyTrendChart } from '../components/history/StudyTrendChart'
import { Stamp } from '../components/ui/Stamp'
import { SealDot } from '../components/ui/SealDot'
import { IconGear } from '../components/ui/icons'

const DAYS = 7
const STUDY_TREND_DAYS = 30

type DailyLogRow = { log_date: string; overall_note: string | null }
type AcademiaRow = { log_date: string; treinou: boolean; duracao_min: number | null }
type EstudosRow = { log_date: string; minutos_estudo: number | null }

export function PainelPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dailyLogs, setDailyLogs] = useState<DailyLogRow[]>([])
  const [academiaRows, setAcademiaRows] = useState<AcademiaRow[]>([])
  const [estudosRows, setEstudosRows] = useState<EstudosRow[]>([])

  useEffect(() => {
    let active = true
    const from = isoDateDaysAgo(DAYS - 1)
    const to = todayIsoDate()
    const trendFrom = isoDateDaysAgo(STUDY_TREND_DAYS - 1)

    Promise.all([
      supabase.from('daily_log').select('log_date, overall_note').gte('log_date', trendFrom).lte('log_date', to),
      supabase
        .from('pillar_academia')
        .select('log_date, treinou, duracao_min')
        .gte('log_date', from)
        .lte('log_date', to),
      supabase.from('pillar_estudos').select('log_date, minutos_estudo').gte('log_date', trendFrom).lte('log_date', to),
    ]).then(([dailyLogRes, academiaRes, estudosRes]) => {
      if (!active) return
      const error = dailyLogRes.error ?? academiaRes.error ?? estudosRes.error
      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }
      setDailyLogs(dailyLogRes.data ?? [])
      setAcademiaRows(academiaRes.data ?? [])
      setEstudosRows(estudosRes.data ?? [])
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  if (loading) return null
  if (errorMessage) {
    return <p className="p-4 font-mono text-xs text-rust">{errorMessage}</p>
  }

  const days = Array.from({ length: DAYS }, (_, i) => isoDateDaysAgo(DAYS - 1 - i))
  const trendDays = Array.from({ length: STUDY_TREND_DAYS }, (_, i) => isoDateDaysAgo(STUDY_TREND_DAYS - 1 - i))
  const logByDate = new Map(dailyLogs.map((row) => [row.log_date, row]))
  const academiaByDate = new Map(academiaRows.map((row) => [row.log_date, row]))
  const estudosByDate = new Map(estudosRows.map((row) => [row.log_date, row]))

  const treinos = academiaRows.filter((row) => row.treinou)
  const totalDuracao = treinos.reduce((sum, row) => sum + (row.duracao_min ?? 0), 0)

  const studyTrendPoints = trendDays.map((date) => ({
    date,
    minutos: estudosByDate.get(date)?.minutos_estudo ?? null,
    registrado: logByDate.has(date),
  }))

  let streak = 0
  for (let i = trendDays.length - 1; i >= 0; i--) {
    if (!logByDate.has(trendDays[i])) break
    streak++
  }

  const today = todayIsoDate()

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-8">
      <div>
        <p className="font-mono text-xs tracking-wide text-brass">PAINEL DE BORDO</p>
        <h1 className="font-display text-2xl text-parchment">Últimos {DAYS} dias</h1>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-ink-2 p-4">
        <Stamp
          ringText="DIAS SEGUIDOS •"
          value={streak}
          caption="STREAK"
          tone={streak > 0 ? 'moss' : 'muted'}
          dashed={streak === 0}
          size={76}
        />
        <div>
          <h2 className="font-mono text-xs tracking-wide text-parchment-dim">CONSISTÊNCIA</h2>
          <p className="mt-1 font-body text-sm text-parchment">
            {streak === 0
              ? 'Nenhum dia registrado ainda hoje.'
              : `${streak} dia${streak === 1 ? '' : 's'} seguidos registrados`}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-ink-2 p-4">
        <h2 className="flex items-center gap-2 font-mono text-xs tracking-wide text-brass">
          <IconGear size={13} />
          ACADEMIA
        </h2>
        <p className="mt-1 font-body text-sm text-parchment-dim">
          {treinos.length} treino{treinos.length === 1 ? '' : 's'} em {DAYS} dias
          {treinos.length > 0 && ` · ${Math.round(totalDuracao / treinos.length)} min em média`}
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-ink-2 p-4">
        <StudyTrendChart points={studyTrendPoints} />
      </div>

      <ul className="space-y-2">
        {[...days].reverse().map((date) => {
          const log = logByDate.get(date)
          const academia = academiaByDate.get(date)
          const registrado = Boolean(log)
          return (
            <li key={date}>
              <Link
                to={date === today ? '/hoje' : `/hoje?d=${date}`}
                className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-ink-2 p-3 text-left hover:border-brass/50"
              >
                <SealDot filled={registrado} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm capitalize text-parchment">{formatDateShort(date)}</span>
                    {!registrado && (
                      <span className="font-mono text-xs text-parchment-dim">não registrado</span>
                    )}
                    {registrado && academia && (
                      <span className="font-mono text-xs text-parchment-dim">
                        {academia.treinou ? `treinou · ${academia.duracao_min ?? '?'} min` : 'não treinou'}
                      </span>
                    )}
                  </div>
                  {log?.overall_note && (
                    <p className="mt-1 truncate font-body text-sm text-parchment-dim">{log.overall_note}</p>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
