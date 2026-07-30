import { useState } from 'react'

type Props = {
  label: string
  confirmLabel: string
  onConfirm: () => void
  disabled?: boolean
}

export function ConfirmDeleteButton({ label, confirmLabel, onConfirm, disabled }: Props) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        className="font-mono text-xs text-rust hover:underline disabled:opacity-50"
      >
        {label}
      </button>
    )
  }

  return (
    <span className="flex items-center gap-2 font-mono text-xs">
      <button
        type="button"
        onClick={() => {
          setConfirming(false)
          onConfirm()
        }}
        className="font-semibold text-rust hover:underline"
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-parchment-dim hover:underline">
        cancelar
      </button>
    </span>
  )
}
