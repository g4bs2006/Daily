import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { usePillarTrend } from '../hooks/usePillarTrend'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { PillarTrendSection } from '../components/ui/PillarTrendSection'
import { TrendBarChart } from '../components/ui/TrendBarChart'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconCoin } from '../components/ui/icons'

const TREND_DAYS = 14

type FinancasRow = { log_date: string; gasto_dia: number | null; categoria: string | null }

export function FinancasPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const trend = usePillarTrend<FinancasRow>(
    'pillar_financas',
    'gasto_dia, categoria',
    TREND_DAYS,
    (row) => row.gasto_dia,
  )
  const [gastoDia, setGastoDia] = useState('')
  const [categoria, setCategoria] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_financas')
      .select('gasto_dia, categoria')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setGastoDia(data?.gasto_dia?.toString() ?? '')
        setCategoria(data?.categoria ?? '')
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

    const { error } = await supabase.from('pillar_financas').upsert(
      {
        log_date: logDate,
        gasto_dia: gastoDia ? Number(gastoDia) : null,
        categoria: categoria || null,
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

  const gastosRegistrados = trend.rows.filter((r) => r.gasto_dia !== null)
  const totalGasto = gastosRegistrados.reduce((sum, r) => sum + (r.gasto_dia ?? 0), 0)
  const mediaGasto = gastosRegistrados.length > 0 ? totalGasto / gastosRegistrados.length : 0
  const categoriaFrequente = (() => {
    const counts = new Map<string, number>()
    for (const r of trend.rows) {
      if (!r.categoria) continue
      counts.set(r.categoria, (counts.get(r.categoria) ?? 0) + 1)
    }
    let top: string | null = null
    let topCount = 0
    for (const [categoria, count] of counts) {
      if (count > topCount) {
        top = categoria
        topCount = count
      }
    }
    return top
  })()

  return (
    <PillarPageShell
      icon={IconCoin}
      title="Finanças"
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
            { label: 'Total', value: `R$ ${totalGasto.toFixed(0)}`, caption: `em ${TREND_DAYS} dias` },
            { label: 'Média/dia', value: `R$ ${mediaGasto.toFixed(0)}` },
            { label: 'Categoria top', value: categoriaFrequente ?? '—' },
          ]}
        >
          <TrendBarChart
            points={trend.points}
            title={`Gasto diário — últimos ${TREND_DAYS} dias`}
            formatValue={(v) => `R$ ${v.toFixed(2)}`}
          />
        </PillarTrendSection>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>GASTO DO DIA (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={gastoDia}
            onChange={(e) => setGastoDia(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>CATEGORIA (OPCIONAL)</label>
          <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={fieldInputClass} />
        </div>
      </div>
    </PillarPageShell>
  )
}
