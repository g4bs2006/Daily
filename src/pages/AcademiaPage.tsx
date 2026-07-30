import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconGear } from '../components/ui/icons'

export function AcademiaPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const [treinou, setTreinou] = useState(false)
  const [duracaoMin, setDuracaoMin] = useState('')
  const [tipo, setTipo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_academia')
      .select('treinou, duracao_min, tipo, observacao')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setTreinou(data?.treinou ?? false)
        setDuracaoMin(data?.duracao_min?.toString() ?? '')
        setTipo(data?.tipo ?? '')
        setObservacao(data?.observacao ?? '')
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

    const { error } = await supabase.from('pillar_academia').upsert(
      {
        log_date: logDate,
        treinou,
        duracao_min: duracaoMin ? Number(duracaoMin) : null,
        tipo: tipo || null,
        observacao: observacao || null,
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
      icon={IconGear}
      title="Academia"
      logDate={logDate}
      isToday={isToday}
      onPrevDay={goPrevDay}
      onNextDay={goNextDay}
      onToday={goToday}
      saveState={state}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
    >
      <label className="flex items-center gap-2 font-body text-base text-parchment">
        <input
          type="checkbox"
          checked={treinou}
          onChange={(e) => setTreinou(e.target.checked)}
          className="h-5 w-5 accent-brass"
        />
        Treinou hoje
      </label>

      {treinou && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={fieldLabelClass}>DURAÇÃO (MIN)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={duracaoMin}
              onChange={(e) => setDuracaoMin(e.target.value)}
              className={fieldInputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={fieldLabelClass}>TIPO</label>
            <input
              type="text"
              placeholder="Musculação, corrida..."
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={fieldInputClass}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className={fieldLabelClass}>OBSERVAÇÃO (OPCIONAL)</label>
        <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} className={fieldInputClass} />
      </div>
    </PillarPageShell>
  )
}
