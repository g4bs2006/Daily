import type { ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

type SubItem = { to: string; label: string }
type NavItem = {
  to: string
  label: string
  Icon: ComponentType<{ size?: number; className?: string }>
  children?: SubItem[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/hoje', label: 'Hoje', Icon: IconAnchor },
  {
    to: '/academia',
    label: 'Academia',
    Icon: IconGear,
    children: [
      { to: '/academia/hoje', label: 'Treino do dia' },
      { to: '/academia/tipos', label: 'Tipos de Treino' },
      { to: '/academia/progresso', label: 'Progresso' },
      { to: '/academia/corpo', label: 'Peso & Medidas' },
    ],
  },
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
  const location = useLocation()

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
          const isSectionActive = location.pathname.startsWith(item.to)
          return (
            <div key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                title={item.label}
                className={
                  isSectionActive
                    ? 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm bg-brass/15 text-brass'
                    : 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm text-parchment-dim hover:bg-white/5 hover:text-parchment'
                }
              >
                <item.Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>

              {!collapsed && item.children && isSectionActive && (
                <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {item.children.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `block rounded-md px-2 py-1 font-mono text-xs ${
                          isActive ? 'text-brass' : 'text-parchment-dim hover:text-parchment'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
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
