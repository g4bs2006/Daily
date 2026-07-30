import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type HabitoDefinicao = {
  id: string
  nome: string
  ordem: number
  ativo: boolean
}

export function useHabitoDefinicoes() {
  const [definicoes, setDefinicoes] = useState<HabitoDefinicao[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function reload() {
    const { data, error } = await supabase
      .from('habito_definicao')
      .select('id, nome, ordem, ativo')
      .order('ordem')
    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }
    setDefinicoes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { definicoes, loading, errorMessage, reload }
}
