import { useState } from 'react'
import { useSession } from './hooks/useSession'
import { Login } from './components/Login'
import { DailyCaptureForm } from './components/capture/DailyCaptureForm'
import { History } from './components/history/History'
import { HabitosConfig } from './components/habitos/HabitosConfig'
import { supabase } from './lib/supabase'

type View = 'captura' | 'historico' | 'habitos'

const TABS: { view: View; label: string }[] = [
  { view: 'captura', label: 'Captura' },
  { view: 'historico', label: 'Histórico' },
  { view: 'habitos', label: 'Hábitos' },
]

function App() {
  const { session, loading } = useSession()
  const [view, setView] = useState<View>('captura')
  const [editDate, setEditDate] = useState<string | null>(null)

  if (loading) return null
  if (!session) return <Login />

  function selectTab(next: View) {
    setEditDate(null)
    setView(next)
  }

  function editDay(logDate: string) {
    setEditDate(logDate)
    setView('captura')
  }

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <nav className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.view}
              type="button"
              onClick={() => selectTab(tab.view)}
              className={
                view === tab.view
                  ? 'text-sm font-semibold text-gray-900 dark:text-gray-100'
                  : 'text-sm text-gray-500 dark:text-gray-400'
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</span>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Sair
          </button>
        </div>
      </header>
      {view === 'captura' && (
        <DailyCaptureForm logDate={editDate ?? undefined} onDone={() => selectTab('historico')} />
      )}
      {view === 'historico' && <History onEditDay={editDay} />}
      {view === 'habitos' && <HabitosConfig />}
    </div>
  )
}

export default App
