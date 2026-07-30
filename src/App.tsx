import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { Login } from './components/Login'
import { AppShell } from './components/layout/AppShell'
import { HojePage } from './pages/HojePage'
import { AcademiaHojePage } from './pages/academia/AcademiaHojePage'
import { AcademiaTiposPage } from './pages/academia/AcademiaTiposPage'
import { AcademiaProgressoPage } from './pages/academia/AcademiaProgressoPage'
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
          <Route path="academia">
            <Route index element={<Navigate to="/academia/hoje" replace />} />
            <Route path="hoje" element={<AcademiaHojePage />} />
            <Route path="tipos" element={<AcademiaTiposPage />} />
            <Route path="progresso" element={<AcademiaProgressoPage />} />
          </Route>
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
