import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout({ role, activePage, setActivePage, extra, children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar role={role} activePage={activePage} setActivePage={setActivePage} extra={extra} />
      <div className="flex-1 md:pl-72">
        <TopBar />
        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px] space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}