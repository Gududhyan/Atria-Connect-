import { handler, readJson } from '@/lib/route-helpers'
import { getStudentByUsn, updateStudent } from '@/lib/data/students'

export const dynamic = 'force-dynamic'

export const GET = handler(null, ({ user, params }) => getStudentByUsn(params.usn, user))

export const PATCH = handler(
  ['admin'],
  async ({ request, params, user }) => {
    const data = await readJson(request)
    return updateStudent(params.usn, data, user)
  },
  { revalidate: true }
)
