import { InstrumentCard, fieldInputClass, fieldLabelClass } from '../ui/InstrumentCard'
import { IconPencil } from '../ui/icons'

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
    <InstrumentCard icon={IconPencil} title="Estudos">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>MINUTOS ESTUDADOS</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value.minutosEstudo}
            onChange={(e) => onChange({ ...value, minutosEstudo: e.target.value })}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>MATÉRIA</label>
          <input
            type="text"
            value={value.materia}
            onChange={(e) => onChange({ ...value, materia: e.target.value })}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={fieldLabelClass}>PROGRESSO (OPCIONAL)</label>
        <input
          type="text"
          value={value.progresso}
          onChange={(e) => onChange({ ...value, progresso: e.target.value })}
          className={fieldInputClass}
        />
      </div>
    </InstrumentCard>
  )
}
