import { useContext } from 'react'
import { useApp } from '../context/AppContext'
import { LOGO_URL } from '../utils/helpers'
import { SidebarCtx } from './DashboardLayout'

/* ─── Role Config ─────────────────────────────────────────────────── */
const ROLE_META = {
  admin:   { label: 'Administrator',     color: '#F97316', glow: 'rgba(249,115,22,0.3)',  bg: 'rgba(249,115,22,0.12)' },
  account: { label: 'Accounts',          color: '#10B981', glow: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.12)' },
  cc:      { label: 'Class Coordinator', color: '#FBBF24', glow: 'rgba(251,191,36,0.3)',  bg: 'rgba(251,191,36,0.12)' },
  faculty: { label: 'Faculty',           color: '#38BDF8', glow: 'rgba(56,189,248,0.3)',  bg: 'rgba(56,189,248,0.12)' },
  student: { label: 'Student',           color: '#A78BFA', glow: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.12)' },
}

const MENU = {
  admin:   [
    { id: 'faculty',   icon: 'fa-chalkboard-user',   label: 'Faculty Assignment' },
    { id: 'approval',  icon: 'fa-stamp',             label: 'Hall Ticket Approval' },
    { id: 'bulk',      icon: 'fa-cloud-arrow-up',    label: 'Bulk Upload' },
  ],
  account: [
    { id: 'dues',      icon: 'fa-indian-rupee-sign', label: 'Manage Dues' },
    { id: 'bulk-dues', icon: 'fa-cloud-arrow-up',    label: 'Bulk Upload Dues' },
  ],
  cc:      [{ id: 'review',    icon: 'fa-clipboard-check', label: 'Review & Approve'   }],
  faculty: [{ id: 'clearance', icon: 'fa-check-double',    label: 'Subject Clearance'  }],
  student: [{ id: 'status',    icon: 'fa-file-lines',      label: 'My No Due Status'   }],
}

/* ─── Sidebar Component ───────────────────────────────────────────── */
export default function Sidebar({ role, activePage, setActivePage, extra }) {
  const { logoutUser } = useApp()
  const { collapsed, setCollapsed } = useContext(SidebarCtx)
  const items = MENU[role] || []
  const meta  = ROLE_META[role] || { label: role, color: '#94A3B8', glow: 'rgba(148,163,184,0.2)', bg: 'rgba(148,163,184,0.1)' }

  /* Shared glass style for the panel */
  const panelStyle = {
    width: collapsed ? '70px' : '256px',
    background: 'linear-gradient(160deg, rgba(17,24,39,0.92) 0%, rgba(15,23,42,0.95) 100%)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '6px 0 40px rgba(0,0,0,0.3)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  }

  const divider = { borderBottom: '1px solid rgba(255,255,255,0.06)' }

  return (
    <aside id="sidebar"
      className="fixed inset-y-0 left-0 z-50 flex flex-col no-print select-none"
      style={panelStyle}>

      {/* ── TOP: Logo (click = toggle) ───────────────────────────────── */}
      <div
        className="flex items-center cursor-pointer"
        style={{ ...divider, padding: collapsed ? '14px 0' : '14px 16px', justifyContent: collapsed ? 'center' : 'flex-start', gap: '12px', minHeight: '64px' }}
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>

        {/* Logo icon — always visible */}
        <div className="relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 16px ${meta.glow}` }}>
          <img src={LOGO_URL} alt="Atria" className="w-full h-full object-cover" />
          {/* Collapse arrow overlay shown on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '10px' }}>
            <i className={`fas text-white text-[10px] ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
          </div>
        </div>

        {/* Brand name — only when expanded */}
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">Atria Connect</p>
            <p className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.2em] mt-0.5">No Due Portal</p>
          </div>
        )}
      </div>

      {/* ── ROLE BADGE ──────────────────────────────────────────────── */}
      <div className="px-3 py-3" style={divider}>
        {collapsed ? (
          /* Collapsed: just a glowing dot */
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full"
              style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }} />
          </div>
        ) : (
          /* Expanded: full chip */
          <div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: meta.bg, border: `1px solid ${meta.color}22` }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
              <span className="text-xs font-semibold truncate" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
            {extra && (
              <p className="text-[10px] text-white/30 font-medium mt-2 px-1 truncate">{extra}</p>
            )}
          </div>
        )}
      </div>

      {/* ── NAVIGATION ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-3 pb-2.5"
            style={{ color: 'rgba(255,255,255,0.2)' }}>Navigation</p>
        )}

        {items.map(item => {
          const active = activePage === item.id
          return (
            <button key={item.id}
              onClick={() => {
                setActivePage(item.id)
                document.getElementById('sidebar')?.classList.remove('open')
              }}
              title={collapsed ? item.label : ''}
              className="w-full flex items-center rounded-xl transition-all duration-200"
              style={{
                padding: collapsed ? '9px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '10px',
                background: active
                  ? `linear-gradient(135deg, ${meta.color}30, ${meta.color}18)`
                  : 'transparent',
                border: active ? `1px solid ${meta.color}35` : '1px solid transparent',
                boxShadow: active ? `0 2px 16px ${meta.glow}` : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>

              {/* Icon pill */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: active ? `${meta.color}28` : 'rgba(255,255,255,0.05)',
                  boxShadow: active ? `0 0 12px ${meta.glow}` : 'none',
                }}>
                <i className={`fas ${item.icon} text-xs`}
                  style={{ color: active ? meta.color : 'rgba(255,255,255,0.38)' }} />
              </div>

              {/* Label */}
              {!collapsed && (
                <span className="text-sm font-medium leading-none truncate"
                  style={{ color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)' }}>
                  {item.label}
                </span>
              )}

              {/* Active accent bar */}
              {active && !collapsed && (
                <div className="ml-auto w-1 h-5 rounded-full flex-shrink-0"
                  style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── SIGN OUT ────────────────────────────────────────────────── */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={logoutUser}
          title={collapsed ? 'Sign Out' : ''}
          className="w-full flex items-center rounded-xl transition-all duration-200"
          style={{
            padding: collapsed ? '9px 0' : '9px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
          }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            <i className="fas fa-arrow-right-from-bracket text-xs text-red-400" />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium text-white/40">Sign Out</span>
          )}
        </button>
      </div>

    </aside>
  )
}