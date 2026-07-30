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
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Configurar hábitos</h1>

      {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

      <ul className="space-y-2">
        {definicoes.map((habito) => (
          <li
            key={habito.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            <label className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={habito.ativo}
                onChange={(e) => handleToggleAtivo(habito.id, e.target.checked)}
                disabled={saving}
                className="h-5 w-5"
              />
              {habito.nome}
            </label>
            <button
              type="button"
              onClick={() => handleRemove(habito.id)}
              disabled={saving}
              className="text-sm text-red-600 disabled:opacity-50 dark:text-red-400"
            >
              Remover
            </button>
          </li>
        ))}
        {definicoes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum hábito configurado ainda.</p>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Novo hábito"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={saving || !novoNome.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-base font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          Adicionar
        </button>
      </form>
    </div>
  )
}
