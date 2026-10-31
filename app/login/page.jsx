'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api-client'
import { LOGO_URL } from '@/lib/constants'
import { ROLE_HOME } from '@/lib/auth'

const ROLES = [
  { id: 'admin', label: 'Administrator', icon: 'fa-user-shield', color: '#C41E3A', bg: '#FEF1F3' },
  { id: 'account', label: 'Accounts', icon: 'fa-coins', color: '#16A34A', bg: '#F0FDF4' },
  { id: 'cc', label: 'Class Coordinator', icon: 'fa-clipboard-check', color: '#D97706', bg: '#FFFBEB' },
  { id: 'faculty', label: 'Faculty', icon: 'fa-chalkboard-user', color: '#0284C7', bg: '#F0F9FF' },
  { id: 'student', label: 'Student', icon: 'fa-graduation-cap', color: '#7C3AED', bg: '#F5F3FF' }
]

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const [usn, setUsn] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!role) { setError('Please select a role first'); return }
    if (role === 'student') {
      if (!usn.trim()) { setError('Please enter your USN'); return }
    } else if (!username.trim()) {
      setError('Please enter your username'); return
    }
    if (!password.trim()) { setError('Please enter your password'); return }

    setLoading(true)
    try {
      await login(role === 'student'
        ? { role, usn: usn.toUpperCase(), password }
        : { role, username, password })

      router.replace(ROLE_HOME[role] || '/')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter' && !loading) handleLogin() }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-atria/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-violet-500/5" />
      </div>

      <div className="relative w-full max-w-[480px] fade-in">
        <div className="text-center mb-8">
          <div
            className="inline-flex w-16 h-16 rounded-2xl overflow-hidden border border-[#E8ECF2] bg-white mb-4"
            style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.08)' }}>
            <img src={LOGO_URL} alt="Atria" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Atria No Due Portal</h1>
          <p className="text-sm text-slate-500 mt-1.5">Sign in to manage hall ticket clearances</p>
        </div>

        <div className="card overflow-hidden" style={{ boxShadow: '0 4px 30px rgba(15,23,42,0.08)' }}>
          <div className="p-5 border-b border-[#E8ECF2]">
            <p className="text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Select Your Role</p>
            <div className="grid grid-cols-5 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setError('') }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${role === r.id ? 'border-current shadow-sm' : 'border-[#E8ECF2] hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  style={role === r.id ? { borderColor: r.color, background: r.bg } : {}}>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: role === r.id ? r.color : '#F1F5F9' }}>
                    <i className={`fas ${r.icon} text-xs`} style={{ color: role === r.id ? '#fff' : '#94A3B8' }} />
                  </div>
                  <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: role === r.id ? r.color : '#64748B' }}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {role && (
            <div className="p-5 space-y-4 fade-in">
              {role === 'student' ? (
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-1.5">USN Number</label>
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    onKeyDown={onKey}
                    placeholder="1AT23CG001"
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E8ECF2] rounded-xl text-sm font-mono font-semibold tracking-widest placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal" />
                </div>
              ) : (
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-slate-50 border border-[#E8ECF2] rounded-xl text-sm placeholder:text-slate-300" />
                </div>
              )}

              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-[#E8ECF2] rounded-xl text-sm placeholder:text-slate-300" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                  </button>
                </div>
                {role === 'student' && (
                  <p className="text-2xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <i className="fas fa-circle-info" /> Default password is your USN
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl fade-in">
                  <i className="fas fa-circle-exclamation text-red-500 text-xs flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-11 bg-atria text-white rounded-xl text-sm font-bold shadow-sm hover:bg-atria-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]">
                {loading
                  ? <><i className="fas fa-spinner fa-spin mr-2" />Signing in...</>
                  : <><i className="fas fa-arrow-right-to-bracket mr-2" />Sign In</>}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-2xs text-slate-400 mt-6">
          Atria Institute of Technology © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
