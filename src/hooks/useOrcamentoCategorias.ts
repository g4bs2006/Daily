import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type OrcamentoCategoria = {
  id: string
  categoria: string
  limite_mensal: number | null
  ordem: number
}

export function useOrcamentoCategorias() {
  const [categorias, setCategorias] = useState<OrcamentoCategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function reload() {
    const { data, error } = await supabase
      .from('orcamento_categoria')
      .select('id, categoria, limite_mensal, ordem')
      .order('ordem')
    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }
    setCategorias(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { categorias, loading, errorMessage, reload }
}
