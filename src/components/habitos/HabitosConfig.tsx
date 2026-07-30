import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useHabitoDefinicoes } from '../../hooks/useHabitoDefinicoes'

export function HabitosConfig() {
  const { definicoes, loading, errorMessage, reload } = useHabitoDefinicoes()
  const [novoNome, setNovoNome] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return
    setSaving(true)
    const ordem = definicoes.length > 0 ? Math.max(...definicoes.map((d) => d.ordem)) + 1 : 0
    await supabase.from('habito_definicao').insert({ nome, ordem })
    setNovoNome('')
    setSaving(false)
    reload()
  }

  async function handleRemove(id: string) {
    setSaving(true)
    await supabase.from('habito_definicao').delete().eq('id', id)
    setSaving(false)
    reload()
  }

  async function handleToggleAtivo(id: string, ativo: boolean) {
    setSaving(true)
    await supabase.from('habito_definicao').update({ ativo }).eq('id', id)
    setSaving(false)
    reload()
  }

  if (loading) return null

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-8">
      <div>
        <p className="font-mono text-xs tracking-wide text-brass">CHECKLIST CONFIGURÁVEL</p>
        <h1 className="font-display text-2xl text-parchment">Hábitos</h1>
      </div>

      {errorMessage && <p className="font-mono text-xs text-rust">{errorMessage}</p>}

      <ul className="space-y-2">
        {definicoes.map((habito) => (
          <li
            key={habito.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-2 p-3"
          >
            <label className="flex items-center gap-2 font-body text-base text-parchment">
              <input
                type="checkbox"
                checked={habito.ativo}
                onChange={(e) => handleToggleAtivo(habito.id, e.target.checked)}
                disabled={saving}
                className="h-5 w-5 accent-brass"
              />
              {habito.nome}
            </label>
            <button
              type="button"
              onClick={() => handleRemove(habito.id)}
              disabled={saving}
              className="font-mono text-xs text-rust disabled:opacity-50"
            >
              remover
            </button>
          </li>
        ))}
        {definicoes.length === 0 && (
          <p className="font-mono text-xs text-parchment-dim">Nenhum hábito configurado ainda.</p>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Novo hábito"
          className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-2 font-body text-base text-parchment outline-none focus:border-brass"
        />
        <button
          type="submit"
          disabled={saving || !novoNome.trim()}
          className="rounded-md bg-brass px-4 py-2 font-body text-base font-medium text-ink disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
    </div>
  )
}
