import Button from './ui/Button'
import { LOGO_URL } from '../utils/helpers'

const T = {
  '/student/dashboard':['Dashboard','Overview'],
  '/student/clearances':['My Clearances','Subject & dues status'],
  '/faculty/dashboard':['Dashboard','Overview'],
  '/faculty/clearance':['Subject Clearance','Update clearance'],
  '/admin/dashboard':['Dashboard','Overview'],
  '/admin/assign':['Faculty Assignment','Assign subjects'],
  '/admin/approval':['Hall Ticket Approval','Final approval'],
  '/account/dashboard':['Dashboard','Overview'],
  '/account/dues':['Manage Dues','Set dues'],
  '/cc/dashboard':['Dashboard','Overview'],
  '/cc/decision':['Hall Ticket Decision','Accept or reject'],
}

export default function TopBar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const [title, subtitle] = T[pathname] || ['Dashboard', 'Overview']
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-200/30">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            onClick={() => document.getElementById('sidebar')?.classList.toggle('open')}>
            <i className="fas fa-bars text-sm"></i>
          </button>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {pathname.startsWith('/student') && (
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <i className="fas fa-print text-xs" /> Print
            </Button>
          )}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <img src={LOGO_URL} alt="Atria" className="h-4 w-4 rounded-sm object-cover" />
            Atria Institute of Technology
          </div>
        </div>
      </div>
    </header>
  )
}