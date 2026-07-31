import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { isoDateDaysAgo, todayIsoDate } from '../../lib/date'
import { usePillarTrend } from '../../hooks/usePillarTrend'
import { useExercicios } from '../../hooks/useExercicios'
import { TrendBarChart, type TrendPoint } from '../../components/ui/TrendBarChart'
import { StatTile } from '../../components/ui/StatTile'

const TREND_DAYS = 30
const PROGRESSAO_DAYS = 60

type AcademiaRow = { log_date: string; treinou: boolean; duracao_min: number | null }

export function AcademiaProgressoPage() {
  const trend = usePillarTrend<AcademiaRow>(
    'pillar_academia',
    'treinou, duracao_min',
    TREND_DAYS,
    (row) => row.duracao_min,
  )
  const { exercicios, loading: exerciciosLoading } = useExercicios()

  const [progressaoExercicioId, setProgressaoExercicioId] = useState('')
  const [progressaoPoints, setProgressaoPoints] = useState<TrendPoint[]>([])
  const [progressaoLoading, setProgressaoLoading] = useState(false)
  const [recordeKg, setRecordeKg] = useState<number | null>(null)
  const [estimado1RM, setEstimado1RM] = useState<number | null>(null)

  useEffect(() => {
    if (!progressaoExercicioId) {
      setProgressaoPoints([])
      setRecordeKg(null)
      setEstimado1RM(null)
      return
    }
    let active = true
    setProgressaoLoading(true)
    const to = todayIsoDate()
    const from = isoDateDaysAgo(PROGRESSAO_DAYS - 1)
    Promise.all([
      supabase.from('daily_log').select('log_date').gte('log_date', from).lte('log_date', to),
      supabase
        .from('treino_serie')
        .select('log_date, reps, carga_kg')
        .eq('exercicio_id', progressaoExercicioId)
        .gte('log_date', from)
        .lte('log_date', to),
    ]).then(([logRes, setsRes]) => {
      if (!active) return
      if (logRes.error || setsRes.error) {
        setProgressaoLoading(false)
        return
      }
      const registered = new Set((logRes.data ?? []).map((r) => r.log_date))
      const maxByDate = new Map<string, number>()
      let maxKg: number | null = null
      let max1RM: number | null = null
      for (const row of setsRes.data ?? []) {
        if (row.carga_kg === null) continue
        const current = maxByDate.get(row.log_date) ?? 0
        maxByDate.set(row.log_date, Math.max(current, row.carga_kg))
        maxKg = maxKg === null ? row.carga_kg : Math.max(maxKg, row.carga_kg)
        if (row.reps !== null && row.reps > 0) {
          const estimated = row.carga_kg * (1 + row.reps / 30)
          max1RM = max1RM === null ? estimated : Math.max(max1RM, estimated)
        }
      }
      const dateList = Array.from({ length: PROGRESSAO_DAYS }, (_, i) => isoDateDaysAgo(PROGRESSAO_DAYS - 1 - i))
      setProgressaoPoints(
        dateList.map((date) => ({
          date,
          value: maxByDate.get(date) ?? null,
          registrado: registered.has(date),
        })),
      )
      setRecordeKg(maxKg)
      setEstimado1RM(max1RM !== null ? Math.round(max1RM) : null)
      setProgressaoLoading(false)
    })
    return () => {
      active = false
    }
  }, [progressaoExercicioId])

  const treinos = trend.rows.filter((r) => r.treinou)
  const mediaDuracao =
    treinos.length > 0
      ? Math.round(treinos.reduce((sum, r) => sum + (r.duracao_min ?? 0), 0) / treinos.length)
      : 0
  const trainedDates = new Set(treinos.map((r) => r.log_date))
  let treinoStreak = 0
  for (let i = trend.points.length - 1; i >= 0; i--) {
    if (!trainedDates.has(trend.points[i].date)) break
    treinoStreak++
  }

  const exercicioById = new Map(exercicios.map((ex) => [ex.id, ex]))

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 lg:px-10">
      <div>
        <p className="font-mono text-xs tracking-wide text-brass">ACADEMIA</p>
        <h1 className="font-display text-2xl text-parchment">Progresso</h1>
      </div>

      {!trend.loading && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="Treinos" value={String(treinos.length)} caption={`em ${TREND_DAYS} dias`} />
            <StatTile label="Duração média" value={`${mediaDuracao} min`} />
            <StatTile label="Sequência" value={String(treinoStreak)} caption={treinoStreak === 1 ? 'dia' : 'dias'} />
          </div>

          <div className="rounded-lg border border-white/10 bg-ink-2 p-4">
            <TrendBarChart
              points={trend.points}
              title={`Duração do treino — últimos ${TREND_DAYS} dias`}
              formatValue={(v) => `${v} min`}
            />
          </div>
        </>
      )}

      {!exerciciosLoading && (
        <div className="rounded-lg border border-white/10 bg-ink-2 p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs tracking-wide text-parchment-dim">PROGRESSÃO DE CARGA</p>
            <select
              value={progressaoExercicioId}
              onChange={(e) => setProgressaoExercicioId(e.target.value)}
              className="rounded-md border border-white/15 bg-ink px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
            >
              <option value="">Selecionar exercício</option>
              {exercicios.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nome}
                </option>
              ))}
            </select>
          </div>
          {progressaoExercicioId && !progressaoLoading && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Recorde" value={recordeKg !== null ? `${recordeKg} kg` : '—'} caption={`em ${PROGRESSAO_DAYS} dias`} />
                <StatTile label="1RM estimado" value={estimado1RM !== null ? `${estimado1RM} kg` : '—'} caption="fórmula de Epley" />
              </div>
              <TrendBarChart
                points={progressaoPoints}
                title={`Carga máxima — ${exercicioById.get(progressaoExercicioId)?.nome ?? ''}`}
                formatValue={(v) => `${v} kg`}
              />
            </div>
          )}
          {!progressaoExercicioId && (
            <p className="mt-3 font-mono text-xs text-parchment-dim">
              Escolha um exercício para ver a evolução de carga nos últimos {PROGRESSAO_DAYS} dias.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
