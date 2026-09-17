import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/session'
import { ROLE_HOME } from '@/lib/auth'

// Middleware normally handles this; kept as a fallback for direct hits.
export default async function Home() {
  const user = await getServerUser()
  redirect(user ? ROLE_HOME[user.role] || '/login' : '/login')
}
