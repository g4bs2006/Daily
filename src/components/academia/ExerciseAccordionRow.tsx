import { useState } from 'react'
import { SealDot } from '../ui/SealDot'
import { IconChevron } from '../ui/icons'

export type LoggedSet = { id: string; ordem_serie: number; reps: number | null; carga_kg: number | null }

type Props = {
  nome: string
  metaLabel?: string
  sets: LoggedSet[]
  defaultOpen?: boolean
  onAddSet: (reps: number | null, carga: number | null) => void
  onRemoveSet: (id: string) => void
}

export function ExerciseAccordionRow({ nome, metaLabel, sets, defaultOpen = false, onAddSet, onRemoveSet }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [reps, setReps] = useState('')
  const [carga, setCarga] = useState('')
  const done = sets.length > 0

  function handleAdd() {
    if (!reps && !carga) return
    onAddSet(reps ? Number(reps) : null, carga ? Number(carga) : null)
    setReps('')
    setCarga('')
  }

  const summary = done
    ? `${sets.length} série${sets.length === 1 ? '' : 's'} · até ${Math.max(...sets.map((s) => s.carga_kg ?? 0))}kg`
    : metaLabel ?? 'sem série ainda'

  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-ink px-3.5 py-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <SealDot filled={done} />
          <span className="font-body text-sm text-parchment">{nome}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-parchment-dim">{summary}</span>
          <IconChevron
            direction="right"
            size={12}
            className={`text-parchment-dim transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-dashed border-white/10 p-3.5">
          {sets.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sets.map((set) => (
                <span
                  key={set.id}
                  className="flex items-center gap-1.5 rounded-full bg-brass/10 px-2.5 py-1 font-mono text-xs text-brass"
                >
                  {set.reps ?? '—'}×{set.carga_kg ?? '—'}kg
                  <button type="button" onClick={() => onRemoveSet(set.id)} className="text-parchment-dim">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="reps"
              className="w-16 rounded-md border border-white/15 bg-ink px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
            />
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={carga}
              onChange={(e) => setCarga(e.target.value)}
              placeholder="kg"
              className="w-16 rounded-md border border-white/15 bg-ink px-2 py-1.5 font-mono text-xs text-parchment outline-none focus:border-brass"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-md bg-brass px-3 py-1.5 font-mono text-xs font-semibold text-ink"
            >
              + série
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
