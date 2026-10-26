import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { connectDB } from './db'
import { COOKIE_NAME, verifyToken } from './auth'
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

  const conn = await connectDB().catch(() => null)
  let user
  if (!conn) {
    user = getLocalUserById(payload.userId)
  } else {
    user = await User.findById(payload.userId).populate('student').lean().catch(() => null)
    if (!user) {
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

export async function requireUser(roles) {
  const user = await getServerUser()
  if (!user) return { user: null, error: { status: 401, message: 'Authentication required' } }
  if (roles && !roles.includes(user.role)) {
    return { user, error: { status: 403, message: 'Access denied' } }
  }
  return { user, error: null }
}
