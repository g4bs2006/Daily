import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type MedidaDefinicao = {
  id: string
  nome: string
  unidade: string
  ordem: number
}

export function useMedidaDefinicoes() {
  const [definicoes, setDefinicoes] = useState<MedidaDefinicao[]>([])
  const [loading, setLoading] = useState(true)

  async function reload() {
    const { data, error } = await supabase
      .from('medida_definicao')
      .select('id, nome, unidade, ordem')
      .order('ordem')
    if (!error) setDefinicoes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { definicoes, loading, reload }
}
