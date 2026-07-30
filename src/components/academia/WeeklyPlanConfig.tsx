import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DIA_LABELS, type PlanoDia } from '../../hooks/usePlanoSemana'
import { type Exercicio } from '../../hooks/useExercicios'

type Props = {
  planoPorDia: Record<number, PlanoDia | null>
  exercicios: Exercicio[]
  onReloadPlano: () => void
  onReloadExercicios: () => void
}

export function WeeklyPlanConfig({ planoPorDia, exercicios, onReloadPlano, onReloadExercicios }: Props) {
  const [saving, setSaving] = useState(false)
  const [selectExercicio, setSelectExercicio] = useState<Record<number, string>>({})
  const [novoNome, setNovoNome] = useState<Record<number, string>>({})
  const [novoGrupo, setNovoGrupo] = useState<Record<number, string>>({})

  async function ensurePlanoDiaId(diaSemana: number) {
    const existing = planoPorDia[diaSemana]
    if (existing) return existing.id
    const { data, error } = await supabase
      .from('plano_dia')
      .insert({ dia_semana: diaSemana })
      .select('id')
      .single()
    if (error || !data) return null
    return data.id as string
  }

  async function handleNomeTreinoBlur(diaSemana: number, nome: string) {
    setSaving(true)
    const id = await ensurePlanoDiaId(diaSemana)
    if (id) await supabase.from('plano_dia').update({ nome_treino: nome || null }).eq('id', id)
    setSaving(false)
    onReloadPlano()
  }

  async function handleAddExistente(diaSemana: number) {
    const exercicioId = selectExercicio[diaSemana]
    if (!exercicioId) return
    setSaving(true)
    const id = await ensurePlanoDiaId(diaSemana)
    if (id) {
      const ordem = (planoPorDia[diaSemana]?.itens.length ?? 0) + 1
      await supabase.from('plano_dia_exercicio').insert({ plano_dia_id: id, exercicio_id: exercicioId, ordem })
    }
    setSelectExercicio({ ...selectExercicio, [diaSemana]: '' })
    setSaving(false)
    onReloadPlano()
  }

  async function handleCreateAndAdd(diaSemana: number) {
    const nome = (novoNome[diaSemana] ?? '').trim()
    if (!nome) return
    setSaving(true)
    const { data: novoExercicio, error } = await supabase
      .from('exercicio')
      .insert({ nome, grupo_muscular: novoGrupo[diaSemana] || null })
      .select('id')
      .single()
    if (!error && novoExercicio) {
      const id = await ensurePlanoDiaId(diaSemana)
      if (id) {
        const ordem = (planoPorDia[diaSemana]?.itens.length ?? 0) + 1
        await supabase
          .from('plano_dia_exercicio')
          .insert({ plano_dia_id: id, exercicio_id: novoExercicio.id, ordem })
      }
    }
    setNovoNome({ ...novoNome, [diaSemana]: '' })
    setNovoGrupo({ ...novoGrupo, [diaSemana]: '' })
    setSaving(false)
    onReloadExercicios()
    onReloadPlano()
  }

  async function handleRemoveExercicio(planoDiaExercicioId: string) {
    setSaving(true)
    await supabase.from('plano_dia_exercicio').delete().eq('id', planoDiaExercicioId)
    setSaving(false)
    onReloadPlano()
  }

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-ink p-3">
      {DIA_LABELS.map((label, diaSemana) => {
        const plano = planoPorDia[diaSemana]
        return (
          <div key={diaSemana} className="space-y-2 border-b border-white/10 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 font-mono text-xs text-parchment-dim">{label.slice(0, 3).toUpperCase()}</span>
              <input
                type="text"
                defaultValue={plano?.nome_treino ?? ''}
                onBlur={(e) => handleNomeTreinoBlur(diaSemana, e.target.value)}
                placeholder="Nome do treino (ex: Peito/Tríceps)"
                disabled={saving}
                className="flex-1 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-body text-sm text-parchment outline-none focus:border-brass"
              />
            </div>

            {plano && plano.itens.length > 0 && (
              <ul className="ml-20 space-y-1">
                {plano.itens.map((item) => (
                  <li key={item.id} className="flex items-center justify-between font-body text-sm text-parchment">
                    <span>{item.exercicio?.nome}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercicio(item.id)}
                      disabled={saving}
                      className="font-mono text-xs text-rust disabled:opacity-50"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="ml-20 flex flex-wrap gap-2">
              <select
                value={selectExercicio[diaSemana] ?? ''}
                onChange={(e) => setSelectExercicio({ ...selectExercicio, [diaSemana]: e.target.value })}
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
                onClick={() => handleAddExistente(diaSemana)}
                disabled={saving || !selectExercicio[diaSemana]}
                className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs text-parchment disabled:opacity-50"
              >
                adicionar
              </button>
            </div>

            <div className="ml-20 flex flex-wrap gap-2">
              <input
                type="text"
                value={novoNome[diaSemana] ?? ''}
                onChange={(e) => setNovoNome({ ...novoNome, [diaSemana]: e.target.value })}
                placeholder="novo exercício"
                className="rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
              />
              <input
                type="text"
                value={novoGrupo[diaSemana] ?? ''}
                onChange={(e) => setNovoGrupo({ ...novoGrupo, [diaSemana]: e.target.value })}
                placeholder="grupo muscular"
                className="w-28 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => handleCreateAndAdd(diaSemana)}
                disabled={saving || !(novoNome[diaSemana] ?? '').trim()}
                className="rounded-md bg-brass px-2 py-1 font-mono text-xs font-medium text-ink disabled:opacity-50"
              >
                criar e adicionar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
