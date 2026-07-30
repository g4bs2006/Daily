import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

function todayIsoDate() {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

type SaveState = 'idle' | 'loading' | 'saved' | 'error'

export function DailyLogForm() {
  const logDate = todayIsoDate()
  const [note, setNote] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase
      .from('daily_log')
      .select('overall_note')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setNote(data?.overall_note ?? '')
        setState('idle')
      })
    return () => {
      active = false
    }
  }, [logDate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMessage(null)
    const { error } = await supabase
      .from('daily_log')
      .upsert({ log_date: logDate, overall_note: note }, { onConflict: 'log_date' })
    if (error) {
      setErrorMessage(error.message)
      setState('error')
      return
    }
    setState('saved')
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Fechamento do dia</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(logDate + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Como foi o dia?"
          rows={6}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />

        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full rounded-lg bg-gray-900 py-2 text-base font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {state === 'loading' ? 'Salvando...' : 'Salvar'}
        </button>

        {state === 'saved' && <p className="text-sm text-green-600 dark:text-green-400">Salvo.</p>}
        {state === 'error' && errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
      </form>
    </div>
  )
}
