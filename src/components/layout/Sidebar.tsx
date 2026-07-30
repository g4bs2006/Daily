import type { ComponentType } from 'react'
import { IconAnchor, IconCheck, IconChevron, IconGauge, IconPencil, IconPower } from '../ui/icons'

type View = 'captura' | 'painel' | 'habitos'

type NavItem = { view: View; label: string; Icon: ComponentType<{ size?: number; className?: string }> }

const NAV_ITEMS: NavItem[] = [
  { view: 'captura', label: 'Captura', Icon: IconPencil },
  { view: 'painel', label: 'Painel', Icon: IconGauge },
  { view: 'habitos', label: 'Hábitos', Icon: IconCheck },
]

type Props = {
  view: View
  onSelect: (view: View) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  userEmail: string
  onSignOut: () => void
  className?: string
}

export function Sidebar({ view, onSelect, collapsed, onToggleCollapsed, userEmail, onSignOut, className = '' }: Props) {
  return (
    <div
      className={`flex h-full flex-col bg-ink-2 text-parchment ${className}`}
      style={{ width: collapsed ? 72 : 224 }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <IconAnchor size={20} className="shrink-0 text-brass" />
        {!collapsed && <span className="font-display text-base tracking-wide">Diário de Bordo</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active = view === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onSelect(item.view)}
              title={item.label}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm transition-colors ${
                active ? 'bg-brass/15 text-brass' : 'text-parchment-dim hover:bg-white/5 hover:text-parchment'
              }`}
            >
              <item.Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-2 py-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden w-full items-center gap-3 rounded-md px-3 py-2 text-left font-mono text-xs text-parchment-dim hover:bg-white/5 hover:text-parchment md:flex"
        >
          <IconChevron direction={collapsed ? 'right' : 'left'} size={16} className="shrink-0" />
          {!collapsed && <span>Recolher</span>}
        </button>
        {!collapsed && (
          <p className="truncate px-3 font-mono text-xs text-parchment-dim">{userEmail}</p>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm text-parchment-dim hover:bg-white/5 hover:text-rust"
        >
          <IconPower size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  )
}

export type { View }
