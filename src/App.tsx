import { useState } from 'react'
import { useSession } from './hooks/useSession'
import { Login } from './components/Login'
import { DailyCaptureForm } from './components/capture/DailyCaptureForm'
import { History } from './components/history/History'
import { HabitosConfig } from './components/habitos/HabitosConfig'
import { AppShell } from './components/layout/AppShell'
import type { View } from './components/layout/Sidebar'
import { supabase } from './lib/supabase'

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
    <AppShell view={view} onSelect={selectTab} userEmail={session.user.email ?? ''} onSignOut={() => supabase.auth.signOut()}>
      {view === 'captura' && (
        <DailyCaptureForm logDate={editDate ?? undefined} onDone={() => selectTab('painel')} />
      )}
      {view === 'painel' && <History onEditDay={editDay} />}
      {view === 'habitos' && <HabitosConfig />}
    </AppShell>
  )
}

export default App
