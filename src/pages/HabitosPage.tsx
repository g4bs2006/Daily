import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { useHabitoDefinicoes } from '../hooks/useHabitoDefinicoes'
import { usePillarTrend } from '../hooks/usePillarTrend'
import { isoDateDaysAgo, todayIsoDate } from '../lib/date'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { PillarTrendSection } from '../components/ui/PillarTrendSection'
import { TrendBarChart } from '../components/ui/TrendBarChart'
import { IconCheck } from '../components/ui/icons'

const TREND_DAYS = 14
const STREAK_WINDOW_DAYS = 60

type HabitosRow = { log_date: string; total_marcados: number | null; total_possivel: number | null }
type HabitoItem = { id: string; nome: string; marcado: boolean }

function completionPercent(row: HabitosRow) {
  if (!row.total_possivel) return null
  return Math.round(((row.total_marcados ?? 0) / row.total_possivel) * 100)
}

export function HabitosPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const { definicoes, loading: definicoesLoading, reload } = useHabitoDefinicoes()
  const trend = usePillarTrend<HabitosRow>(
    'pillar_habitos',
    'total_marcados, total_possivel',
    TREND_DAYS,
    completionPercent,
  )
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [configSaving, setConfigSaving] = useState(false)
  const [habitoStreaks, setHabitoStreaks] = useState<Record<string, number>>({})
  const [recordExists, setRecordExists] = useState(false)

  useEffect(() => {
    let active = true
    const to = todayIsoDate()
    const from = isoDateDaysAgo(STREAK_WINDOW_DAYS - 1)

    Promise.all([
      supabase.from('daily_log').select('log_date').gte('log_date', from).lte('log_date', to),
      supabase.from('pillar_habitos').select('log_date, itens').gte('log_date', from).lte('log_date', to),
    ]).then(([logRes, habitosRes]) => {
      if (!active) return
      if (logRes.error || habitosRes.error) return

      const registeredDates = new Set((logRes.data ?? []).map((r) => r.log_date))
      const itensByDate = new Map(
        (habitosRes.data ?? []).map((r) => [r.log_date as string, (r.itens ?? []) as HabitoItem[]]),
      )
      const dateList = Array.from({ length: STREAK_WINDOW_DAYS }, (_, i) => isoDateDaysAgo(STREAK_WINDOW_DAYS - 1 - i))

      const streaks: Record<string, number> = {}
      for (const habito of definicoes) {
        let streak = 0
        for (let i = dateList.length - 1; i >= 0; i--) {
          const date = dateList[i]
          if (!registeredDates.has(date)) break
          const item = itensByDate.get(date)?.find((it) => it.id === habito.id)
          if (!item || !item.marcado) break
          streak++
        }
        streaks[habito.id] = streak
      }
      setHabitoStreaks(streaks)
    })

    return () => {
      active = false
    }
  }, [definicoes, logDate, state])

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_habitos')
      .select('itens')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        const itens = (data?.itens ?? []) as { id: string; marcado: boolean }[]
        setChecked(Object.fromEntries(itens.map((item) => [item.id, item.marcado])))
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

    const ativos = definicoes.filter((d) => d.ativo)
    const itens = ativos.map((habito) => ({
      id: habito.id,
      nome: habito.nome,
      marcado: checked[habito.id] ?? false,
    }))

    const { error } = await supabase.from('pillar_habitos').upsert(
      {
        log_date: logDate,
        itens,
        total_marcados: itens.filter((item) => item.marcado).length,
        total_possivel: itens.length,
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
    await supabase.from('pillar_habitos').delete().eq('log_date', logDate)
    setChecked({})
    setRecordExists(false)
    setState('idle')
  }

  async function handleAddHabito(e: FormEvent) {
    e.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return
    setConfigSaving(true)
    const ordem = definicoes.length > 0 ? Math.max(...definicoes.map((d) => d.ordem)) + 1 : 0
    await supabase.from('habito_definicao').insert({ nome, ordem })
    setNovoNome('')
    setConfigSaving(false)
    reload()
  }

  async function handleRemoveHabito(id: string) {
    setConfigSaving(true)
    await supabase.from('habito_definicao').delete().eq('id', id)
    setConfigSaving(false)
    reload()
  }

  async function handleToggleAtivo(id: string, ativo: boolean) {
    setConfigSaving(true)
    await supabase.from('habito_definicao').update({ ativo }).eq('id', id)
    setConfigSaving(false)
    reload()
  }

  async function handleRenameHabito(id: string, nome: string) {
    if (!nome.trim()) return
    setConfigSaving(true)
    await supabase.from('habito_definicao').update({ nome: nome.trim() }).eq('id', id)
    setConfigSaving(false)
    reload()
  }

  const ativos = definicoes.filter((d) => d.ativo)

  const completionRows = trend.rows.filter((r) => (r.total_possivel ?? 0) > 0)
  const mediaConclusao =
    completionRows.length > 0
      ? Math.round(
          completionRows.reduce((sum, r) => sum + (completionPercent(r) ?? 0), 0) / completionRows.length,
        )
      : 0
  let melhorSequencia = 0
  let atual = 0
  for (const row of trend.rows) {
    if (completionPercent(row) === 100) {
      atual++
      melhorSequencia = Math.max(melhorSequencia, atual)
    } else {
      atual = 0
    }
  }

  return (
    <PillarPageShell
      icon={IconCheck}
      title="Hábitos"
      logDate={logDate}
      isToday={isToday}
      onPrevDay={goPrevDay}
      onNextDay={goNextDay}
      onToday={goToday}
      saveState={definicoesLoading ? 'loading' : state}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      canDelete={recordExists}
      onDelete={handleDeleteRecord}
      footer={
        <PillarTrendSection
          loading={trend.loading}
          stats={[
            { label: 'Conclusão média', value: `${mediaConclusao}%`, caption: `em ${TREND_DAYS} dias` },
            { label: 'Melhor sequência', value: String(melhorSequencia), caption: '100% completo' },
          ]}
        >
          <TrendBarChart
            points={trend.points}
            title={`Conclusão do checklist — últimos ${TREND_DAYS} dias`}
            formatValue={(v) => `${v}%`}
          />
        </PillarTrendSection>
      }
    >
      {ativos.length === 0 && (
        <p className="font-mono text-xs text-parchment-dim">
          Nenhum hábito configurado ainda. Abra "gerenciar checklist" abaixo para adicionar.
        </p>
      )}
      {ativos.map((habito) => (
        <label key={habito.id} className="flex items-center gap-2 font-body text-base text-parchment">
          <input
            type="checkbox"
            checked={checked[habito.id] ?? false}
            onChange={(e) => setChecked({ ...checked, [habito.id]: e.target.checked })}
            className="h-5 w-5 accent-brass"
          />
          <span className="flex-1">{habito.nome}</span>
          {(habitoStreaks[habito.id] ?? 0) > 0 && (
            <span className="font-mono text-xs text-moss">{habitoStreaks[habito.id]}d</span>
          )}
        </label>
      ))}

      <button
        type="button"
        onClick={() => setShowConfig((v) => !v)}
        className="font-mono text-xs text-parchment-dim hover:text-parchment"
      >
        {showConfig ? '– ocultar checklist' : '+ gerenciar checklist'}
      </button>

      {showConfig && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-ink p-3">
          <ul className="space-y-2">
            {definicoes.map((habito) => (
              <li key={habito.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={habito.ativo}
                  onChange={(e) => handleToggleAtivo(habito.id, e.target.checked)}
                  disabled={configSaving}
                  className="h-4 w-4 accent-brass"
                />
                <input
                  type="text"
                  defaultValue={habito.nome}
                  onBlur={(e) => handleRenameHabito(habito.id, e.target.value)}
                  disabled={configSaving}
                  className="flex-1 rounded-md border border-white/10 bg-ink-2 px-2 py-1 font-body text-sm text-parchment outline-none focus:border-brass"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHabito(habito.id)}
                  disabled={configSaving}
                  className="font-mono text-xs text-rust disabled:opacity-50"
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Novo hábito"
              className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-1.5 font-body text-sm text-parchment outline-none focus:border-brass"
            />
            <button
              type="button"
              onClick={handleAddHabito}
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
