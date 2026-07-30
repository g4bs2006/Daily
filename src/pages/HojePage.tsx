import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLogDate } from '../hooks/useLogDate'
import { DateNav } from '../components/ui/DateNav'
import { Stamp } from '../components/ui/Stamp'
import { SealDot } from '../components/ui/SealDot'
import { IconBriefcase, IconCheck, IconCoin, IconGear, IconPencil } from '../components/ui/icons'

type SaveState = 'loading' | 'idle' | 'saving' | 'saved' | 'error'

const PILLARS = [
  { path: '/academia', label: 'Academia', table: 'pillar_academia', Icon: IconGear },
  { path: '/trabalho', label: 'Trabalho', table: 'pillar_trabalho', Icon: IconBriefcase },
  { path: '/estudos', label: 'Estudos', table: 'pillar_estudos', Icon: IconPencil },
  { path: '/financas', label: 'Finanças', table: 'pillar_financas', Icon: IconCoin },
  { path: '/habitos', label: 'Hábitos', table: 'pillar_habitos', Icon: IconCheck },
] as const

export function HojePage() {
  const { logDate, isToday, goPrevDay, goNextDay, goToday } = useLogDate()
  const [entryNumber, setEntryNumber] = useState<number | null>(null)
  const [overallNote, setOverallNote] = useState('')
  const [tomorrowPlanText, setTomorrowPlanText] = useState('')
  const [sealed, setSealed] = useState(false)
  const [pillarStatus, setPillarStatus] = useState<Record<string, boolean>>({})
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setState('loading')

    async function load() {
      const [countRes, dailyLogRes, planRes, ...pillarResults] = await Promise.all([
        supabase.from('daily_log').select('id', { count: 'exact', head: true }).lte('log_date', logDate),
        supabase.from('daily_log').select('overall_note').eq('log_date', logDate).maybeSingle(),
        supabase.from('tomorrow_plan').select('description').eq('log_date', logDate).order('created_at'),
        ...PILLARS.map((p) =>
          supabase.from(p.table).select('log_date', { count: 'exact', head: true }).eq('log_date', logDate),
        ),
      ])

      if (!active) return

      const firstError = countRes.error ?? dailyLogRes.error ?? planRes.error ?? pillarResults.find((r) => r.error)?.error
      if (firstError) {
        setErrorMessage(firstError.message)
        setState('error')
        return
      }

      setEntryNumber((countRes.count ?? 0) + (dailyLogRes.data ? 0 : 1))
      setOverallNote(dailyLogRes.data?.overall_note ?? '')
      setSealed(Boolean(dailyLogRes.data))
      setTomorrowPlanText((planRes.data ?? []).map((row) => row.description).join('\n'))
      setPillarStatus(
        Object.fromEntries(PILLARS.map((p, i) => [p.table, (pillarResults[i].count ?? 0) > 0])),
      )
      setState('idle')
    }

    load()
    return () => {
      active = false
    }
  }, [logDate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState('saving')
    setErrorMessage(null)

    const planItems = tomorrowPlanText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3)

    const { error: upsertError } = await supabase
      .from('daily_log')
      .upsert({ log_date: logDate, overall_note: overallNote }, { onConflict: 'log_date' })
    if (upsertError) {
      setErrorMessage(upsertError.message)
      setState('error')
      return
    }

    const deleteRes = await supabase.from('tomorrow_plan').delete().eq('log_date', logDate)
    if (deleteRes.error) {
      setErrorMessage(deleteRes.error.message)
      setState('error')
      return
    }

    if (planItems.length > 0) {
      const insertRes = await supabase
        .from('tomorrow_plan')
        .insert(planItems.map((description) => ({ log_date: logDate, description })))
      if (insertRes.error) {
        setErrorMessage(insertRes.error.message)
        setState('error')
        return
      }
    }

    setSealed(true)
    setState('saved')
  }

  if (state === 'loading') return null

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 px-4 py-8">
      <div>
        <p className="font-mono text-xs tracking-wide text-brass">
          ENTRADA Nº {String(entryNumber ?? 0).padStart(3, '0')}
        </p>
        <DateNav logDate={logDate} isToday={isToday} onPrevDay={goPrevDay} onNextDay={goNextDay} onToday={goToday} />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PILLARS.map((p) => (
          <Link
            key={p.path}
            to={isToday ? p.path : `${p.path}?d=${logDate}`}
            className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-ink-2 py-3 text-center hover:border-brass/50"
          >
            <p.Icon size={16} className={pillarStatus[p.table] ? 'text-moss' : 'text-parchment-dim'} />
            <span className="font-mono text-[10px] tracking-wide text-parchment-dim">{p.label.toUpperCase()}</span>
            <SealDot filled={Boolean(pillarStatus[p.table])} />
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="font-mono text-xs tracking-wide text-parchment-dim">COMO FOI O DIA?</label>
          <textarea
            value={overallNote}
            onChange={(e) => setOverallNote(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-md border border-white/15 bg-ink-2 p-3 font-body text-base text-parchment outline-none focus:border-brass"
          />
        </div>

        <div className="space-y-1">
          <label className="font-mono text-xs tracking-wide text-parchment-dim">
            PLANEJAMENTO PARA AMANHÃ (ATÉ 3 ITENS, UM POR LINHA)
          </label>
          <textarea
            value={tomorrowPlanText}
            onChange={(e) => setTomorrowPlanText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-white/15 bg-ink-2 p-3 font-body text-base text-parchment outline-none focus:border-brass"
          />
        </div>

        <button
          type="submit"
          disabled={state === 'saving'}
          className="w-full rounded-md bg-brass py-2.5 font-body text-base font-medium text-ink disabled:opacity-50"
        >
          {state === 'saving' ? 'Selando...' : sealed ? 'Atualizar registro' : 'Selar o dia'}
        </button>

        {state === 'saved' && (
          <div className="flex items-center justify-center py-2">
            <Stamp ringText="DIA REGISTRADO •" value="OK" caption="SELADO" tone="moss" size={88} />
          </div>
        )}
        {state === 'error' && errorMessage && <p className="font-mono text-xs text-rust">{errorMessage}</p>}
      </form>
    </div>
  )
}
