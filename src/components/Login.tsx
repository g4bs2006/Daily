import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { IconAnchor } from './ui/icons'

type Star = { left: number; top: number; delay: number; size: number }

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 70,
    delay: Math.random() * 4,
    size: Math.random() < 0.2 ? 3 : 2,
  }))
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [stars] = useState(() => makeStars(50))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    }
  }

  return (
    <div className="login-scene relative flex min-h-svh items-center justify-center overflow-hidden bg-ink px-4">
      <style>{`
        .login-scene {
          background: radial-gradient(ellipse 80% 60% at 50% 20%, #1c2436 0%, var(--color-ink) 55%, #0d1019 100%);
        }
        .login-star {
          position: absolute;
          background: var(--color-parchment);
          border-radius: 50%;
          opacity: 0.08;
          animation: login-twinkle 4s ease-in-out infinite;
        }
        @keyframes login-twinkle {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.6; }
        }
        .login-horizon { position: absolute; bottom: 0; left: 0; width: 100%; height: 160px; overflow: hidden; }
        .login-wave { position: absolute; bottom: 0; left: 0; width: 200%; height: 100%; }
        .login-wave svg { width: 100%; height: 100%; }
        .login-wave.w1 { animation: login-drift 22s linear infinite; opacity: 0.9; }
        .login-wave.w2 { animation: login-drift 34s linear infinite reverse; opacity: 0.6; }
        @keyframes login-drift {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .login-chain {
          width: 1px; height: 14px; margin: 0 auto;
          background: linear-gradient(var(--color-brass-dim), transparent);
          opacity: 0;
          animation: login-chain-drop 0.6s ease-out 0.1s forwards;
        }
        @keyframes login-chain-drop {
          from { opacity: 0; height: 0; }
          to { opacity: 0.6; height: 14px; }
        }
        .login-anchor path, .login-anchor circle {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: login-draw 1s ease-out 0.5s forwards;
        }
        @keyframes login-draw {
          to { stroke-dashoffset: 0; }
        }
        .login-fade-1 { opacity: 0; transform: translateY(6px); animation: login-fade-up 0.7s ease-out 1.3s forwards; }
        .login-fade-2 { opacity: 0; transform: translateY(6px); animation: login-fade-up 0.6s ease-out 1.6s forwards; }
        @keyframes login-fade-up {
          to { opacity: 1; transform: translateY(0); }
        }
        .login-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(20,24,33,0.3); border-top-color: var(--color-ink);
          border-radius: 50%; margin-right: 8px; vertical-align: -2px;
          animation: login-spin 0.7s linear infinite;
        }
        @keyframes login-spin {
          to { transform: rotate(360deg); }
        }
        .login-shake { animation: login-shake 0.4s; }
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-star, .login-wave, .login-chain, .login-anchor path, .login-anchor circle,
          .login-fade-1, .login-fade-2, .login-shake {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .login-anchor path, .login-anchor circle { stroke-dashoffset: 0 !important; }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={i}
            className="login-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="login-horizon">
        <div className="login-wave w1">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none">
            <path d="M0 20 Q 50 0, 100 20 T 200 20 T 300 20 T 400 20 V40 H0 Z" fill="#8f6a30" opacity="0.35" />
          </svg>
        </div>
        <div className="login-wave w2">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none">
            <path d="M0 25 Q 50 8, 100 25 T 200 25 T 300 25 T 400 25 V40 H0 Z" fill="#5f8a63" opacity="0.3" />
          </svg>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full max-w-sm space-y-5 rounded-lg border border-white/10 bg-ink-2/75 p-8 shadow-2xl backdrop-blur-sm ${
          shaking ? 'login-shake' : ''
        }`}
      >
        <div className="space-y-2 text-center">
          <div className="login-chain" />
          <IconAnchor size={32} className="login-anchor mx-auto text-brass" />
          <div className="login-fade-1">
            <h1 className="font-display text-2xl text-parchment">Diário de Bordo</h1>
            <p className="font-mono text-xs tracking-wide text-parchment-dim">ACESSO DO CAPITÃO</p>
          </div>
        </div>

        <div className="login-fade-2 space-y-5">
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
              className="w-full rounded-md border border-white/15 bg-ink px-3 py-2 font-body text-base text-parchment outline-none transition-shadow focus:border-brass focus:shadow-[0_0_0_3px_rgba(200,147,63,0.15)]"
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
              className="w-full rounded-md border border-white/15 bg-ink px-3 py-2 font-body text-base text-parchment outline-none transition-shadow focus:border-brass focus:shadow-[0_0_0_3px_rgba(200,147,63,0.15)]"
            />
          </div>

          {error && <p className="font-mono text-xs text-rust">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brass py-2 font-body text-base font-medium text-ink transition-colors hover:bg-[#d6a04c] disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Selando acesso...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
