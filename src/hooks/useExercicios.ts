import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Exercicio = {
  id: string
  nome: string
  grupo_muscular: string | null
}

export function useExercicios() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    const { data, error } = await supabase.from('exercicio').select('id, nome, grupo_muscular').order('nome')
    if (!error) setExercicios(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { exercicios, loading, reload }
}
