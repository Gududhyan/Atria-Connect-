import { handler, readJson } from '@/lib/route-helpers'
import { updateDues } from '@/lib/data/students'

export const PUT = handler(
  ['admin', 'account'],
  async ({ request, params, user }) => updateDues(params.usn, await readJson(request), user),
  { revalidate: true }
)
