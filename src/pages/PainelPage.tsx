import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isoDateDaysAgo, todayIsoDate } from '../lib/date'
import { StatTile } from '../components/ui/StatTile'
import { Stamp } from '../components/ui/Stamp'
import { HeatmapCalendar } from '../components/ui/HeatmapCalendar'

const DAYS = 7

type DailyLogRow = { log_date: string }
type AcademiaRow = { log_date: string; treinou: boolean; duracao_min: number | null }
type TrabalhoRow = { log_date: string; horas_foco: number | null }
type EstudosRow = { log_date: string; minutos_estudo: number | null }
type FinancasRow = { log_date: string; gasto_dia: number | null }
type HabitosRow = { log_date: string; total_marcados: number | null; total_possivel: number | null }

const PILLAR_TABLES = ['pillar_academia', 'pillar_trabalho', 'pillar_estudos', 'pillar_financas', 'pillar_habitos']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function PainelPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dailyLogs, setDailyLogs] = useState<DailyLogRow[]>([])
  const [academiaRows, setAcademiaRows] = useState<AcademiaRow[]>([])
  const [trabalhoRows, setTrabalhoRows] = useState<TrabalhoRow[]>([])
  const [estudosRows, setEstudosRows] = useState<EstudosRow[]>([])
  const [financasRows, setFinancasRows] = useState<FinancasRow[]>([])
  const [habitosRows, setHabitosRows] = useState<HabitosRow[]>([])

  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calLoading, setCalLoading] = useState(true)
  const [calRegistered, setCalRegistered] = useState<Set<string>>(new Set())
  const [calCounts, setCalCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    let active = true
    const from = isoDateDaysAgo(DAYS - 1)
    const to = todayIsoDate()

    Promise.all([
      supabase.from('daily_log').select('log_date').gte('log_date', from).lte('log_date', to),
      supabase.from('pillar_academia').select('log_date, treinou, duracao_min').gte('log_date', from).lte('log_date', to),
      supabase.from('pillar_trabalho').select('log_date, horas_foco').gte('log_date', from).lte('log_date', to),
      supabase.from('pillar_estudos').select('log_date, minutos_estudo').gte('log_date', from).lte('log_date', to),
      supabase.from('pillar_financas').select('log_date, gasto_dia').gte('log_date', from).lte('log_date', to),
      supabase
        .from('pillar_habitos')
        .select('log_date, total_marcados, total_possivel')
        .gte('log_date', from)
        .lte('log_date', to),
    ]).then(([logRes, academiaRes, trabalhoRes, estudosRes, financasRes, habitosRes]) => {
      if (!active) return
      const error =
        logRes.error ?? academiaRes.error ?? trabalhoRes.error ?? estudosRes.error ?? financasRes.error ?? habitosRes.error
      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }
      setDailyLogs(logRes.data ?? [])
      setAcademiaRows(academiaRes.data ?? [])
      setTrabalhoRows(trabalhoRes.data ?? [])
      setEstudosRows(estudosRes.data ?? [])
      setFinancasRows(financasRes.data ?? [])
      setHabitosRows(habitosRes.data ?? [])
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setCalLoading(true)
    const from = `${calYear}-${pad(calMonth + 1)}-01`
    const to = `${calYear}-${pad(calMonth + 1)}-${pad(new Date(calYear, calMonth + 1, 0).getDate())}`

    Promise.all([
      supabase.from('daily_log').select('log_date').gte('log_date', from).lte('log_date', to),
      ...PILLAR_TABLES.map((table) =>
        supabase.from(table).select('log_date').gte('log_date', from).lte('log_date', to),
      ),
    ]).then(([logRes, ...pillarResults]) => {
      if (!active) return
      const error = logRes.error ?? pillarResults.find((r) => r.error)?.error
      if (error) {
        setCalLoading(false)
        return
      }
      const registered = new Set((logRes.data ?? []).map((r) => r.log_date as string))
      const counts = new Map<string, number>()
      for (const result of pillarResults) {
        for (const row of result.data ?? []) {
          const date = (row as { log_date: string }).log_date
          counts.set(date, (counts.get(date) ?? 0) + 1)
        }
      }
      setCalRegistered(registered)
      setCalCounts(counts)
      setCalLoading(false)
    })

    return () => {
      active = false
    }
  }, [calYear, calMonth])

  if (loading) return null
  if (errorMessage) {
    return <p className="p-4 font-mono text-xs text-rust">{errorMessage}</p>
  }

  const days = Array.from({ length: DAYS }, (_, i) => isoDateDaysAgo(DAYS - 1 - i))
  const logByDate = new Set(dailyLogs.map((row) => row.log_date))

  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (!logByDate.has(days[i])) break
    streak++
  }

  const treinos = academiaRows.filter((r) => r.treinou)
  const totalHorasFoco = trabalhoRows.reduce((sum, r) => sum + (r.horas_foco ?? 0), 0)
  const totalMinutosEstudo = estudosRows.reduce((sum, r) => sum + (r.minutos_estudo ?? 0), 0)
  const totalGasto = financasRows.reduce((sum, r) => sum + (r.gasto_dia ?? 0), 0)
  const habitosComPossivel = habitosRows.filter((r) => (r.total_possivel ?? 0) > 0)
  const mediaHabitos =
    habitosComPossivel.length > 0
      ? Math.round(
          (habitosComPossivel.reduce((sum, r) => sum + (r.total_marcados ?? 0) / (r.total_possivel ?? 1), 0) /
            habitosComPossivel.length) *
            100,
        )
      : null

  const statTiles = [
    { key: 'academia', label: 'Academia', value: `${treinos.length}/${DAYS}`, caption: 'dias treinados' },
    { key: 'trabalho', label: 'Trabalho', value: `${totalHorasFoco.toFixed(1)} h`, caption: 'de foco' },
    { key: 'estudos', label: 'Estudos', value: `${Math.round(totalMinutosEstudo / 60)} h`, caption: 'estudadas' },
    { key: 'financas', label: 'Finanças', value: `R$ ${totalGasto.toFixed(0)}`, caption: 'gastos' },
    { key: 'hábitos', label: 'Hábitos', value: mediaHabitos !== null ? `${mediaHabitos}%` : '—', caption: 'conclusão média' },
  ]

  function selectDay(date: string) {
    navigate(date === todayIsoDate() ? '/hoje' : `/hoje?d=${date}`)
  }

  function nextMonth() {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }

  function prevMonth() {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }

  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 lg:px-10">
      <div>
        <p className="font-mono text-xs tracking-wide text-brass">PAINEL DE BORDO</p>
        <h1 className="font-display text-2xl text-parchment">Visão geral</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
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

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {statTiles.map((tile) => (
            <StatTile key={tile.key} label={tile.label} value={tile.value} caption={tile.caption} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-ink-2 p-4">
        {!calLoading && (
          <HeatmapCalendar
            year={calYear}
            month={calMonth}
            countByDate={calCounts}
            registeredDates={calRegistered}
            todayDate={todayIsoDate()}
            onSelectDay={selectDay}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            disableNext={isCurrentMonth}
          />
        )}
      </div>
    </div>
  )
}
