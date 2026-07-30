import type { HabitoDefinicao } from '../../hooks/useHabitoDefinicoes'

type Props = {
  definicoes: HabitoDefinicao[]
  checked: Record<string, boolean>
  onChange: (checked: Record<string, boolean>) => void
}

export function HabitosBlock({ definicoes, checked, onChange }: Props) {
  const ativos = definicoes.filter((d) => d.ativo)

  if (ativos.length === 0) return null

  return (
    <fieldset className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Hábitos</legend>

      {ativos.map((habito) => (
        <label
          key={habito.id}
          className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200"
        >
          <input
            type="checkbox"
            checked={checked[habito.id] ?? false}
            onChange={(e) => onChange({ ...checked, [habito.id]: e.target.checked })}
            className="h-5 w-5"
          />
          {habito.nome}
        </label>
      ))}
    </fieldset>
  )
}
