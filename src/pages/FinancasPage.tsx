import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconCoin } from '../components/ui/icons'

export function FinancasPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const [gastoDia, setGastoDia] = useState('')
  const [categoria, setCategoria] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_financas')
      .select('gasto_dia, categoria')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setGastoDia(data?.gasto_dia?.toString() ?? '')
        setCategoria(data?.categoria ?? '')
        setState('idle')
      })
    return () => {
      active = false
    }
  }, [logDate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState('saving')
    setErrorMessage(null)

    const ensureRes = await ensureDailyLog(logDate)
    if (ensureRes.error) {
      setErrorMessage(ensureRes.error.message)
      setState('error')
      return
    }

    const { error } = await supabase.from('pillar_financas').upsert(
      {
        log_date: logDate,
        gasto_dia: gastoDia ? Number(gastoDia) : null,
        categoria: categoria || null,
      },
      { onConflict: 'log_date' },
    )
    if (error) {
      setErrorMessage(error.message)
      setState('error')
      return
    }
    setState('saved')
  }

  return (
    <PillarPageShell
      icon={IconCoin}
      title="Finanças"
      logDate={logDate}
      isToday={isToday}
      onPrevDay={goPrevDay}
      onNextDay={goNextDay}
      onToday={goToday}
      saveState={state}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>GASTO DO DIA (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={gastoDia}
            onChange={(e) => setGastoDia(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>CATEGORIA (OPCIONAL)</label>
          <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={fieldInputClass} />
        </div>
      </div>
    </PillarPageShell>
  )
}
