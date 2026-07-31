import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type HistorySet = { reps: number | null; carga_kg: number | null }

export type ExerciseHistory = {
  lastSession: { logDate: string; sets: HistorySet[] } | null
  historicalMaxKg: number | null
}

export function useExerciseHistory(exercicioIds: string[], beforeDate: string) {
  const [history, setHistory] = useState<Record<string, ExerciseHistory>>({})
  const key = exercicioIds.slice().sort().join(',')

  useEffect(() => {
    let active = true
    if (exercicioIds.length === 0) {
      setHistory({})
      return
    }

    supabase
      .from('treino_serie')
      .select('exercicio_id, log_date, reps, carga_kg')
      .in('exercicio_id', exercicioIds)
      .lt('log_date', beforeDate)
      .order('log_date', { ascending: false })
      .then(({ data, error }) => {
        if (!active || error) return

        const result: Record<string, ExerciseHistory> = {}
        for (const exercicioId of exercicioIds) {
          const rows = (data ?? []).filter((r) => r.exercicio_id === exercicioId)
          if (rows.length === 0) {
            result[exercicioId] = { lastSession: null, historicalMaxKg: null }
            continue
          }
          const lastDate = rows[0].log_date as string
          const lastSets = rows.filter((r) => r.log_date === lastDate).map((r) => ({ reps: r.reps, carga_kg: r.carga_kg }))
          const historicalMaxKg = rows.reduce((max: number | null, r) => {
            if (r.carga_kg === null) return max
            return max === null ? r.carga_kg : Math.max(max, r.carga_kg)
          }, null as number | null)
          result[exercicioId] = { lastSession: { logDate: lastDate, sets: lastSets }, historicalMaxKg }
        }
        setHistory(result)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, beforeDate])

  return history
}
