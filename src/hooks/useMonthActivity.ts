import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const PILLAR_TABLES = ['pillar_academia', 'pillar_trabalho', 'pillar_estudos', 'pillar_financas', 'pillar_habitos']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function useMonthActivity(year: number, month: number) {
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const [counts, setCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    let active = true
    setLoading(true)
    const from = `${year}-${pad(month + 1)}-01`
    const to = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`

    Promise.all([
      supabase.from('daily_log').select('log_date').gte('log_date', from).lte('log_date', to),
      ...PILLAR_TABLES.map((table) => supabase.from(table).select('log_date').gte('log_date', from).lte('log_date', to)),
    ]).then(([logRes, ...pillarResults]) => {
      if (!active) return
      const error = logRes.error ?? pillarResults.find((r) => r.error)?.error
      if (error) {
        setLoading(false)
        return
      }
      const registeredSet = new Set((logRes.data ?? []).map((r) => r.log_date as string))
      const countMap = new Map<string, number>()
      for (const result of pillarResults) {
        for (const row of result.data ?? []) {
          const date = (row as { log_date: string }).log_date
          countMap.set(date, (countMap.get(date) ?? 0) + 1)
        }
      }
      setRegistered(registeredSet)
      setCounts(countMap)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [year, month])

  return { loading, registered, counts }
}
