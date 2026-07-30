import { InstrumentCard, fieldInputClass, fieldLabelClass } from '../ui/InstrumentCard'
import { IconBriefcase } from '../ui/icons'

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
    <InstrumentCard icon={IconBriefcase} title="Trabalho">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>TAREFAS CONCLUÍDAS</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value.tarefasConcluidas}
            onChange={(e) => onChange({ ...value, tarefasConcluidas: e.target.value })}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>HORAS DE FOCO</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={value.horasFoco}
            onChange={(e) => onChange({ ...value, horasFoco: e.target.value })}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={fieldLabelClass}>ENTREGA PRINCIPAL (OPCIONAL)</label>
        <input
          type="text"
          value={value.entregaPrincipal}
          onChange={(e) => onChange({ ...value, entregaPrincipal: e.target.value })}
          className={fieldInputClass}
        />
      </div>
    </InstrumentCard>
  )
}
