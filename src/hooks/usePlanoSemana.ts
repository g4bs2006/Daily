import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type PlanoDiaExercicio = {
  id: string
  exercicio_id: string
  ordem: number
  series_alvo: number | null
  reps_alvo: number | null
  exercicio: { nome: string; grupo_muscular: string | null } | null
}

export type PlanoDia = {
  id: string
  dia_semana: number
  nome_treino: string | null
  ativo: boolean
  itens: PlanoDiaExercicio[]
}

const DIA_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function usePlanoSemana() {
  const [planoPorDia, setPlanoPorDia] = useState<Record<number, PlanoDia | null>>({})
  const [loading, setLoading] = useState(true)

  async function reload() {
    const { data, error } = await supabase
      .from('plano_dia')
      .select(
        'id, dia_semana, nome_treino, ativo, plano_dia_exercicio(id, exercicio_id, ordem, series_alvo, reps_alvo, exercicio(nome, grupo_muscular))',
      )
      .order('dia_semana')
    if (error) {
      setLoading(false)
      return
    }
    const byDia: Record<number, PlanoDia | null> = {}
    for (const row of data ?? []) {
      const itens = ((row as unknown as { plano_dia_exercicio: PlanoDiaExercicio[] }).plano_dia_exercicio ?? [])
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
      byDia[row.dia_semana] = { id: row.id, dia_semana: row.dia_semana, nome_treino: row.nome_treino, ativo: row.ativo, itens }
    }
    setPlanoPorDia(byDia)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { planoPorDia, loading, reload }
}

export { DIA_LABELS }
