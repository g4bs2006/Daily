import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { usePillarTrend } from '../hooks/usePillarTrend'
import { useOrcamentoCategorias } from '../hooks/useOrcamentoCategorias'
import { todayIsoDate } from '../lib/date'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { PillarTrendSection } from '../components/ui/PillarTrendSection'
import { TrendBarChart } from '../components/ui/TrendBarChart'
import { BudgetMeter } from '../components/ui/BudgetMeter'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconCoin } from '../components/ui/icons'

const TREND_DAYS = 14

type FinancasRow = { log_date: string; gasto_dia: number | null; categoria: string | null }

function currentMonthRange() {
  const today = todayIsoDate()
  const from = today.slice(0, 7) + '-01'
  return { from, to: today }
}

export function FinancasPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const trend = usePillarTrend<FinancasRow>(
    'pillar_financas',
    'gasto_dia, categoria',
    TREND_DAYS,
    (row) => row.gasto_dia,
  )
  const { categorias, loading: categoriasLoading, reload: reloadCategorias } = useOrcamentoCategorias()
  const [gastoDia, setGastoDia] = useState('')
  const [categoria, setCategoria] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [novoLimite, setNovoLimite] = useState('')
  const [configSaving, setConfigSaving] = useState(false)
  const [monthRows, setMonthRows] = useState<FinancasRow[]>([])

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

  useEffect(() => {
    let active = true
    const { from, to } = currentMonthRange()
    supabase
      .from('pillar_financas')
      .select('log_date, gasto_dia, categoria')
      .gte('log_date', from)
      .lte('log_date', to)
      .then(({ data, error }) => {
        if (!active || error) return
        setMonthRows(data ?? [])
      })
    return () => {
      active = false
    }
  }, [state])

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

  async function handleAddCategoria(e: FormEvent) {
    e.preventDefault()
    const nome = novaCategoria.trim()
    if (!nome) return
    setConfigSaving(true)
    const ordem = categorias.length > 0 ? Math.max(...categorias.map((c) => c.ordem)) + 1 : 0
    await supabase
      .from('orcamento_categoria')
      .insert({ categoria: nome, limite_mensal: novoLimite ? Number(novoLimite) : null, ordem })
    setNovaCategoria('')
    setNovoLimite('')
    setConfigSaving(false)
    reloadCategorias()
  }

  async function handleUpdateLimite(id: string, limite: string) {
    setConfigSaving(true)
    await supabase
      .from('orcamento_categoria')
      .update({ limite_mensal: limite ? Number(limite) : null })
      .eq('id', id)
    setConfigSaving(false)
    reloadCategorias()
  }

  async function handleRemoveCategoria(id: string) {
    setConfigSaving(true)
    await supabase.from('orcamento_categoria').delete().eq('id', id)
    setConfigSaving(false)
    reloadCategorias()
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

  const gastoPorCategoria = new Map<string, number>()
  for (const row of monthRows) {
    if (!row.categoria || row.gasto_dia === null) continue
    gastoPorCategoria.set(row.categoria, (gastoPorCategoria.get(row.categoria) ?? 0) + row.gasto_dia)
  }
  const categoriasComOrcamento = categorias.filter((c) => c.limite_mensal !== null)

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
          {categoriasComOrcamento.length > 0 && (
            <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
              <p className="font-mono text-xs tracking-wide text-parchment-dim">ORÇAMENTO DO MÊS</p>
              {categoriasComOrcamento.map((c) => (
                <BudgetMeter
                  key={c.id}
                  label={c.categoria}
                  spent={gastoPorCategoria.get(c.categoria) ?? 0}
                  limit={c.limite_mensal ?? 0}
                />
              ))}
            </div>
          )}
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
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={fieldInputClass}>
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.categoria}>
                {c.categoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowConfig((v) => !v)}
        className="font-mono text-xs text-parchment-dim hover:text-parchment"
      >
        {showConfig ? '– ocultar categorias' : '+ gerenciar categorias e orçamento'}
      </button>

      {showConfig && !categoriasLoading && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-ink p-3">
          <ul className="space-y-2">
            {categorias.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="flex-1 font-body text-sm text-parchment">{c.categoria}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder="limite R$"
                  defaultValue={c.limite_mensal ?? ''}
                  onBlur={(e) => handleUpdateLimite(c.id, e.target.value)}
                  disabled={configSaving}
                  className="w-24 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategoria(c.id)}
                  disabled={configSaving}
                  className="font-mono text-xs text-rust disabled:opacity-50"
                >
                  remover
                </button>
              </li>
            ))}
            {categorias.length === 0 && (
              <p className="font-mono text-xs text-parchment-dim">Nenhuma categoria cadastrada ainda.</p>
            )}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              placeholder="Nova categoria"
              className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-1.5 font-body text-sm text-parchment outline-none focus:border-brass"
            />
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={novoLimite}
              onChange={(e) => setNovoLimite(e.target.value)}
              placeholder="limite R$"
              className="w-24 rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
            />
            <button
              type="button"
              onClick={handleAddCategoria}
              disabled={configSaving || !novaCategoria.trim()}
              className="rounded-md bg-brass px-3 py-1.5 font-body text-sm font-medium text-ink disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </PillarPageShell>
  )
}
