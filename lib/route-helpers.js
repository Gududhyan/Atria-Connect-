import 'server-only'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireUser } from './session'

/**
 * Wraps a Route Handler with the auth/role check, param unwrapping and error
 * translation every endpoint needs, so each route file stays a one-liner.
 *
 * @param {string[]|null} roles  allowed roles, or null for "any signed-in user"
 * @param {Function} fn          ({ request, user, params, body }) => data
 * @param {{ revalidate?: boolean }} options
 */
export function handler(roles, fn, options = {}) {
  return async (request, context) => {
    try {
      const { user, error } = await requireUser(roles)
      if (error) {
        return NextResponse.json({ message: error.message }, { status: error.status })
      }

      const params = context?.params ? await context.params : {}
      const data = await fn({ request, user, params })

      if (options.revalidate) revalidatePath('/', 'layout')

      return NextResponse.json(data ?? { ok: true })
    } catch (err) {
      const status = err?.status || 500
      if (status >= 500) console.error('[api]', err)
      return NextResponse.json(
        { message: err?.message || 'Server error' },
        { status }
      )
    }
  }
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

// A student may only ever act on their own record; staff roles are unrestricted.
export function assertOwnUsn(user, usn) {
  if (user.role === 'student' && String(user.usn).toUpperCase() !== String(usn).toUpperCase()) {
    const error = new Error('Access denied')
    error.status = 403
    throw error
  }
}
