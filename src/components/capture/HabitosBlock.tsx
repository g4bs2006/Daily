import type { HabitoDefinicao } from '../../hooks/useHabitoDefinicoes'
import { InstrumentCard } from '../ui/InstrumentCard'
import { IconCheck } from '../ui/icons'

type Props = {
  definicoes: HabitoDefinicao[]
  checked: Record<string, boolean>
  onChange: (checked: Record<string, boolean>) => void
}

export function HabitosBlock({ definicoes, checked, onChange }: Props) {
  const ativos = definicoes.filter((d) => d.ativo)

  if (ativos.length === 0) return null

  return (
    <InstrumentCard icon={IconCheck} title="Hábitos">
      {ativos.map((habito) => (
        <label
          key={habito.id}
          className="flex items-center gap-2 font-body text-base text-parchment"
        >
          <input
            type="checkbox"
            checked={checked[habito.id] ?? false}
            onChange={(e) => onChange({ ...checked, [habito.id]: e.target.checked })}
            className="h-5 w-5 accent-brass"
          />
          {habito.nome}
        </label>
      ))}
    </InstrumentCard>
  )
}
