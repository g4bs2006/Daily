import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { type Exercicio } from '../../hooks/useExercicios'

type Props = {
  exercicios: Exercicio[]
  onReload: () => void
}

export function ExercicioLibrary({ exercicios, onReload }: Props) {
  const [saving, setSaving] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoGrupo, setNovoGrupo] = useState('')

  async function handleAdd() {
    const nome = novoNome.trim()
    if (!nome) return
    setSaving(true)
    await supabase.from('exercicio').insert({ nome, grupo_muscular: novoGrupo || null })
    setNovoNome('')
    setNovoGrupo('')
    setSaving(false)
    onReload()
  }

  async function handleRenomear(id: string, nome: string) {
    if (!nome.trim()) return
    setSaving(true)
    await supabase.from('exercicio').update({ nome: nome.trim() }).eq('id', id)
    setSaving(false)
    onReload()
  }

  async function handleGrupo(id: string, grupo: string) {
    setSaving(true)
    await supabase.from('exercicio').update({ grupo_muscular: grupo || null }).eq('id', id)
    setSaving(false)
    onReload()
  }

  async function handleRemove(id: string) {
    setSaving(true)
    await supabase.from('exercicio').delete().eq('id', id)
    setSaving(false)
    onReload()
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs tracking-wide text-brass">BIBLIOTECA DE EXERCÍCIOS</p>
      <p className="font-mono text-xs text-parchment-dim">
        Excluir um exercício aqui remove ele de todos os tipos de treino e do histórico de séries registradas.
      </p>

      {exercicios.length === 0 ? (
        <p className="font-mono text-xs text-parchment-dim">Nenhum exercício cadastrado ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {exercicios.map((ex) => (
            <li key={ex.id} className="flex items-center gap-2 rounded-md border border-white/10 bg-ink-2 p-2">
              <input
                type="text"
                defaultValue={ex.nome}
                onBlur={(e) => handleRenomear(ex.id, e.target.value)}
                disabled={saving}
                className="flex-1 rounded-md border border-white/10 bg-ink px-2 py-1 font-body text-sm text-parchment outline-none focus:border-brass"
              />
              <input
                type="text"
                defaultValue={ex.grupo_muscular ?? ''}
                onBlur={(e) => handleGrupo(ex.id, e.target.value)}
                placeholder="grupo muscular"
                disabled={saving}
                className="w-32 rounded-md border border-white/10 bg-ink px-2 py-1 font-mono text-xs text-parchment-dim outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => handleRemove(ex.id)}
                disabled={saving}
                className="font-mono text-xs text-rust disabled:opacity-50"
              >
                excluir
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="novo exercício"
          className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-1.5 font-body text-sm text-parchment outline-none focus:border-brass"
        />
        <input
          type="text"
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value)}
          placeholder="grupo muscular"
          className="w-32 rounded-md border border-white/15 bg-ink-2 px-3 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !novoNome.trim()}
          className="rounded-md bg-brass px-4 py-1.5 font-body text-sm font-semibold text-ink disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
