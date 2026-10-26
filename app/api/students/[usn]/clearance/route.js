import { handler, readJson } from '@/lib/route-helpers'
import { updateClearance } from '@/lib/data/students'

export const PUT = handler(
  ['faculty', 'admin'],
  async ({ request, user, params }) => {
    const { subjects } = await readJson(request)

    // Non-admin faculty may only update subjects assigned to them.
    let filtered = subjects
    if (user.role === 'faculty') {
      filtered = subjects.filter((s) => !s.faculty || s.faculty === user.name)
      if (filtered.length === 0) {
        const error = new Error('No subjects assigned to you were found in this request')
        error.status = 403
        throw error
      }
    }

    return updateClearance(params.usn, filtered, user)
  },
  { revalidate: true }
)
