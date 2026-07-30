import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { usePillarTrend } from '../hooks/usePillarTrend'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { PillarTrendSection } from '../components/ui/PillarTrendSection'
import { TrendBarChart } from '../components/ui/TrendBarChart'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconBriefcase } from '../components/ui/icons'

const TREND_DAYS = 14

type TrabalhoRow = { log_date: string; tarefas_concluidas: number | null; horas_foco: number | null }

export function TrabalhoPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const trend = usePillarTrend<TrabalhoRow>(
    'pillar_trabalho',
    'tarefas_concluidas, horas_foco',
    TREND_DAYS,
    (row) => row.horas_foco,
  )
  const [tarefasConcluidas, setTarefasConcluidas] = useState('')
  const [horasFoco, setHorasFoco] = useState('')
  const [entregaPrincipal, setEntregaPrincipal] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [recordExists, setRecordExists] = useState(false)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_trabalho')
      .select('tarefas_concluidas, horas_foco, entrega_principal')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setTarefasConcluidas(data?.tarefas_concluidas?.toString() ?? '')
        setHorasFoco(data?.horas_foco?.toString() ?? '')
        setEntregaPrincipal(data?.entrega_principal ?? '')
        setRecordExists(Boolean(data))
        setState('idle')
      })
    return () => {
      active = false
    }
  }, [logDate])

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

    const { error } = await supabase.from('pillar_trabalho').upsert(
      {
        log_date: logDate,
        tarefas_concluidas: tarefasConcluidas ? Number(tarefasConcluidas) : null,
        horas_foco: horasFoco ? Number(horasFoco) : null,
        entrega_principal: entregaPrincipal || null,
      },
      { onConflict: 'log_date' },
    )
    if (error) {
      setErrorMessage(error.message)
      setState('error')
      return
    }
    setRecordExists(true)
    setState('saved')
  }

  async function handleDeleteRecord() {
    await supabase.from('pillar_trabalho').delete().eq('log_date', logDate)
    setTarefasConcluidas('')
    setHorasFoco('')
    setEntregaPrincipal('')
    setRecordExists(false)
    setState('idle')
  }

  const totalTarefas = trend.rows.reduce((sum, r) => sum + (r.tarefas_concluidas ?? 0), 0)
  const focoRows = trend.rows.filter((r) => r.horas_foco !== null)
  const mediaFoco =
    focoRows.length > 0
      ? (focoRows.reduce((sum, r) => sum + (r.horas_foco ?? 0), 0) / focoRows.length).toFixed(1)
      : '0'

  return (
    <PillarPageShell
      icon={IconBriefcase}
      title="Trabalho"
      logDate={logDate}
      isToday={isToday}
      onPrevDay={goPrevDay}
      onNextDay={goNextDay}
      onToday={goToday}
      saveState={state}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      canDelete={recordExists}
      onDelete={handleDeleteRecord}
      footer={
        <PillarTrendSection
          loading={trend.loading}
          stats={[
            { label: 'Tarefas', value: String(totalTarefas), caption: `em ${TREND_DAYS} dias` },
            { label: 'Foco médio', value: `${mediaFoco} h`, caption: 'por dia' },
          ]}
        >
          <TrendBarChart points={trend.points} title={`Horas de foco — últimos ${TREND_DAYS} dias`} formatValue={(v) => `${v} h`} />
        </PillarTrendSection>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>TAREFAS CONCLUÍDAS</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={tarefasConcluidas}
            onChange={(e) => setTarefasConcluidas(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>HORAS DE FOCO</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={horasFoco}
            onChange={(e) => setHorasFoco(e.target.value)}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={fieldLabelClass}>ENTREGA PRINCIPAL (OPCIONAL)</label>
        <input
          type="text"
          value={entregaPrincipal}
          onChange={(e) => setEntregaPrincipal(e.target.value)}
          className={fieldInputClass}
        />
      </div>
    </PillarPageShell>
  )
}
