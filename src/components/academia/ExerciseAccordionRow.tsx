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
  onUpdateSet: (id: string, reps: number | null, carga: number | null) => void
  onRemoveSet: (id: string) => void
}

export function ExerciseAccordionRow({
  nome,
  metaLabel,
  sets,
  defaultOpen = false,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [reps, setReps] = useState('')
  const [carga, setCarga] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const done = sets.length > 0

  function startEdit(set: LoggedSet) {
    setEditingId(set.id)
    setReps(set.reps?.toString() ?? '')
    setCarga(set.carga_kg?.toString() ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setReps('')
    setCarga('')
  }

  function handleSubmitForm() {
    if (!reps && !carga) return
    if (editingId) {
      onUpdateSet(editingId, reps ? Number(reps) : null, carga ? Number(carga) : null)
    } else {
      onAddSet(reps ? Number(reps) : null, carga ? Number(carga) : null)
    }
    setEditingId(null)
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
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs ${
                    editingId === set.id ? 'bg-brass/25 text-brass' : 'bg-brass/10 text-brass'
                  }`}
                >
                  <button type="button" onClick={() => startEdit(set)}>
                    {set.reps ?? '—'}×{set.carga_kg ?? '—'}kg
                  </button>
                  <button type="button" onClick={() => onRemoveSet(set.id)} className="text-parchment-dim">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handleSubmitForm}
              className="rounded-md bg-brass px-3 py-1.5 font-mono text-xs font-semibold text-ink"
            >
              {editingId ? 'salvar' : '+ série'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="font-mono text-xs text-parchment-dim">
                cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
