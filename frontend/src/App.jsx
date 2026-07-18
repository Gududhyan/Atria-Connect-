import { AppProvider, useApp } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AccountDashboard from './pages/account/AccountDashboard'
import CCDashboard from './pages/cc/CCDashboard'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import StudentDashboard from './pages/student/StudentDashboard'

function AppContent() {
  const { state } = useApp()

  if (state.initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 text-sm font-medium">Checking authentication...</div>
      </div>
    )
  }

  if (!state.currentUser) return <LoginPage />

  switch (state.currentUser.role) {
    case 'admin': return <AdminDashboard />
    case 'account': return <AccountDashboard />
    case 'cc': return <CCDashboard />
    case 'faculty': return <FacultyDashboard />
    case 'student': return <StudentDashboard />
    default: return <LoginPage />
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App