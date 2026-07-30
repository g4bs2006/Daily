import { useState } from 'react'
import { useSession } from './hooks/useSession'
import { Login } from './components/Login'
import { DailyCaptureForm } from './components/capture/DailyCaptureForm'
import { History } from './components/history/History'
import { supabase } from './lib/supabase'

type View = 'captura' | 'historico'

function App() {
  const { session, loading } = useSession()
  const [view, setView] = useState<View>('captura')

  if (loading) return null
  if (!session) return <Login />

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <nav className="flex gap-4">
          <button
            type="button"
            onClick={() => setView('captura')}
            className={
              view === 'captura'
                ? 'text-sm font-semibold text-gray-900 dark:text-gray-100'
                : 'text-sm text-gray-500 dark:text-gray-400'
            }
          >
            Captura
          </button>
          <button
            type="button"
            onClick={() => setView('historico')}
            className={
              view === 'historico'
                ? 'text-sm font-semibold text-gray-900 dark:text-gray-100'
                : 'text-sm text-gray-500 dark:text-gray-400'
            }
          >
            Histórico
          </button>
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
      {view === 'captura' ? <DailyCaptureForm /> : <History />}
    </div>
  )
}

export default App
