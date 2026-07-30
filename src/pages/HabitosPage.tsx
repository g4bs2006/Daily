import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { useHabitoDefinicoes } from '../hooks/useHabitoDefinicoes'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { IconCheck } from '../components/ui/icons'

export function HabitosPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const { definicoes, loading: definicoesLoading, reload } = useHabitoDefinicoes()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [configSaving, setConfigSaving] = useState(false)

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
    setState('saved')
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

  const ativos = definicoes.filter((d) => d.ativo)

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
          {habito.nome}
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
              <li key={habito.id} className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-body text-sm text-parchment">
                  <input
                    type="checkbox"
                    checked={habito.ativo}
                    onChange={(e) => handleToggleAtivo(habito.id, e.target.checked)}
                    disabled={configSaving}
                    className="h-4 w-4 accent-brass"
                  />
                  {habito.nome}
                </label>
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
