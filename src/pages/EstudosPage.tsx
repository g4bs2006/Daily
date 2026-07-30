import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { usePillarTrend } from '../hooks/usePillarTrend'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { PillarTrendSection } from '../components/ui/PillarTrendSection'
import { TrendBarChart } from '../components/ui/TrendBarChart'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconPencil } from '../components/ui/icons'

const TREND_DAYS = 30

type EstudosRow = { log_date: string; minutos_estudo: number | null }

export function EstudosPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const trend = usePillarTrend<EstudosRow>(
    'pillar_estudos',
    'minutos_estudo',
    TREND_DAYS,
    (row) => row.minutos_estudo,
  )
  const [minutosEstudo, setMinutosEstudo] = useState('')
  const [materia, setMateria] = useState('')
  const [progresso, setProgresso] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_estudos')
      .select('minutos_estudo, materia, progresso')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setMinutosEstudo(data?.minutos_estudo?.toString() ?? '')
        setMateria(data?.materia ?? '')
        setProgresso(data?.progresso ?? '')
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

    const { error } = await supabase.from('pillar_estudos').upsert(
      {
        log_date: logDate,
        minutos_estudo: minutosEstudo ? Number(minutosEstudo) : null,
        materia: materia || null,
        progresso: progresso || null,
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

  const totalMinutos = trend.rows.reduce((sum, r) => sum + (r.minutos_estudo ?? 0), 0)
  const diasComEstudo = trend.rows.filter((r) => (r.minutos_estudo ?? 0) > 0).length
  const mediaMinutos = diasComEstudo > 0 ? Math.round(totalMinutos / diasComEstudo) : 0

  return (
    <PillarPageShell
      icon={IconPencil}
      title="Estudos"
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
            { label: 'Total', value: `${Math.round(totalMinutos / 60)} h`, caption: `em ${TREND_DAYS} dias` },
            { label: 'Média/dia', value: `${mediaMinutos} min`, caption: 'dias com estudo' },
            { label: 'Dias ativos', value: String(diasComEstudo), caption: `de ${TREND_DAYS}` },
          ]}
        >
          <TrendBarChart
            points={trend.points}
            title={`Minutos de estudo — últimos ${TREND_DAYS} dias`}
            formatValue={(v) => `${v} min`}
          />
        </PillarTrendSection>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>MINUTOS ESTUDADOS</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minutosEstudo}
            onChange={(e) => setMinutosEstudo(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>MATÉRIA</label>
          <input type="text" value={materia} onChange={(e) => setMateria(e.target.value)} className={fieldInputClass} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={fieldLabelClass}>PROGRESSO (OPCIONAL)</label>
        <input type="text" value={progresso} onChange={(e) => setProgresso(e.target.value)} className={fieldInputClass} />
      </div>
    </PillarPageShell>
  )
}
