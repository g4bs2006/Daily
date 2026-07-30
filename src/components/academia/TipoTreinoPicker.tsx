import type { TipoTreino } from '../../hooks/useTiposTreino'

type Props = {
  tipos: TipoTreino[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TipoTreinoPicker({ tipos, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {tipos.map((tipo) => {
        const active = tipo.id === selectedId
        return (
          <button
            key={tipo.id}
            type="button"
            onClick={() => onSelect(tipo.id)}
            className={`min-w-[120px] shrink-0 rounded-lg border p-3 text-left transition-colors ${
              active ? 'border-brass bg-brass/10' : 'border-white/10 bg-ink hover:border-white/25'
            }`}
          >
            <p className={`font-body text-sm font-semibold ${active ? 'text-brass' : 'text-parchment'}`}>{tipo.nome}</p>
            <p className="mt-1 font-mono text-xs text-parchment-dim">
              {tipo.itens.length} exercício{tipo.itens.length === 1 ? '' : 's'}
            </p>
          </button>
        )
      })}
    </div>
  )
}
