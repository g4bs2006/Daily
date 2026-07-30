import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { IconMenu } from '../ui/icons'

const COLLAPSE_KEY = 'diario-sidebar-collapsed'

const PATH_TITLES: Record<string, string> = {
  '/hoje': 'Hoje',
  '/academia': 'Academia',
  '/trabalho': 'Trabalho',
  '/estudos': 'Estudos',
  '/financas': 'Finanças',
  '/habitos': 'Hábitos',
  '/painel': 'Painel',
}

type Props = {
  userEmail: string
  onSignOut: () => void
}

export function AppShell({ userEmail, onSignOut }: Props) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const title = PATH_TITLES[location.pathname] ?? 'Diário de Bordo'

  return (
    <div className="flex h-svh bg-ink text-parchment">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        userEmail={userEmail}
        onSignOut={onSignOut}
        className="hidden md:flex"
      />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <Sidebar
            collapsed={false}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
            onNavigate={() => setMobileOpen(false)}
            userEmail={userEmail}
            onSignOut={onSignOut}
            className="relative z-10"
          />
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-black/50"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:hidden">
          <button type="button" aria-label="Abrir menu" onClick={() => setMobileOpen(true)} className="text-brass">
            <IconMenu size={22} />
          </button>
          <span className="font-display text-base">{title}</span>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
