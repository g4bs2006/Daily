import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { ensureDailyLog } from '../lib/ensureDailyLog'
import { useLogDate } from '../hooks/useLogDate'
import { PillarPageShell, type SaveState } from '../components/ui/PillarPageShell'
import { fieldInputClass, fieldLabelClass } from '../components/ui/InstrumentCard'
import { IconBriefcase } from '../components/ui/icons'

export function TrabalhoPage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const [tarefasConcluidas, setTarefasConcluidas] = useState('')
  const [horasFoco, setHorasFoco] = useState('')
  const [entregaPrincipal, setEntregaPrincipal] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setState('loading')
    supabase
      .from('pillar_trabalho')
      .select('tarefas_concluidas, horas_foco, entrega_principal')
      .eq('log_date', logDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setErrorMessage(error.message)
          setState('error')
          return
        }
        setTarefasConcluidas(data?.tarefas_concluidas?.toString() ?? '')
        setHorasFoco(data?.horas_foco?.toString() ?? '')
        setEntregaPrincipal(data?.entrega_principal ?? '')
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

    const { error } = await supabase.from('pillar_trabalho').upsert(
      {
        log_date: logDate,
        tarefas_concluidas: tarefasConcluidas ? Number(tarefasConcluidas) : null,
        horas_foco: horasFoco ? Number(horasFoco) : null,
        entrega_principal: entregaPrincipal || null,
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
      icon={IconBriefcase}
      title="Trabalho"
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
          <label className={fieldLabelClass}>TAREFAS CONCLUÍDAS</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={tarefasConcluidas}
            onChange={(e) => setTarefasConcluidas(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>HORAS DE FOCO</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={horasFoco}
            onChange={(e) => setHorasFoco(e.target.value)}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={fieldLabelClass}>ENTREGA PRINCIPAL (OPCIONAL)</label>
        <input
          type="text"
          value={entregaPrincipal}
          onChange={(e) => setEntregaPrincipal(e.target.value)}
          className={fieldInputClass}
        />
      </div>
    </PillarPageShell>
  )
}
