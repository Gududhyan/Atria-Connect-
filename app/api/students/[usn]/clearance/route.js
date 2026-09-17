import { handler, readJson } from '@/lib/route-helpers'
import { updateClearance } from '@/lib/data/students'

export const PUT = handler(
  ['faculty', 'admin'],
  async ({ request, params }) => {
    const { subjects } = await readJson(request)
    return updateClearance(params.usn, subjects)
  },
  { revalidate: true }
)
