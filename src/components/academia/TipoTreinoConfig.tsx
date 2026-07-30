import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DIA_LABELS, type PlanoDia } from '../../hooks/usePlanoSemana'
import { type TipoTreino } from '../../hooks/useTiposTreino'
import { type Exercicio } from '../../hooks/useExercicios'
import { IconChevron } from '../ui/icons'

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
  const [expandedTipoId, setExpandedTipoId] = useState<string | null>(null)
  const [addPanelFor, setAddPanelFor] = useState<string | null>(null)
  const [creatingNewFor, setCreatingNewFor] = useState(false)
  const [selectExercicio, setSelectExercicio] = useState('')
  const [novoExNome, setNovoExNome] = useState('')
  const [novoExGrupo, setNovoExGrupo] = useState('')
  const [novoSeries, setNovoSeries] = useState('')
  const [novoReps, setNovoReps] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editSeries, setEditSeries] = useState('')
  const [editReps, setEditReps] = useState('')

  function closeAddPanel() {
    setAddPanelFor(null)
    setCreatingNewFor(false)
    setSelectExercicio('')
    setNovoExNome('')
    setNovoExGrupo('')
    setNovoSeries('')
    setNovoReps('')
  }

  async function handleAddTipo() {
    const nome = novoTipoNome.trim()
    if (!nome) return
    setSaving(true)
    const ordem = tipos.length > 0 ? Math.max(...tipos.map((t) => t.ordem)) + 1 : 0
    const { data } = await supabase.from('tipo_treino').insert({ nome, ordem }).select('id').single()
    setNovoTipoNome('')
    setSaving(false)
    onReloadTipos()
    if (data) setExpandedTipoId(data.id)
  }

  async function handleRemoveTipo(id: string) {
    setSaving(true)
    await supabase.from('tipo_treino').delete().eq('id', id)
    setSaving(false)
    if (expandedTipoId === id) setExpandedTipoId(null)
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
    if (!selectExercicio) return
    setSaving(true)
    const tipo = tipos.find((t) => t.id === tipoId)
    const ordem = (tipo?.itens.length ?? 0) + 1
    await supabase.from('tipo_treino_exercicio').insert({
      tipo_treino_id: tipoId,
      exercicio_id: selectExercicio,
      ordem,
      series_alvo: novoSeries ? Number(novoSeries) : null,
      reps_alvo: novoReps ? Number(novoReps) : null,
    })
    setSaving(false)
    closeAddPanel()
    onReloadTipos()
  }

  async function handleCreateAndAdd(tipoId: string) {
    const nome = novoExNome.trim()
    if (!nome) return
    setSaving(true)
    const { data: novoExercicio, error } = await supabase
      .from('exercicio')
      .insert({ nome, grupo_muscular: novoExGrupo || null })
      .select('id')
      .single()
    if (!error && novoExercicio) {
      const tipo = tipos.find((t) => t.id === tipoId)
      const ordem = (tipo?.itens.length ?? 0) + 1
      await supabase.from('tipo_treino_exercicio').insert({
        tipo_treino_id: tipoId,
        exercicio_id: novoExercicio.id,
        ordem,
        series_alvo: novoSeries ? Number(novoSeries) : null,
        reps_alvo: novoReps ? Number(novoReps) : null,
      })
    }
    setSaving(false)
    closeAddPanel()
    onReloadExercicios()
    onReloadTipos()
  }

  async function handleRemoveItem(itemId: string) {
    setSaving(true)
    await supabase.from('tipo_treino_exercicio').delete().eq('id', itemId)
    setSaving(false)
    onReloadTipos()
  }

  function startEditItem(itemId: string, series: number | null, reps: number | null) {
    setEditingItemId(itemId)
    setEditSeries(series?.toString() ?? '')
    setEditReps(reps?.toString() ?? '')
  }

  async function handleSaveEditItem(itemId: string) {
    setSaving(true)
    await supabase
      .from('tipo_treino_exercicio')
      .update({
        series_alvo: editSeries ? Number(editSeries) : null,
        reps_alvo: editReps ? Number(editReps) : null,
      })
      .eq('id', itemId)
    setSaving(false)
    setEditingItemId(null)
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
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={novoTipoNome}
          onChange={(e) => setNovoTipoNome(e.target.value)}
          placeholder="Novo tipo de treino (ex: Peito/Tríceps)"
          className="flex-1 rounded-md border border-white/15 bg-ink-2 px-3 py-2 font-body text-sm text-parchment outline-none focus:border-brass"
        />
        <button
          type="button"
          onClick={handleAddTipo}
          disabled={saving || !novoTipoNome.trim()}
          className="rounded-md bg-brass px-4 py-2 font-body text-sm font-semibold text-ink disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs tracking-wide text-brass">SEUS TIPOS</p>
        {tipos.length === 0 ? (
          <p className="font-mono text-xs text-parchment-dim">Nenhum tipo cadastrado ainda.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tipos.map((tipo) => {
              const expanded = expandedTipoId === tipo.id
              const panelOpen = addPanelFor === tipo.id
              const availableExercicios = exercicios.filter(
                (ex) => !tipo.itens.some((i) => i.exercicio_id === ex.id),
              )
              return (
                <div key={tipo.id} className="overflow-hidden rounded-lg border border-white/10 bg-ink-2">
                  <button
                    type="button"
                    onClick={() => setExpandedTipoId(expanded ? null : tipo.id)}
                    className="flex w-full items-center justify-between px-3.5 py-3 text-left"
                  >
                    <div>
                      <p className="font-body text-[15px] font-semibold text-parchment">{tipo.nome}</p>
                      <p className="font-mono text-xs text-parchment-dim">
                        {tipo.itens.length} exercício{tipo.itens.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <IconChevron
                      direction="right"
                      size={12}
                      className={`text-parchment-dim transition-transform ${expanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {expanded && (
                    <div className="border-t border-dashed border-white/10 p-3.5 pt-3">
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {tipo.itens.map((item) => (
                          <span
                            key={item.id}
                            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink py-1 pl-3 pr-1.5 font-body text-sm text-parchment"
                          >
                            <button
                              type="button"
                              onClick={() => startEditItem(item.id, item.series_alvo, item.reps_alvo)}
                              className="hover:text-brass"
                            >
                              {item.exercicio?.nome}
                              {(item.series_alvo || item.reps_alvo) && (
                                <span className="ml-1 font-mono text-xs text-parchment-dim">
                                  · {item.series_alvo ?? '?'}×{item.reps_alvo ?? '?'}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex h-4 w-4 items-center justify-center rounded-full text-parchment-dim hover:bg-rust/20 hover:text-rust"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            if (panelOpen) {
                              closeAddPanel()
                            } else {
                              setAddPanelFor(tipo.id)
                              setCreatingNewFor(false)
                            }
                          }}
                          className={`rounded-full border border-dashed px-3 py-1 font-mono text-xs ${
                            panelOpen ? 'border-brass text-brass' : 'border-white/20 text-parchment-dim hover:border-brass hover:text-brass'
                          }`}
                        >
                          + exercício
                        </button>
                      </div>

                      {tipo.itens.map(
                        (item) =>
                          editingItemId === item.id && (
                            <div key={item.id} className="mb-3 space-y-1.5 rounded-md bg-ink p-2.5">
                              <p className="font-mono text-xs text-parchment-dim">
                                Alvo para <span className="text-parchment">{item.exercicio?.nome}</span>
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={editSeries}
                                  onChange={(e) => setEditSeries(e.target.value)}
                                  placeholder="séries"
                                  className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={editReps}
                                  onChange={(e) => setEditReps(e.target.value)}
                                  placeholder="reps"
                                  className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditItem(item.id)}
                                  disabled={saving}
                                  className="flex-1 rounded-md bg-brass py-1.5 font-mono text-xs font-semibold text-ink disabled:opacity-50"
                                >
                                  salvar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="flex-1 rounded-md bg-white/10 py-1.5 font-mono text-xs text-parchment"
                                >
                                  cancelar
                                </button>
                              </div>
                            </div>
                          ),
                      )}

                      {panelOpen && (
                        <div className="mb-3 space-y-1.5 rounded-md bg-ink p-2.5">
                          {!creatingNewFor ? (
                            <>
                              <select
                                value={selectExercicio}
                                onChange={(e) => setSelectExercicio(e.target.value)}
                                className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                              >
                                <option value="">Escolher exercício existente...</option>
                                {availableExercicios.map((ex) => (
                                  <option key={ex.id} value={ex.id}>
                                    {ex.nome}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={novoSeries}
                                  onChange={(e) => setNovoSeries(e.target.value)}
                                  placeholder="séries alvo"
                                  className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={novoReps}
                                  onChange={(e) => setNovoReps(e.target.value)}
                                  placeholder="reps alvo"
                                  className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddExistente(tipo.id)}
                                disabled={saving || !selectExercicio}
                                className="w-full rounded-md bg-brass py-1.5 font-mono text-xs font-semibold text-ink disabled:opacity-50"
                              >
                                adicionar
                              </button>
                              {availableExercicios.length === 0 && (
                                <p className="font-mono text-xs text-parchment-dim">
                                  Todos os exercícios da biblioteca já estão nesse tipo.
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setCreatingNewFor(true)}
                                className="block font-mono text-xs text-parchment-dim underline hover:text-parchment"
                              >
                                ou criar um exercício novo
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={novoExNome}
                                onChange={(e) => setNovoExNome(e.target.value)}
                                placeholder="nome do exercício"
                                className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                              />
                              <input
                                type="text"
                                value={novoExGrupo}
                                onChange={(e) => setNovoExGrupo(e.target.value)}
                                placeholder="grupo muscular (opcional)"
                                className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={novoSeries}
                                  onChange={(e) => setNovoSeries(e.target.value)}
                                  placeholder="séries alvo"
                                  className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={novoReps}
                                  onChange={(e) => setNovoReps(e.target.value)}
                                  placeholder="reps alvo"
                                  className="w-full rounded-md border border-white/15 bg-ink-2 px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCreateAndAdd(tipo.id)}
                                disabled={saving || !novoExNome.trim()}
                                className="w-full rounded-md bg-brass py-1.5 font-mono text-xs font-semibold text-ink disabled:opacity-50"
                              >
                                criar e adicionar
                              </button>
                              <button
                                type="button"
                                onClick={() => setCreatingNewFor(false)}
                                className="block font-mono text-xs text-parchment-dim underline hover:text-parchment"
                              >
                                ou escolher um já existente
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <input
                          type="text"
                          defaultValue={tipo.nome}
                          onBlur={(e) => handleRenameTipo(tipo.id, e.target.value)}
                          className="border-b border-dashed border-white/20 bg-transparent font-body text-sm text-parchment outline-none focus:border-brass"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTipo(tipo.id)}
                          className="whitespace-nowrap font-mono text-xs text-rust"
                        >
                          excluir tipo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 font-mono text-xs tracking-wide text-brass">
          SUGESTÃO POR DIA DA SEMANA <span className="font-body font-normal text-parchment-dim">(opcional)</span>
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DIA_LABELS.map((label, diaSemana) => (
            <div key={diaSemana} className="min-w-[92px] shrink-0 rounded-lg border border-white/10 bg-ink-2 p-2 text-center">
              <p className="font-mono text-[10px] tracking-wide text-parchment-dim">{label.slice(0, 3).toUpperCase()}</p>
              <select
                defaultValue={planoPorDia[diaSemana]?.tipo_treino_id ?? ''}
                onChange={(e) => handleSetSugestao(diaSemana, e.target.value)}
                disabled={saving}
                className="mt-1 w-full bg-transparent text-center font-body text-xs text-brass outline-none"
              >
                <option value="" className="bg-ink-2 text-parchment-dim">
                  —
                </option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id} className="bg-ink-2 text-parchment">
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
