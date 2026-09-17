import { handler, readJson } from '@/lib/route-helpers'
import { updateDues } from '@/lib/data/students'

export const PUT = handler(
  ['admin', 'account'],
  async ({ request, params }) => updateDues(params.usn, await readJson(request)),
  { revalidate: true }
)
