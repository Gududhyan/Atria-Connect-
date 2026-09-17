import { handler, readJson } from '@/lib/route-helpers'
import { updateFaculty } from '@/lib/data/students'

export const PUT = handler(
  ['admin'],
  async ({ request, params }) => {
    const { subjectCode, faculty } = await readJson(request)
    return updateFaculty(params.usn, subjectCode, faculty)
  },
  { revalidate: true }
)
