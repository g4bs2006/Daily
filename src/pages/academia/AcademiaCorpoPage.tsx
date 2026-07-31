import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { ensureDailyLog } from '../../lib/ensureDailyLog'
import { useLogDate } from '../../hooks/useLogDate'
import { usePillarTrend } from '../../hooks/usePillarTrend'
import { useMedidaDefinicoes } from '../../hooks/useMedidaDefinicoes'
import { PillarPageShell, type SaveState } from '../../components/ui/PillarPageShell'
import { PillarTrendSection } from '../../components/ui/PillarTrendSection'
import { TrendBarChart } from '../../components/ui/TrendBarChart'
import { fieldInputClass, fieldLabelClass } from '../../components/ui/InstrumentCard'
import { IconScale } from '../../components/ui/icons'

const TREND_DAYS = 30

type CorpoRow = { log_date: string; peso_kg: number | null }
type MedidaItem = { id: string; nome: string; valor: number }

export function AcademiaCorpoPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const trend = usePillarTrend<CorpoRow>('corpo_registro', 'peso_kg', TREND_DAYS, (row) => row.peso_kg)
  const { definicoes, loading: definicoesLoading, reload } = useMedidaDefinicoes()

  const [pesoKg, setPesoKg] = useState('')
  const [medidasValores, setMedidasValores] = useState<Record<string, string>>({})
  const [observacao, setObservacao] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [recordExists, setRecordExists] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaUnidade, setNovaUnidade] = useState('cm')
  const [configSaving, setConfigSaving] = useState(false)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('corpo_registro')
      .select('peso_kg, medidas, observacao')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setPesoKg(data?.peso_kg?.toString() ?? '')
        const itens = (data?.medidas ?? []) as MedidaItem[]
        setMedidasValores(Object.fromEntries(itens.map((item) => [item.id, item.valor.toString()])))
        setObservacao(data?.observacao ?? '')
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

    const medidas: MedidaItem[] = definicoes
      .filter((d) => medidasValores[d.id])
      .map((d) => ({ id: d.id, nome: d.nome, valor: Number(medidasValores[d.id]) }))

    const { error } = await supabase.from('corpo_registro').upsert(
      {
        log_date: logDate,
        peso_kg: pesoKg ? Number(pesoKg) : null,
        medidas,
        observacao: observacao || null,
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
    await supabase.from('corpo_registro').delete().eq('log_date', logDate)
    setPesoKg('')
    setMedidasValores({})
    setObservacao('')
    setRecordExists(false)
    setState('idle')
  }

  async function handleAddMedida() {
    const nome = novoNome.trim()
    if (!nome) return
    setConfigSaving(true)
    const ordem = definicoes.length > 0 ? Math.max(...definicoes.map((d) => d.ordem)) + 1 : 0
    await supabase.from('medida_definicao').insert({ nome, unidade: novaUnidade || 'cm', ordem })
    setNovoNome('')
    setConfigSaving(false)
    reload()
  }

  async function handleRenameMedida(id: string, nome: string) {
    if (!nome.trim()) return
    setConfigSaving(true)
    await supabase.from('medida_definicao').update({ nome: nome.trim() }).eq('id', id)
    setConfigSaving(false)
    reload()
  }

  async function handleRemoveMedida(id: string) {
    setConfigSaving(true)
    await supabase.from('medida_definicao').delete().eq('id', id)
    setConfigSaving(false)
    reload()
  }

  const pesosOrdenados = trend.points.filter((p) => p.value !== null)
  const pesoAtual = pesosOrdenados.length > 0 ? pesosOrdenados[pesosOrdenados.length - 1].value : null
  const pesoInicial = pesosOrdenados.length > 0 ? pesosOrdenados[0].value : null
  const variacao = pesoAtual !== null && pesoInicial !== null ? pesoAtual - pesoInicial : null

  return (
    <PillarPageShell
      icon={IconScale}
      title="Peso & Medidas"
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
            { label: 'Peso atual', value: pesoAtual !== null ? `${pesoAtual} kg` : '—' },
            {
              label: 'Variação',
              value: variacao !== null ? `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)} kg` : '—',
              caption: `em ${TREND_DAYS} dias`,
            },
          ]}
        >
          <TrendBarChart points={trend.points} title={`Peso — últimos ${TREND_DAYS} dias`} formatValue={(v) => `${v} kg`} />
        </PillarTrendSection>
      }
    >
      <div className="space-y-1">
        <label className={fieldLabelClass}>PESO (KG)</label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          value={pesoKg}
          onChange={(e) => setPesoKg(e.target.value)}
          className={fieldInputClass}
        />
      </div>

      {!definicoesLoading && definicoes.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {definicoes.map((medida) => (
            <div key={medida.id} className="space-y-1">
              <label className={fieldLabelClass}>
                {medida.nome.toUpperCase()} ({medida.unidade})
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={medidasValores[medida.id] ?? ''}
                onChange={(e) => setMedidasValores({ ...medidasValores, [medida.id]: e.target.value })}
                className={fieldInputClass}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <label className={fieldLabelClass}>OBSERVAÇÃO (OPCIONAL)</label>
        <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} className={fieldInputClass} />
      </div>

      <button
        type="button"
        onClick={() => setShowConfig((v) => !v)}
        className="font-mono text-xs text-parchment-dim hover:text-parchment"
      >
        {showConfig ? '– ocultar medidas' : '+ gerenciar medidas'}
      </button>

      {showConfig && !definicoesLoading && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-ink p-3">
          <ul className="space-y-2">
            {definicoes.map((medida) => (
              <li key={medida.id} className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={medida.nome}
                  onBlur={(e) => handleRenameMedida(medida.id, e.target.value)}
                  disabled={configSaving}
                  className="flex-1 rounded-md border border-white/10 bg-ink-2 px-2 py-1 font-body text-sm text-parchment outline-none focus:border-brass"
                />
                <span className="font-mono text-xs text-parchment-dim">{medida.unidade}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMedida(medida.id)}
                  disabled={configSaving}
                  className="font-mono text-xs text-rust disabled:opacity-50"
                >
                  remover
                </button>
              </li>
            ))}
            {definicoes.length === 0 && (
              <p className="font-mono text-xs text-parchment-dim">Nenhuma medida cadastrada ainda.</p>
            )}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Nova medida (ex: Cintura)"
              className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-1.5 font-body text-sm text-parchment outline-none focus:border-brass"
            />
            <input
              type="text"
              value={novaUnidade}
              onChange={(e) => setNovaUnidade(e.target.value)}
              placeholder="un."
              className="w-16 rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
            />
            <button
              type="button"
              onClick={handleAddMedida}
              disabled={configSaving || !novoNome.trim()}
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
