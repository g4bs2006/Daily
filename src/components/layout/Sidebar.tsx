import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconAnchor,
  IconBriefcase,
  IconCheck,
  IconChevron,
  IconCoin,
  IconGauge,
  IconGear,
  IconPencil,
  IconPower,
} from '../ui/icons'

type NavItem = { to: string; label: string; Icon: ComponentType<{ size?: number; className?: string }> }

const NAV_ITEMS: NavItem[] = [
  { to: '/hoje', label: 'Hoje', Icon: IconAnchor },
  { to: '/academia', label: 'Academia', Icon: IconGear },
  { to: '/trabalho', label: 'Trabalho', Icon: IconBriefcase },
  { to: '/estudos', label: 'Estudos', Icon: IconPencil },
  { to: '/financas', label: 'Finanças', Icon: IconCoin },
  { to: '/habitos', label: 'Hábitos', Icon: IconCheck },
  { to: '/painel', label: 'Painel', Icon: IconGauge },
]

type Props = {
  collapsed: boolean
  onToggleCollapsed: () => void
  onNavigate?: () => void
  userEmail: string
  onSignOut: () => void
  className?: string
}

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate, userEmail, onSignOut, className = '' }: Props) {
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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={item.label}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm transition-colors ${
                isActive ? 'bg-brass/15 text-brass' : 'text-parchment-dim hover:bg-white/5 hover:text-parchment'
              }`
            }
          >
            <item.Icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
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
        {!collapsed && <p className="truncate px-3 font-mono text-xs text-parchment-dim">{userEmail}</p>}
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
