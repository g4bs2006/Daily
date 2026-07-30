export type EstudosState = {
  minutosEstudo: string
  materia: string
  progresso: string
}

export const emptyEstudos: EstudosState = {
  minutosEstudo: '',
  materia: '',
  progresso: '',
}

type Props = {
  value: EstudosState
  onChange: (value: EstudosState) => void
}

export function EstudosBlock({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Estudos</legend>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Minutos estudados</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value.minutosEstudo}
            onChange={(e) => onChange({ ...value, minutosEstudo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Matéria</label>
          <input
            type="text"
            value={value.materia}
            onChange={(e) => onChange({ ...value, materia: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600 dark:text-gray-400">Progresso (opcional)</label>
        <input
          type="text"
          value={value.progresso}
          onChange={(e) => onChange({ ...value, progresso: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    </fieldset>
  )
}
