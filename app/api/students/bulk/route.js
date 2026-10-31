import { handler, readJson } from '@/lib/route-helpers'
import { createBulkStudents } from '@/lib/data/students'

export const maxDuration = 60

export const POST = handler(
  ['admin'],
  async ({ request }) => {
    const { students } = await readJson(request)
    return createBulkStudents(students)
  },
  { revalidate: true }
)
