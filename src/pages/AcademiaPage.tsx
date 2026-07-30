import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { usePillarTrend } from '../hooks/usePillarTrend'
import { usePlanoSemana } from '../hooks/usePlanoSemana'
import { useExercicios } from '../hooks/useExercicios'
import { isoDateDaysAgo, todayIsoDate } from '../lib/date'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { PillarTrendSection } from '../components/ui/PillarTrendSection'
import { TrendBarChart, type TrendPoint } from '../components/ui/TrendBarChart'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { WeeklyPlanConfig } from '../components/academia/WeeklyPlanConfig'
import { SetLogger, type LoggedSet } from '../components/academia/SetLogger'
import { IconGear } from '../components/ui/icons'

const TREND_DAYS = 14
const PROGRESSAO_DAYS = 60

type AcademiaRow = { log_date: string; treinou: boolean; duracao_min: number | null }

export function AcademiaPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const trend = usePillarTrend<AcademiaRow>(
    'pillar_academia',
    'treinou, duracao_min',
    TREND_DAYS,
    (row) => row.duracao_min,
  )
  const { planoPorDia, loading: planoLoading, reload: reloadPlano } = usePlanoSemana()
  const { exercicios, loading: exerciciosLoading, reload: reloadExercicios } = useExercicios()

  const [treinou, setTreinou] = useState(false)
  const [duracaoMin, setDuracaoMin] = useState('')
  const [tipo, setTipo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPlanConfig, setShowPlanConfig] = useState(false)

  const [setsForDate, setSetsForDate] = useState<Record<string, LoggedSet[]>>({})
  const [pendingExtraIds, setPendingExtraIds] = useState<string[]>([])
  const [freeExercicioPick, setFreeExercicioPick] = useState('')

  const [progressaoExercicioId, setProgressaoExercicioId] = useState('')
  const [progressaoPoints, setProgressaoPoints] = useState<TrendPoint[]>([])
  const [progressaoLoading, setProgressaoLoading] = useState(false)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_academia')
      .select('treinou, duracao_min, tipo, observacao')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setTreinou(data?.treinou ?? false)
        setDuracaoMin(data?.duracao_min?.toString() ?? '')
        setTipo(data?.tipo ?? '')
        setObservacao(data?.observacao ?? '')
        setState('idle')
      })
    return () => {
      active = false
    }
  }, [logDate])

  async function loadSets() {
    const { data, error } = await supabase
      .from('treino_serie')
      .select('id, exercicio_id, ordem_serie, reps, carga_kg')
      .eq('log_date', logDate)
      .order('ordem_serie')
    if (error) return
    const grouped: Record<string, LoggedSet[]> = {}
    for (const row of data ?? []) {
      const exercicioId = row.exercicio_id as string
      ;(grouped[exercicioId] ??= []).push(row)
    }
    setSetsForDate(grouped)
  }

  useEffect(() => {
    loadSets()
    setPendingExtraIds([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logDate])

  useEffect(() => {
    if (!progressaoExercicioId) {
      setProgressaoPoints([])
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
        .select('log_date, carga_kg')
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
      for (const row of setsRes.data ?? []) {
        if (row.carga_kg === null) continue
        const current = maxByDate.get(row.log_date) ?? 0
        maxByDate.set(row.log_date, Math.max(current, row.carga_kg))
      }
      const dateList = Array.from({ length: PROGRESSAO_DAYS }, (_, i) => isoDateDaysAgo(PROGRESSAO_DAYS - 1 - i))
      setProgressaoPoints(
        dateList.map((date) => ({
          date,
          value: maxByDate.get(date) ?? null,
          registrado: registered.has(date),
        })),
      )
      setProgressaoLoading(false)
    })
    return () => {
      active = false
    }
  }, [progressaoExercicioId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState('saving')
    setErrorMessage(null)

    const ensureRes = await ensureDailyLog(logDate)
    if (ensureRes.error) {
      setErrorMessage(ensureRes.error.message)
      setState('error')
      return
    }

    const { error } = await supabase.from('pillar_academia').upsert(
      {
        log_date: logDate,
        treinou,
        duracao_min: duracaoMin ? Number(duracaoMin) : null,
        tipo: tipo || null,
        observacao: observacao || null,
      },
      { onConflict: 'log_date' },
    )
    if (error) {
      setErrorMessage(error.message)
      setState('error')
      return
    }
    setState('saved')
  }

  async function handleAddSet(exercicioId: string, reps: number | null, carga: number | null) {
    const ensureRes = await ensureDailyLog(logDate)
    if (ensureRes.error) return
    const ordem = (setsForDate[exercicioId]?.length ?? 0) + 1
    await supabase
      .from('treino_serie')
      .insert({ log_date: logDate, exercicio_id: exercicioId, ordem_serie: ordem, reps, carga_kg: carga })
    loadSets()
  }

  async function handleRemoveSet(id: string) {
    await supabase.from('treino_serie').delete().eq('id', id)
    loadSets()
  }

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

  const diaSemana = new Date(logDate + 'T00:00:00').getDay()
  const planoHoje = planoPorDia[diaSemana] ?? null
  const planExercicioIds = new Set((planoHoje?.itens ?? []).map((i) => i.exercicio_id))
  const extraIdsFromSets = Object.keys(setsForDate).filter((id) => !planExercicioIds.has(id))
  const allExtraIds = Array.from(new Set([...extraIdsFromSets, ...pendingExtraIds]))
  const exercicioById = new Map(exercicios.map((ex) => [ex.id, ex]))
  const pickerOptions = exercicios.filter((ex) => !planExercicioIds.has(ex.id) && !allExtraIds.includes(ex.id))

  return (
    <PillarPageShell
      icon={IconGear}
      title="Academia"
      logDate={logDate}
      isToday={isToday}
      onPrevDay={goPrevDay}
      onNextDay={goNextDay}
      onToday={goToday}
      saveState={state}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      footer={
        <PillarTrendSection
          loading={trend.loading}
          stats={[
            { label: 'Treinos', value: String(treinos.length), caption: `em ${TREND_DAYS} dias` },
            { label: 'Duração média', value: `${mediaDuracao} min` },
            { label: 'Sequência', value: String(treinoStreak), caption: treinoStreak === 1 ? 'dia' : 'dias' },
          ]}
        >
          <TrendBarChart
            points={trend.points}
            title={`Duração do treino — últimos ${TREND_DAYS} dias`}
            formatValue={(v) => `${v} min`}
          />

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
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
              <TrendBarChart
                points={progressaoPoints}
                title={`Carga máxima — ${exercicioById.get(progressaoExercicioId)?.nome ?? ''}`}
                formatValue={(v) => `${v} kg`}
              />
            )}
            {!progressaoExercicioId && (
              <p className="font-mono text-xs text-parchment-dim">
                Escolha um exercício para ver a evolução de carga nos últimos {PROGRESSAO_DAYS} dias.
              </p>
            )}
          </div>
        </PillarTrendSection>
      }
    >
      <label className="flex items-center gap-2 font-body text-base text-parchment">
        <input
          type="checkbox"
          checked={treinou}
          onChange={(e) => setTreinou(e.target.checked)}
          className="h-5 w-5 accent-brass"
        />
        Treinou hoje
      </label>

      {treinou && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={fieldLabelClass}>DURAÇÃO (MIN)</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={duracaoMin}
                onChange={(e) => setDuracaoMin(e.target.value)}
                className={fieldInputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={fieldLabelClass}>TIPO</label>
              <input
                type="text"
                placeholder="Musculação, corrida..."
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={fieldInputClass}
              />
            </div>
          </div>

          {!planoLoading && !exerciciosLoading && (
            <div className="space-y-3 rounded-lg border border-white/10 bg-ink-2 p-3">
              <p className="font-mono text-xs tracking-wide text-brass">
                {planoHoje?.nome_treino ? `TREINO DE HOJE — ${planoHoje.nome_treino.toUpperCase()}` : 'REGISTRAR SÉRIES'}
              </p>

              {(planoHoje?.itens ?? []).map((item) => (
                <SetLogger
                  key={item.exercicio_id}
                  nome={item.exercicio?.nome ?? ''}
                  metaLabel={
                    item.series_alvo || item.reps_alvo
                      ? `alvo: ${item.series_alvo ?? '?'}x${item.reps_alvo ?? '?'}`
                      : undefined
                  }
                  sets={setsForDate[item.exercicio_id] ?? []}
                  onAddSet={(reps, carga) => handleAddSet(item.exercicio_id, reps, carga)}
                  onRemoveSet={handleRemoveSet}
                />
              ))}

              {allExtraIds.map((id) => (
                <SetLogger
                  key={id}
                  nome={exercicioById.get(id)?.nome ?? ''}
                  sets={setsForDate[id] ?? []}
                  onAddSet={(reps, carga) => handleAddSet(id, reps, carga)}
                  onRemoveSet={handleRemoveSet}
                />
              ))}

              <div className="flex flex-wrap gap-2">
                <select
                  value={freeExercicioPick}
                  onChange={(e) => setFreeExercicioPick(e.target.value)}
                  className="rounded-md border border-white/15 bg-ink px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
                >
                  <option value="">+ exercício livre</option>
                  {pickerOptions.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!freeExercicioPick) return
                    setPendingExtraIds([...pendingExtraIds, freeExercicioPick])
                    setFreeExercicioPick('')
                  }}
                  disabled={!freeExercicioPick}
                  className="rounded-md bg-white/10 px-3 py-1 font-mono text-xs text-parchment disabled:opacity-50"
                >
                  adicionar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="space-y-1">
        <label className={fieldLabelClass}>OBSERVAÇÃO (OPCIONAL)</label>
        <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} className={fieldInputClass} />
      </div>

      <button
        type="button"
        onClick={() => setShowPlanConfig((v) => !v)}
        className="font-mono text-xs text-parchment-dim hover:text-parchment"
      >
        {showPlanConfig ? '– ocultar plano semanal' : '+ gerenciar plano semanal'}
      </button>

      {showPlanConfig && !planoLoading && !exerciciosLoading && (
        <WeeklyPlanConfig
          planoPorDia={planoPorDia}
          exercicios={exercicios}
          onReloadPlano={reloadPlano}
          onReloadExercicios={reloadExercicios}
        />
      )}
    </PillarPageShell>
  )
}
