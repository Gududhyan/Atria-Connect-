import { handler, readJson } from '@/lib/route-helpers'
import { assignSectionFaculty } from '@/lib/data/students'

export const maxDuration = 60

export const POST = handler(
  ['admin'],
  async ({ request, user }) => {
    const { semester, branchCode, section, assignments } = await readJson(request)
    return assignSectionFaculty({ semester, branchCode, section, assignments }, user)
  },
  { revalidate: true }
)
