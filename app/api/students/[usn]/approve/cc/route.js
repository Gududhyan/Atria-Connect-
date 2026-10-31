import { handler, readJson } from '@/lib/route-helpers'
import { updateCCApproval } from '@/lib/data/students'

export const PUT = handler(
  ['cc', 'admin'],
  async ({ request, params, user }) => {
    const { approval, remarks } = await readJson(request)
    return updateCCApproval(params.usn, approval, remarks, user)
  },
  { revalidate: true }
)
