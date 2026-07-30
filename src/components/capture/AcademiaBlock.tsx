export type AcademiaState = {
  treinou: boolean
  duracaoMin: string
  tipo: string
  observacao: string
}

export const emptyAcademia: AcademiaState = {
  treinou: false,
  duracaoMin: '',
  tipo: '',
  observacao: '',
}

type Props = {
  value: AcademiaState
  onChange: (value: AcademiaState) => void
}

export function AcademiaBlock({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Academia</legend>

      <label className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={value.treinou}
          onChange={(e) => onChange({ ...value, treinou: e.target.checked })}
          className="h-5 w-5"
        />
        Treinou hoje
      </label>

      {value.treinou && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-gray-600 dark:text-gray-400">Duração (min)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.duracaoMin}
              onChange={(e) => onChange({ ...value, duracaoMin: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600 dark:text-gray-400">Tipo</label>
            <input
              type="text"
              placeholder="Musculação, corrida..."
              value={value.tipo}
              onChange={(e) => onChange({ ...value, tipo: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm text-gray-600 dark:text-gray-400">Observação (opcional)</label>
        <input
          type="text"
          value={value.observacao}
          onChange={(e) => onChange({ ...value, observacao: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    </fieldset>
  )
}
