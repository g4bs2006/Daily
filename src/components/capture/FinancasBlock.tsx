import { InstrumentCard, fieldInputClass, fieldLabelClass } from '../ui/InstrumentCard'
import { IconCoin } from '../ui/icons'

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
    <InstrumentCard icon={IconCoin} title="Finanças">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={fieldLabelClass}>GASTO DO DIA (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={value.gastoDia}
            onChange={(e) => onChange({ ...value, gastoDia: e.target.value })}
            className={fieldInputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={fieldLabelClass}>CATEGORIA (OPCIONAL)</label>
          <input
            type="text"
            value={value.categoria}
            onChange={(e) => onChange({ ...value, categoria: e.target.value })}
            className={fieldInputClass}
          />
        </div>
      </div>
    </InstrumentCard>
  )
}
