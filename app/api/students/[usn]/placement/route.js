import { handler, readJson } from '@/lib/route-helpers'
import { updatePlacement } from '@/lib/data/students'

export const PUT = handler(
  ['admin', 'account'],
  async ({ request, params }) => {
    const { placement } = await readJson(request)
    return updatePlacement(params.usn, placement)
  },
  { revalidate: true }
)
