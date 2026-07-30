import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { Login } from './components/Login'
import { AppShell } from './components/layout/AppShell'
import { HojePage } from './pages/HojePage'
import { AcademiaPage } from './pages/AcademiaPage'
import { TrabalhoPage } from './pages/TrabalhoPage'
import { EstudosPage } from './pages/EstudosPage'
import { FinancasPage } from './pages/FinancasPage'
import { HabitosPage } from './pages/HabitosPage'
import { PainelPage } from './pages/PainelPage'
import { supabase } from './lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <Login />

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<AppShell userEmail={session.user.email ?? ''} onSignOut={() => supabase.auth.signOut()} />}
        >
          <Route index element={<Navigate to="/hoje" replace />} />
          <Route path="hoje" element={<HojePage />} />
          <Route path="academia" element={<AcademiaPage />} />
          <Route path="trabalho" element={<TrabalhoPage />} />
          <Route path="estudos" element={<EstudosPage />} />
          <Route path="financas" element={<FinancasPage />} />
          <Route path="habitos" element={<HabitosPage />} />
          <Route path="painel" element={<PainelPage />} />
          <Route path="*" element={<Navigate to="/hoje" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
