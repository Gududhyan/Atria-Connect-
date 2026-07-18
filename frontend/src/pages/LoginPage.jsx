import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Card from '../components/Card'
import { LOGO_URL } from '../utils/helpers'

const ROLES = [
  { id: 'admin', label: 'Administrator', icon: 'fa-user-shield', desc: 'Assign faculties & approve', color: 'from-atria to-atria-dark' },
  { id: 'account', label: 'Accounts', icon: 'fa-indian-rupee-sign', desc: 'Manage fees & dues', color: 'from-emerald-500 to-emerald-700' },
  { id: 'cc', label: 'Class Coordinator', icon: 'fa-clipboard-check', desc: 'Review & approve', color: 'from-amber-500 to-amber-700' },
  { id: 'faculty', label: 'Faculty', icon: 'fa-chalkboard-user', desc: 'Subject clearance', color: 'from-sky-500 to-sky-700' },
  { id: 'student', label: 'Student', icon: 'fa-graduation-cap', desc: 'View no due status', color: 'from-violet-500 to-violet-700' }
]

export default function LoginPage() {
  const { loginUser } = useApp()
  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const [usn, setUsn] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!role) { setError('Please select a role'); return }
    
    if (role === 'student') {
      if (!usn.trim()) { setError('Please enter your USN'); return }
      if (!password.trim()) { setError('Please enter your password'); return }
    } else {
      if (!username.trim()) { setError('Please enter your username'); return }
      if (!password.trim()) { setError('Please enter your password'); return }
    }

    setLoading(true)
    try {
      if (role === 'student') {
        await loginUser({ role, usn: usn.toUpperCase(), password })
      } else {
        await loginUser({ role, username, password })
      }
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(208,38,145,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_20%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_52%,_#f9f1f8_100%)]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-300 via-fuchsia-200 to-transparent opacity-70 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-300 via-cyan-200 to-transparent opacity-75 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="text-center mb-10 fade-in">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-card overflow-hidden">
            <img src={LOGO_URL} alt="Atria logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="font-heading text-5xl font-semibold text-slate-900 tracking-tight uppercase">ATRIA NO DUE</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 leading-7">
            A polished clearance portal for institute staff and students. Sign in to manage dues, approvals, assignments, and no-due status with ease.
          </p>
        </div>
        <Card className="w-full max-w-xl mx-auto overflow-hidden fade-in rounded-[2rem] border border-white/40 bg-white/70 backdrop-blur-xl shadow-card shadow-slate-200/30">
          <div className="p-6 pb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {ROLES.map(r => (
                <button key={r.id} onClick={() => { setRole(r.id); setError('') }}
                  className={`flex min-h-[108px] flex-col items-center justify-between rounded-2xl border-2 px-3 py-4 text-center transition-all ${
                    role === r.id ? 'border-atria bg-atria-pale shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center mb-2 shadow-sm`}>
                    <i className={`fas ${r.icon} text-white text-sm`}></i>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="px-6 pb-6">
            {role === 'student' && (
              <div className="space-y-3 fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">USN Number</label>
                  <input type="text" value={usn} onChange={e => setUsn(e.target.value.toUpperCase())} onKeyPress={handleKeyPress} placeholder="e.g. 1AT23CG001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium tracking-wider placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-300" />
                  <p className="text-[11px] text-slate-400 mt-1"><i className="fas fa-info-circle mr-1"></i>Default password is your USN</p>
                </div>
              </div>
            )}
            {role && role !== 'student' && (
              <div className="space-y-3 fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter your username"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-300" />
                </div>
              </div>
            )}
            {role && (
              <Button onClick={handleLogin} className="w-full mt-4" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            )}
            {error && (
              <div className="mt-3 p-3 bg-no-light border border-no/20 rounded-lg flex items-center gap-2 fade-in">
                <i className="fas fa-circle-exclamation text-no text-xs"></i>
                <p className="text-sm text-no font-medium">{error}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      <footer className="relative z-10 text-center py-4">
        <p className="text-xs text-slate-400">Atria Institute of Technology © 2025 — No Due Portal</p>
      </footer>
    </div>
  )
}