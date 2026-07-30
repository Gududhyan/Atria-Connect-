import { useContext } from 'react'
import { useApp } from '../context/AppContext'
import { SidebarCtx } from './DashboardLayout'

const ROLE_COLORS = {
  admin:   { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  label: 'Administrator'     },
  account: { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: 'Accounts'          },
  cc:      { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  label: 'Class Coordinator' },
  faculty: { color: '#38BDF8', bg: 'rgba(56,189,248,0.12)',  label: 'Faculty'           },
  student: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', label: 'Student'           },
}

export default function TopBar({ pageTitle, pageSubtitle }) {
  const { state } = useApp()
  const user = state?.currentUser
  const rc = ROLE_COLORS[user?.role] || { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: user?.role || '' }

  return (
    <header className="no-print sticky top-0 z-30"
      style={{
        background: 'rgba(244,246,250,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(15,23,42,0.07)',
        boxShadow: '0 1px 16px rgba(15,23,42,0.06)',
      }}>
      <div className="flex items-center justify-between px-5" style={{ height: '58px' }}>

        {/* ── LEFT: Mobile menu + Breadcrumb ──────────────── */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: 'rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.08)' }}
            onClick={() => document.getElementById('sidebar')?.classList.toggle('open')}>
            <i className="fas fa-bars text-slate-600 text-sm" />
          </button>

          {/* Page breadcrumb */}
          <div>
            <div className="flex items-center gap-2">
              {/* Section dot */}
              <div className="w-2 h-2 rounded-full hidden sm:block"
                style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
              <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">
                {pageTitle || 'Dashboard'}
              </h1>
            </div>
            {pageSubtitle && (
              <p className="text-xs text-slate-400 mt-0.5 ml-4 hidden sm:block">{pageSubtitle}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Actions + User chip ──────────────────── */}
        <div className="flex items-center gap-2">

          {/* Print button (student only) */}
          {user?.role === 'student' && (
            <button onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-xl text-xs font-semibold text-slate-600 transition-all"
              style={{ background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.05)'}>
              <i className="fas fa-print text-slate-400 text-xs" />
              Print
            </button>
          )}

          {/* Notifications bell (decorative) */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.08)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.05)'}>
            <i className="fas fa-bell text-slate-500 text-xs" />
            {/* Badge dot */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          {/* Divider */}
          <div className="w-px h-7 mx-1 bg-slate-200" />

          {/* User identity chip */}
          {user && (
            <div className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl transition-all cursor-default"
              style={{ background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.06)' }}>
              {/* Avatar with role color ring */}
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${rc.color}dd, ${rc.color}99)` }}>
                  {(user.name || user.username || user.usn || '?').charAt(0).toUpperCase()}
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              {/* Name + role */}
              <div className="hidden sm:block leading-none">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                  {user.name || user.username || user.usn}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full"
                    style={{ background: rc.color }} />
                  <span className="text-[10px] font-semibold" style={{ color: rc.color }}>
                    {rc.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}