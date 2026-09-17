import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/session'
import DashboardLayout from '@/components/DashboardLayout'

export default async function ProtectedLayout({ children }) {
  const user = await getServerUser()
  if (!user) redirect('/login')

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
