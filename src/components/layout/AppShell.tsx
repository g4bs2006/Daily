import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar, type View } from './Sidebar'
import { IconMenu } from '../ui/icons'

const COLLAPSE_KEY = 'diario-sidebar-collapsed'

const VIEW_TITLES: Record<View, string> = {
  captura: 'Captura',
  painel: 'Painel',
  habitos: 'Hábitos',
}

type Props = {
  view: View
  onSelect: (view: View) => void
  userEmail: string
  onSignOut: () => void
  children: ReactNode
}

export function AppShell({ view, onSelect, userEmail, onSignOut, children }: Props) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  function select(next: View) {
    onSelect(next)
    setMobileOpen(false)
  }

  return (
    <div className="flex h-svh bg-ink text-parchment">
      <Sidebar
        view={view}
        onSelect={select}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        userEmail={userEmail}
        onSignOut={onSignOut}
        className="hidden md:flex"
      />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <Sidebar
            view={view}
            onSelect={select}
            collapsed={false}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
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
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="text-brass"
          >
            <IconMenu size={22} />
          </button>
          <span className="font-display text-base">{VIEW_TITLES[view]}</span>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
