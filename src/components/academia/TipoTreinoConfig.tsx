import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DIA_LABELS, type PlanoDia } from '../../hooks/usePlanoSemana'
import { type TipoTreino } from '../../hooks/useTiposTreino'
import { type Exercicio } from '../../hooks/useExercicios'

type Props = {
  tipos: TipoTreino[]
  exercicios: Exercicio[]
  planoPorDia: Record<number, PlanoDia | null>
  onReloadTipos: () => void
  onReloadExercicios: () => void
  onReloadPlano: () => void
}

export function TipoTreinoConfig({
  tipos,
  exercicios,
  planoPorDia,
  onReloadTipos,
  onReloadExercicios,
  onReloadPlano,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [novoTipoNome, setNovoTipoNome] = useState('')
  const [selectExercicio, setSelectExercicio] = useState<Record<string, string>>({})
  const [novoExNome, setNovoExNome] = useState<Record<string, string>>({})
  const [novoExGrupo, setNovoExGrupo] = useState<Record<string, string>>({})

  async function handleAddTipo() {
    const nome = novoTipoNome.trim()
    if (!nome) return
    setSaving(true)
    const ordem = tipos.length > 0 ? Math.max(...tipos.map((t) => t.ordem)) + 1 : 0
    await supabase.from('tipo_treino').insert({ nome, ordem })
    setNovoTipoNome('')
    setSaving(false)
    onReloadTipos()
  }

  async function handleRemoveTipo(id: string) {
    setSaving(true)
    await supabase.from('tipo_treino').delete().eq('id', id)
    setSaving(false)
    onReloadTipos()
    onReloadPlano()
  }

  async function handleRenameTipo(id: string, nome: string) {
    if (!nome.trim()) return
    setSaving(true)
    await supabase.from('tipo_treino').update({ nome: nome.trim() }).eq('id', id)
    setSaving(false)
    onReloadTipos()
  }

  async function handleAddExistente(tipoId: string) {
    const exercicioId = selectExercicio[tipoId]
    if (!exercicioId) return
    setSaving(true)
    const tipo = tipos.find((t) => t.id === tipoId)
    const ordem = (tipo?.itens.length ?? 0) + 1
    await supabase.from('tipo_treino_exercicio').insert({ tipo_treino_id: tipoId, exercicio_id: exercicioId, ordem })
    setSelectExercicio({ ...selectExercicio, [tipoId]: '' })
    setSaving(false)
    onReloadTipos()
  }

  async function handleCreateAndAdd(tipoId: string) {
    const nome = (novoExNome[tipoId] ?? '').trim()
    if (!nome) return
    setSaving(true)
    const { data: novoExercicio, error } = await supabase
      .from('exercicio')
      .insert({ nome, grupo_muscular: novoExGrupo[tipoId] || null })
      .select('id')
      .single()
    if (!error && novoExercicio) {
      const tipo = tipos.find((t) => t.id === tipoId)
      const ordem = (tipo?.itens.length ?? 0) + 1
      await supabase
        .from('tipo_treino_exercicio')
        .insert({ tipo_treino_id: tipoId, exercicio_id: novoExercicio.id, ordem })
    }
    setNovoExNome({ ...novoExNome, [tipoId]: '' })
    setNovoExGrupo({ ...novoExGrupo, [tipoId]: '' })
    setSaving(false)
    onReloadExercicios()
    onReloadTipos()
  }

  async function handleRemoveItem(itemId: string) {
    setSaving(true)
    await supabase.from('tipo_treino_exercicio').delete().eq('id', itemId)
    setSaving(false)
    onReloadTipos()
  }

  async function handleSetSugestao(diaSemana: number, tipoTreinoId: string) {
    setSaving(true)
    const existing = planoPorDia[diaSemana]
    if (existing) {
      await supabase.from('plano_dia').update({ tipo_treino_id: tipoTreinoId || null }).eq('id', existing.id)
    } else {
      await supabase.from('plano_dia').insert({ dia_semana: diaSemana, tipo_treino_id: tipoTreinoId || null })
    }
    setSaving(false)
    onReloadPlano()
  }

  return (
    <div className="space-y-5 rounded-lg border border-white/10 bg-ink p-3">
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-wide text-brass">TIPOS DE TREINO</p>
        {tipos.map((tipo) => (
          <div key={tipo.id} className="space-y-2 border-b border-white/10 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={tipo.nome}
                onBlur={(e) => handleRenameTipo(tipo.id, e.target.value)}
                disabled={saving}
                className="flex-1 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-body text-sm text-parchment outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => handleRemoveTipo(tipo.id)}
                disabled={saving}
                className="font-mono text-xs text-rust disabled:opacity-50"
              >
                remover tipo
              </button>
            </div>

            {tipo.itens.length > 0 && (
              <ul className="space-y-1">
                {tipo.itens.map((item) => (
                  <li key={item.id} className="flex items-center justify-between font-body text-sm text-parchment">
                    <span>{item.exercicio?.nome}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={saving}
                      className="font-mono text-xs text-rust disabled:opacity-50"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2">
              <select
                value={selectExercicio[tipo.id] ?? ''}
                onChange={(e) => setSelectExercicio({ ...selectExercicio, [tipo.id]: e.target.value })}
                className="rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
              >
                <option value="">+ exercício existente</option>
                {exercicios.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAddExistente(tipo.id)}
                disabled={saving || !selectExercicio[tipo.id]}
                className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs text-parchment disabled:opacity-50"
              >
                adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={novoExNome[tipo.id] ?? ''}
                onChange={(e) => setNovoExNome({ ...novoExNome, [tipo.id]: e.target.value })}
                placeholder="novo exercício"
                className="rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
              />
              <input
                type="text"
                value={novoExGrupo[tipo.id] ?? ''}
                onChange={(e) => setNovoExGrupo({ ...novoExGrupo, [tipo.id]: e.target.value })}
                placeholder="grupo muscular"
                className="w-28 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => handleCreateAndAdd(tipo.id)}
                disabled={saving || !(novoExNome[tipo.id] ?? '').trim()}
                className="rounded-md bg-brass px-2 py-1 font-mono text-xs font-medium text-ink disabled:opacity-50"
              >
                criar e adicionar
              </button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="text"
            value={novoTipoNome}
            onChange={(e) => setNovoTipoNome(e.target.value)}
            placeholder="Novo tipo de treino (ex: Peito/Tríceps)"
            className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-1.5 font-body text-sm text-parchment outline-none focus:border-brass"
          />
          <button
            type="button"
            onClick={handleAddTipo}
            disabled={saving || !novoTipoNome.trim()}
            className="rounded-md bg-brass px-3 py-1.5 font-body text-sm font-medium text-ink disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <p className="font-mono text-xs tracking-wide text-brass">SUGESTÃO POR DIA DA SEMANA (OPCIONAL)</p>
        {DIA_LABELS.map((label, diaSemana) => (
          <div key={diaSemana} className="flex items-center gap-2">
            <span className="w-20 shrink-0 font-mono text-xs text-parchment-dim">{label.slice(0, 3).toUpperCase()}</span>
            <select
              defaultValue={planoPorDia[diaSemana]?.tipo_treino_id ?? ''}
              onChange={(e) => handleSetSugestao(diaSemana, e.target.value)}
              disabled={saving}
              className="flex-1 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
            >
              <option value="">Sem sugestão</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
