import { useApp } from '../context/AppContext'
import { LOGO_URL } from '../utils/helpers'

const ROLE_LABELS = {
  admin: 'Administrator', account: 'Accounts',
  cc: 'Class Coordinator', faculty: 'Faculty', student: 'Student'
}

const MENU = {
  admin: [
    { id: 'faculty', icon: 'fa-chalkboard-user', label: 'Faculty Assignment' },
    { id: 'approval', icon: 'fa-stamp', label: 'Hall Ticket Approval' },
    { id: 'bulk', icon: 'fa-cloud-arrow-up', label: 'Bulk Upload & Mapping' }
  ],
  account: [
    { id: 'dues', icon: 'fa-indian-rupee-sign', label: 'Manage Dues' },
    { id: 'bulk-dues', icon: 'fa-cloud-arrow-up', label: 'Bulk Upload Dues' }
  ],
  cc: [{ id: 'review', icon: 'fa-clipboard-check', label: 'Review & Approve' }],
  faculty: [{ id: 'clearance', icon: 'fa-check-double', label: 'Subject Clearance' }],
  student: [{ id: 'status', icon: 'fa-file-lines', label: 'My No Due Status' }]
}

export default function Sidebar({ role, activePage, setActivePage, extra }) {
  const { logoutUser } = useApp()
  const items = MENU[role] || []

  return (
    <aside id="sidebar" className="fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-sm border-r border-slate-200 min-h-screen flex flex-col transition-transform duration-300 ease-in-out transform -translate-x-full md:translate-x-0 shadow-2xl no-print">
      <div className="p-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Atria logo" className="h-11 w-11 rounded-2xl object-cover border border-slate-200 bg-white" />
          <div>
            <p className="font-semibold text-slate-900 text-base">ATRIA</p>
            <p className="text-xs text-slate-500 uppercase tracking-[0.22em]">Hall Ticket Portal</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Logged in as</p>
        <p className="text-sm font-semibold text-slate-800">{ROLE_LABELS[role]}</p>
        {extra && <p className="text-xs text-slate-500 mt-1 truncate">{extra}</p>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2">
        {items.map(item => (
          <button key={item.id} onClick={() => {
            setActivePage(item.id)
            const sidebar = document.getElementById('sidebar')
            if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open')
          }}
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
              activePage === item.id ? 'bg-atria text-white shadow-card' : 'text-slate-700 hover:bg-slate-50'
            }`}>
            <i className={`fas ${item.icon} w-5 text-center text-xs`}></i>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-slate-100">
        <button onClick={logoutUser}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
          <i className="fas fa-right-from-bracket w-5 text-center text-xs"></i>
          Logout
        </button>
      </div>
    </aside>
  )
}