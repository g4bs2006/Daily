import { useState } from 'react'

export type LoggedSet = { id: string; ordem_serie: number; reps: number | null; carga_kg: number | null }

type Props = {
  nome: string
  metaLabel?: string
  sets: LoggedSet[]
  onAddSet: (reps: number | null, carga: number | null) => void
  onRemoveSet: (id: string) => void
}

export function SetLogger({ nome, metaLabel, sets, onAddSet, onRemoveSet }: Props) {
  const [reps, setReps] = useState('')
  const [carga, setCarga] = useState('')

  function handleAdd() {
    if (!reps && !carga) return
    onAddSet(reps ? Number(reps) : null, carga ? Number(carga) : null)
    setReps('')
    setCarga('')
  }

  return (
    <div className="space-y-2 rounded-md border border-white/10 bg-ink p-3">
      <div className="flex items-baseline justify-between">
        <p className="font-body text-sm text-parchment">{nome}</p>
        {metaLabel && <p className="font-mono text-xs text-parchment-dim">{metaLabel}</p>}
      </div>

      {sets.length > 0 && (
        <ul className="space-y-1">
          {sets.map((set, i) => (
            <li key={set.id} className="flex items-center justify-between font-mono text-xs text-parchment-dim">
              <span>
                série {i + 1} · {set.reps ?? '—'} reps × {set.carga_kg ?? '—'} kg
              </span>
              <button type="button" onClick={() => onRemoveSet(set.id)} className="text-rust">
                remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="reps"
          className="w-16 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={carga}
          onChange={(e) => setCarga(e.target.value)}
          placeholder="carga kg"
          className="w-20 rounded-md border border-white/15 bg-ink-2 px-2 py-1 font-mono text-xs text-parchment outline-none focus:border-brass"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-brass px-3 py-1 font-mono text-xs font-medium text-ink"
        >
          + série
        </button>
      </div>
    </div>
  )
}
