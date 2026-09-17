import { handler, readJson } from '@/lib/route-helpers'
import { updateAdminApproval } from '@/lib/data/students'

export const PUT = handler(
  ['admin'],
  async ({ request, params }) => {
    const { approval } = await readJson(request)
    return updateAdminApproval(params.usn, approval)
  },
  { revalidate: true }
)
