import { handler, readJson } from '@/lib/route-helpers'
import { updateClearance } from '@/lib/data/students'

export const PUT = handler(
  ['faculty', 'admin'],
  async ({ request, user, params }) => {
    const { subjects } = await readJson(request)
    // Faculty are restricted to their own subjects inside updateClearance, using
    // the stored assignments rather than anything the client sends.
    return updateClearance(params.usn, subjects, user)
  },
  { revalidate: true }
)
