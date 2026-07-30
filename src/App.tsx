import { useSession } from './hooks/useSession'
import { Login } from './components/Login'
import { DailyLogForm } from './components/DailyLogForm'
import { supabase } from './lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <Login />

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <span className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          Sair
        </button>
      </header>
      <DailyLogForm />
    </div>
  )
}

export default App
