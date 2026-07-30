import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type PlanoDia = {
  id: string
  dia_semana: number
  tipo_treino_id: string | null
}

const DIA_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function usePlanoSemana() {
  const [planoPorDia, setPlanoPorDia] = useState<Record<number, PlanoDia | null>>({})
  const [loading, setLoading] = useState(true)

  async function reload() {
    const { data, error } = await supabase.from('plano_dia').select('id, dia_semana, tipo_treino_id').order('dia_semana')
    if (error) {
      setLoading(false)
      return
    }
    const byDia: Record<number, PlanoDia | null> = {}
    for (const row of data ?? []) {
      byDia[row.dia_semana] = row
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
