import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { IconAnchor } from './ui/icons'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-lg border border-white/10 bg-ink-2 p-8"
      >
        <div className="space-y-2 text-center">
          <IconAnchor size={32} className="mx-auto text-brass" />
          <h1 className="font-display text-2xl text-parchment">Diário de Bordo</h1>
          <p className="font-mono text-xs tracking-wide text-parchment-dim">ACESSO DO CAPITÃO</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="font-mono text-xs tracking-wide text-parchment-dim">
            E-MAIL
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-ink px-3 py-2 font-body text-base text-parchment outline-none focus:border-brass"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="font-mono text-xs tracking-wide text-parchment-dim">
            SENHA
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-ink px-3 py-2 font-body text-base text-parchment outline-none focus:border-brass"
          />
        </div>

        {error && <p className="font-mono text-xs text-rust">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brass py-2 font-body text-base font-medium text-ink disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
