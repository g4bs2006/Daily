import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDateLong, todayIsoDate } from '../../lib/date'
import { AcademiaBlock, emptyAcademia, type AcademiaState } from './AcademiaBlock'
import { TrabalhoBlock, emptyTrabalho, type TrabalhoState } from './TrabalhoBlock'
import { EstudosBlock, emptyEstudos, type EstudosState } from './EstudosBlock'
import { FinancasBlock, emptyFinancas, type FinancasState } from './FinancasBlock'
import { HabitosBlock } from './HabitosBlock'
import { useHabitoDefinicoes } from '../../hooks/useHabitoDefinicoes'

type SaveState = 'loading' | 'idle' | 'saving' | 'saved' | 'error'

export function DailyCaptureForm() {
  const logDate = todayIsoDate()
  const { definicoes: habitoDefinicoes, loading: habitosLoading } = useHabitoDefinicoes()
  const [overallNote, setOverallNote] = useState('')
  const [academia, setAcademia] = useState<AcademiaState>(emptyAcademia)
  const [trabalho, setTrabalho] = useState<TrabalhoState>(emptyTrabalho)
  const [estudos, setEstudos] = useState<EstudosState>(emptyEstudos)
  const [financas, setFinancas] = useState<FinancasState>(emptyFinancas)
  const [habitosChecked, setHabitosChecked] = useState<Record<string, boolean>>({})
  const [tomorrowPlanText, setTomorrowPlanText] = useState('')
  const [state, setState] = useState<SaveState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      const [dailyLogRes, academiaRes, trabalhoRes, estudosRes, financasRes, habitosRes, planRes] = await Promise.all([
        supabase.from('daily_log').select('overall_note').eq('log_date', logDate).maybeSingle(),
        supabase
          .from('pillar_academia')
          .select('treinou, duracao_min, tipo, observacao')
          .eq('log_date', logDate)
          .maybeSingle(),
        supabase
          .from('pillar_trabalho')
          .select('tarefas_concluidas, horas_foco, entrega_principal')
          .eq('log_date', logDate)
          .maybeSingle(),
        supabase
          .from('pillar_estudos')
          .select('minutos_estudo, materia, progresso')
          .eq('log_date', logDate)
          .maybeSingle(),
        supabase
          .from('pillar_financas')
          .select('gasto_dia, categoria')
          .eq('log_date', logDate)
          .maybeSingle(),
        supabase.from('pillar_habitos').select('itens').eq('log_date', logDate).maybeSingle(),
        supabase.from('tomorrow_plan').select('description').eq('log_date', logDate).order('created_at'),
      ])

      if (!active) return

      const firstError =
        dailyLogRes.error ??
        academiaRes.error ??
        trabalhoRes.error ??
        estudosRes.error ??
        financasRes.error ??
        habitosRes.error ??
        planRes.error
      if (firstError) {
        setErrorMessage(firstError.message)
        setState('error')
        return
      }

      setOverallNote(dailyLogRes.data?.overall_note ?? '')
      setAcademia(
        academiaRes.data
          ? {
              treinou: academiaRes.data.treinou,
              duracaoMin: academiaRes.data.duracao_min?.toString() ?? '',
              tipo: academiaRes.data.tipo ?? '',
              observacao: academiaRes.data.observacao ?? '',
            }
          : emptyAcademia,
      )
      setTrabalho(
        trabalhoRes.data
          ? {
              tarefasConcluidas: trabalhoRes.data.tarefas_concluidas?.toString() ?? '',
              horasFoco: trabalhoRes.data.horas_foco?.toString() ?? '',
              entregaPrincipal: trabalhoRes.data.entrega_principal ?? '',
            }
          : emptyTrabalho,
      )
      setEstudos(
        estudosRes.data
          ? {
              minutosEstudo: estudosRes.data.minutos_estudo?.toString() ?? '',
              materia: estudosRes.data.materia ?? '',
              progresso: estudosRes.data.progresso ?? '',
            }
          : emptyEstudos,
      )
      setFinancas(
        financasRes.data
          ? {
              gastoDia: financasRes.data.gasto_dia?.toString() ?? '',
              categoria: financasRes.data.categoria ?? '',
            }
          : emptyFinancas,
      )
      const savedItens = (habitosRes.data?.itens ?? []) as { id: string; marcado: boolean }[]
      setHabitosChecked(Object.fromEntries(savedItens.map((item) => [item.id, item.marcado])))
      setTomorrowPlanText((planRes.data ?? []).map((row) => row.description).join('\n'))
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

    const dailyLogUpsert = supabase.from('daily_log').upsert(
      { log_date: logDate, overall_note: overallNote },
      { onConflict: 'log_date' },
    )

    const academiaUpsert = supabase.from('pillar_academia').upsert(
      {
        log_date: logDate,
        treinou: academia.treinou,
        duracao_min: academia.duracaoMin ? Number(academia.duracaoMin) : null,
        tipo: academia.tipo || null,
        observacao: academia.observacao || null,
      },
      { onConflict: 'log_date' },
    )

    const trabalhoUpsert = supabase.from('pillar_trabalho').upsert(
      {
        log_date: logDate,
        tarefas_concluidas: trabalho.tarefasConcluidas ? Number(trabalho.tarefasConcluidas) : null,
        horas_foco: trabalho.horasFoco ? Number(trabalho.horasFoco) : null,
        entrega_principal: trabalho.entregaPrincipal || null,
      },
      { onConflict: 'log_date' },
    )

    const estudosUpsert = supabase.from('pillar_estudos').upsert(
      {
        log_date: logDate,
        minutos_estudo: estudos.minutosEstudo ? Number(estudos.minutosEstudo) : null,
        materia: estudos.materia || null,
        progresso: estudos.progresso || null,
      },
      { onConflict: 'log_date' },
    )

    const financasUpsert = supabase.from('pillar_financas').upsert(
      {
        log_date: logDate,
        gasto_dia: financas.gastoDia ? Number(financas.gastoDia) : null,
        categoria: financas.categoria || null,
      },
      { onConflict: 'log_date' },
    )

    const habitosAtivos = habitoDefinicoes.filter((d) => d.ativo)
    const habitosItens = habitosAtivos.map((habito) => ({
      id: habito.id,
      nome: habito.nome,
      marcado: habitosChecked[habito.id] ?? false,
    }))
    const habitosUpsert = supabase.from('pillar_habitos').upsert(
      {
        log_date: logDate,
        itens: habitosItens,
        total_marcados: habitosItens.filter((item) => item.marcado).length,
        total_possivel: habitosItens.length,
      },
      { onConflict: 'log_date' },
    )

    const [dailyLogRes, academiaRes, trabalhoRes, estudosRes, financasRes, habitosRes] = await Promise.all([
      dailyLogUpsert,
      academiaUpsert,
      trabalhoUpsert,
      estudosUpsert,
      financasUpsert,
      habitosUpsert,
    ])
    const upsertError =
      dailyLogRes.error ??
      academiaRes.error ??
      trabalhoRes.error ??
      estudosRes.error ??
      financasRes.error ??
      habitosRes.error
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

    setState('saved')
  }

  if (state === 'loading' || habitosLoading) return null

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Fechamento do dia</h1>
        <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{formatDateLong(logDate)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Como foi o dia?</label>
          <textarea
            value={overallNote}
            onChange={(e) => setOverallNote(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <AcademiaBlock value={academia} onChange={setAcademia} />
        <TrabalhoBlock value={trabalho} onChange={setTrabalho} />
        <EstudosBlock value={estudos} onChange={setEstudos} />
        <FinancasBlock value={financas} onChange={setFinancas} />
        <HabitosBlock definicoes={habitoDefinicoes} checked={habitosChecked} onChange={setHabitosChecked} />

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Planejamento para amanhã (até 3 itens, um por linha)
          </label>
          <textarea
            value={tomorrowPlanText}
            onChange={(e) => setTomorrowPlanText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={state === 'saving'}
          className="w-full rounded-lg bg-gray-900 py-2 text-base font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {state === 'saving' ? 'Salvando...' : 'Salvar'}
        </button>

        {state === 'saved' && <p className="text-sm text-green-600 dark:text-green-400">Salvo.</p>}
        {state === 'error' && errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
      </form>
    </div>
  )
}
