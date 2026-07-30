import { InstrumentCard, fieldInputClass, fieldLabelClass } from '../ui/InstrumentCard'
import { IconGear } from '../ui/icons'

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
    <InstrumentCard icon={IconGear} title="Academia">
      <label className="flex items-center gap-2 font-body text-base text-parchment">
        <input
          type="checkbox"
          checked={value.treinou}
          onChange={(e) => onChange({ ...value, treinou: e.target.checked })}
          className="h-5 w-5 accent-brass"
        />
        Treinou hoje
      </label>

      {value.treinou && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={fieldLabelClass}>DURAÇÃO (MIN)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.duracaoMin}
              onChange={(e) => onChange({ ...value, duracaoMin: e.target.value })}
              className={fieldInputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={fieldLabelClass}>TIPO</label>
            <input
              type="text"
              placeholder="Musculação, corrida..."
              value={value.tipo}
              onChange={(e) => onChange({ ...value, tipo: e.target.value })}
              className={fieldInputClass}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className={fieldLabelClass}>OBSERVAÇÃO (OPCIONAL)</label>
        <input
          type="text"
          value={value.observacao}
          onChange={(e) => onChange({ ...value, observacao: e.target.value })}
          className={fieldInputClass}
        />
      </div>
    </InstrumentCard>
  )
}
