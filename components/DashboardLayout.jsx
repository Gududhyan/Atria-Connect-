'use client'

import { useState, createContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { findMenuItem } from '@/lib/nav'
import { logout } from '@/lib/api-client'

export const SidebarCtx = createContext({ collapsed: false, setCollapsed: () => {} })

export default function DashboardLayout({ user, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const meta = findMenuItem(user.role, pathname) || { title: 'Dashboard', sub: '' }
  const extra = user.role === 'student' ? `${user.usn} · Sem ${user.semester}` : user.name

  const handleSignOut = async () => {
    await logout().catch(() => {})
    router.replace('/login')
    router.refresh()
  }

  return (
    <SidebarCtx.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen text-slate-900" style={{ backgroundColor: '#EEF1F8' }}>
        <Sidebar role={user.role} extra={extra} onSignOut={handleSignOut} />

        <div
          className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
          style={{ paddingLeft: collapsed ? '72px' : '260px' }}>
          <TopBar user={user} pageTitle={meta.title} pageSubtitle={meta.sub} onSignOut={handleSignOut} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1400px] space-y-5 fade-in">{children}</div>
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
