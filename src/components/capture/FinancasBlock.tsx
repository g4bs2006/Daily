export type FinancasState = {
  gastoDia: string
  categoria: string
}

export const emptyFinancas: FinancasState = {
  gastoDia: '',
  categoria: '',
}

type Props = {
  value: FinancasState
  onChange: (value: FinancasState) => void
}

export function FinancasBlock({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Finanças</legend>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Gasto do dia (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={value.gastoDia}
            onChange={(e) => onChange({ ...value, gastoDia: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600 dark:text-gray-400">Categoria (opcional)</label>
          <input
            type="text"
            value={value.categoria}
            onChange={(e) => onChange({ ...value, categoria: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>
    </fieldset>
  )
}
