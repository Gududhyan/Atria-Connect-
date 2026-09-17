'use client'

import { useState } from 'react'
import { ROLE_META } from '@/lib/nav'
import ProfileModal from './ProfileModal'

export default function TopBar({ user, pageTitle, pageSubtitle, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const rc = ROLE_META[user?.role] || { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: user?.role || '' }

  return (
    <header
      className="no-print sticky top-0 z-30"
      style={{
        background: 'rgba(244,246,250,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(15,23,42,0.07)',
        boxShadow: '0 1px 16px rgba(15,23,42,0.06)'
      }}>
      <div className="flex items-center justify-between px-5" style={{ height: '58px' }}>
        <div className="flex items-center gap-4">
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: 'rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.08)' }}
            onClick={() => document.getElementById('sidebar')?.classList.toggle('open')}>
            <i className="fas fa-bars text-slate-600 text-sm" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full hidden sm:block" style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
              <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">{pageTitle || 'Dashboard'}</h1>
            </div>
            {pageSubtitle && <p className="text-xs text-slate-400 mt-0.5 ml-4 hidden sm:block">{pageSubtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'student' && (
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-xl text-xs font-semibold text-slate-600 transition-all"
              style={{ background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.08)' }}>
              <i className="fas fa-print text-slate-400 text-xs" />
              Print
            </button>
          )}

          <div className="w-px h-7 mx-1 bg-slate-200" />

          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl transition-all"
                style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.06)' }}>
                <div className="relative flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${rc.color}dd, ${rc.color}99)` }}>
                    {(user.name || user.username || user.usn || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white bg-emerald-400" />
                </div>

                <div className="hidden sm:block leading-none">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {user.name || user.username || user.usn}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full" style={{ background: rc.color }} />
                    <span className="text-[10px] font-semibold" style={{ color: rc.color }}>{rc.label}</span>
                  </div>
                </div>
                <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden fade-in">
                    <button
                      onClick={() => { setProfileOpen(true); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <i className="fas fa-user text-slate-400 text-xs w-4" />
                      View Profile
                    </button>
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
                      <i className="fas fa-arrow-right-from-bracket text-xs w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} />}
    </header>
  )
}
