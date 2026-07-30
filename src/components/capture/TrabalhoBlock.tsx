export type TrabalhoState = {
  tarefasConcluidas: string
  horasFoco: string
  entregaPrincipal: string
}

export const emptyTrabalho: TrabalhoState = {
  tarefasConcluidas: '',
  horasFoco: '',
  entregaPrincipal: '',
}

type Props = {
  value: TrabalhoState
  onChange: (value: TrabalhoState) => void
}

export function TrabalhoBlock({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Trabalho</legend>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Tarefas concluídas</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value.tarefasConcluidas}
            onChange={(e) => onChange({ ...value, tarefasConcluidas: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Horas de foco</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={value.horasFoco}
            onChange={(e) => onChange({ ...value, horasFoco: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600 dark:text-gray-400">Entrega principal (opcional)</label>
        <input
          type="text"
          value={value.entregaPrincipal}
          onChange={(e) => onChange({ ...value, entregaPrincipal: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    </fieldset>
  )
}
