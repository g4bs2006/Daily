import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type TipoTreinoExercicio = {
  id: string
  exercicio_id: string
  ordem: number
  series_alvo: number | null
  reps_alvo: number | null
  exercicio: { nome: string; grupo_muscular: string | null } | null
}

export type TipoTreino = {
  id: string
  nome: string
  ordem: number
  itens: TipoTreinoExercicio[]
}

export function useTiposTreino() {
  const [tipos, setTipos] = useState<TipoTreino[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    const { data, error } = await supabase
      .from('tipo_treino')
      .select(
        'id, nome, ordem, tipo_treino_exercicio(id, exercicio_id, ordem, series_alvo, reps_alvo, exercicio(nome, grupo_muscular))',
      )
      .order('ordem')
    if (error) {
      setLoading(false)
      return
    }
    setTipos(
      (data ?? []).map((row) => ({
        id: row.id,
        nome: row.nome,
        ordem: row.ordem,
        itens: ((row as unknown as { tipo_treino_exercicio: TipoTreinoExercicio[] }).tipo_treino_exercicio ?? [])
          .slice()
          .sort((a, b) => a.ordem - b.ordem),
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { tipos, loading, reload }
}
