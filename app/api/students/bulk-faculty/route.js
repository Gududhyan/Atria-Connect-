import { handler, readJson } from '@/lib/route-helpers'
import { bulkFacultyMapping } from '@/lib/data/students'

export const maxDuration = 60

export const POST = handler(
  ['admin'],
  async ({ request }) => {
    const { mappings } = await readJson(request)
    return bulkFacultyMapping(mappings)
  },
  { revalidate: true }
)
