import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connectOrLocal, isLocalDataAllowed } from './db'
import { COOKIE_NAME, ROLE_HOME, verifyToken } from './auth'
import { getLocalUserById } from './local-store'
import User from '@/models/User'
import '@/models/Student'

// Resolves the signed-in user for Server Components and Route Handlers.
// Returns a plain object (safe to pass into Client Components) or null.
// cache() dedupes this across the layout and page of a single request.
export const getServerUser = cache(async () => {
  const store = await cookies()
  const payload = await verifyToken(store.get(COOKIE_NAME)?.value)
  if (!payload?.userId) return null

  const conn = await connectOrLocal()
  let user
  if (!conn) {
    user = getLocalUserById(payload.userId)
  } else {
    user = await User.findById(payload.userId).populate('student').lean().catch(() => null)
    // Tokens minted while running on the local store only stay valid where that store is allowed.
    if (!user && isLocalDataAllowed()) {
      user = getLocalUserById(payload.userId)
    }
  }
  if (!user) return null

  return {
    id: String(user._id),
    role: user.role,
    name: user.name,
    username: user.username || null,
    usn: user.usn || null,
    branchCode: user.student?.branchCode || null,
    section: user.student?.section || null,
    semester: user.student?.semester || null
  }
})

// Page-level guard for each role's section. Middleware already redirects on the
// JWT's role; this re-checks against the stored user as defence in depth.
export async function requirePageRole(role) {
  const user = await getServerUser()
  if (!user) redirect('/login')
  if (user.role !== role) redirect(ROLE_HOME[user.role] || '/login')
  return user
}

export async function requireUser(roles) {
  const user = await getServerUser()
  if (!user) return { user: null, error: { status: 401, message: 'Authentication required' } }
  if (roles && !roles.includes(user.role)) {
    return { user, error: { status: 403, message: 'Access denied' } }
  }
  return { user, error: null }
}
