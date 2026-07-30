import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDateShort, isoDateDaysAgo, todayIsoDate } from '../lib/date'
import { StatTile } from '../components/ui/StatTile'
import { Stamp } from '../components/ui/Stamp'
import { SealDot } from '../components/ui/SealDot'
import {
  IconBriefcase,
  IconCheck,
  IconCoin,
  IconGear,
  IconPencil,
} from '../components/ui/icons'

const DAYS = 7

type DailyLogRow = { log_date: string; overall_note: string | null }
type AcademiaRow = { log_date: string; treinou: boolean; duracao_min: number | null }
type TrabalhoRow = { log_date: string; horas_foco: number | null }
type EstudosRow = { log_date: string; minutos_estudo: number | null }
type FinancasRow = { log_date: string; gasto_dia: number | null }
type HabitosRow = { log_date: string; total_marcados: number | null; total_possivel: number | null }

const PILLAR_META = [
  { key: 'academia', label: 'Academia', path: '/academia', Icon: IconGear },
  { key: 'trabalho', label: 'Trabalho', path: '/trabalho', Icon: IconBriefcase },
  { key: 'estudos', label: 'Estudos', path: '/estudos', Icon: IconPencil },
  { key: 'financas', label: 'Finanças', path: '/financas', Icon: IconCoin },
  { key: 'habitos', label: 'Hábitos', path: '/habitos', Icon: IconCheck },
] as const

export function PainelPage() {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dailyLogs, setDailyLogs] = useState<DailyLogRow[]>([])
  const [academiaRows, setAcademiaRows] = useState<AcademiaRow[]>([])
  const [trabalhoRows, setTrabalhoRows] = useState<TrabalhoRow[]>([])
  const [estudosRows, setEstudosRows] = useState<EstudosRow[]>([])
  const [financasRows, setFinancasRows] = useState<FinancasRow[]>([])
  const [habitosRows, setHabitosRows] = useState<HabitosRow[]>([])

  useEffect(() => {
    let active = true
    const from = isoDateDaysAgo(DAYS - 1)
    const to = todayIsoDate()

    Promise.all([
      supabase.from('daily_log').select('log_date, overall_note').gte('log_date', from).lte('log_date', to),
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

  if (loading) return null
  if (errorMessage) {
    return <p className="p-4 font-mono text-xs text-rust">{errorMessage}</p>
  }

  const days = Array.from({ length: DAYS }, (_, i) => isoDateDaysAgo(DAYS - 1 - i))
  const logByDate = new Map(dailyLogs.map((row) => [row.log_date, row]))

  const pillarDateSets: Record<string, Set<string>> = {
    academia: new Set(academiaRows.map((r) => r.log_date)),
    trabalho: new Set(trabalhoRows.map((r) => r.log_date)),
    estudos: new Set(estudosRows.map((r) => r.log_date)),
    financas: new Set(financasRows.map((r) => r.log_date)),
    habitos: new Set(habitosRows.map((r) => r.log_date)),
  }

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
          habitosComPossivel.reduce((sum, r) => sum + (r.total_marcados ?? 0) / (r.total_possivel ?? 1), 0) /
            habitosComPossivel.length *
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

  const today = todayIsoDate()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 lg:px-10">
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {statTiles.map((tile) => (
          <StatTile key={tile.key} label={tile.label} value={tile.value} caption={tile.caption} />
        ))}
      </div>

      <ul className="grid gap-2 lg:grid-cols-2">
        {[...days].reverse().map((date) => {
          const log = logByDate.get(date)
          const registrado = Boolean(log)
          return (
            <li key={date}>
              <Link
                to={date === today ? '/hoje' : `/hoje?d=${date}`}
                className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-ink-2 p-3 text-left hover:border-brass/50"
              >
                <SealDot filled={registrado} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm capitalize text-parchment">{formatDateShort(date)}</span>
                    <div className="flex items-center gap-1.5">
                      {PILLAR_META.map((p) => (
                        <p.Icon
                          key={p.key}
                          size={13}
                          className={pillarDateSets[p.key].has(date) ? 'text-moss' : 'text-parchment-dim/30'}
                        />
                      ))}
                    </div>
                  </div>
                  {log?.overall_note && (
                    <p className="mt-1 truncate font-body text-sm text-parchment-dim">{log.overall_note}</p>
                  )}
                  {!registrado && (
                    <p className="mt-1 font-mono text-xs text-parchment-dim">não registrado</p>
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
