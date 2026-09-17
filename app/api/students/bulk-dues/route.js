import { handler, readJson } from '@/lib/route-helpers'
import { bulkDuesUpdate } from '@/lib/data/students'

export const maxDuration = 60

export const POST = handler(
  ['admin', 'account'],
  async ({ request }) => {
    const { dues } = await readJson(request)
    return bulkDuesUpdate(dues)
  },
  { revalidate: true }
)
