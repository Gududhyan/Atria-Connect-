import { useState, createContext, useContext } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export const SidebarCtx = createContext({ collapsed: false, setCollapsed: () => {} })

const PAGE_META = {
  status:    { title: 'No Due Status',      sub: 'Clearance, dues & approval overview' },
  clearance: { title: 'Subject Clearance',  sub: 'Update clearances for your assigned subjects' },
  faculty:   { title: 'Faculty Assignment', sub: 'Assign subjects to faculty members' },
  approval:  { title: 'Hall Ticket Approval', sub: 'Issue hall tickets to cleared students' },
  bulk:      { title: 'Bulk Upload',        sub: 'Upload student data or subject mappings' },
  dues:      { title: 'Manage Dues',        sub: 'Set hostel, library and fee dues per student' },
  'bulk-dues': { title: 'Bulk Upload Dues', sub: 'Upload dues data via CSV' },
  review:    { title: 'Review & Approve',   sub: 'Sign off on student hall tickets' },
}

export default function DashboardLayout({ role, activePage, setActivePage, extra, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const meta = PAGE_META[activePage] || { title: 'Dashboard', sub: '' }

  return (
    <SidebarCtx.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen text-slate-900" style={{ backgroundColor: '#EEF1F8' }}>
        <Sidebar role={role} activePage={activePage} setActivePage={setActivePage} extra={extra} />
        {/* Main shifts based on sidebar width */}
        <div
          className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
          style={{ paddingLeft: collapsed ? '72px' : '260px' }}>
          <TopBar pageTitle={meta.title} pageSubtitle={meta.sub} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1400px] space-y-5 fade-in">
              {children}
            </div>
          </main>
          <footer className="no-print px-6 py-3 text-center border-t border-[#E8ECF2]">
            <p className="text-2xs text-slate-400">
              Atria Institute of Technology · No Due Portal · {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    </SidebarCtx.Provider>
  )
}