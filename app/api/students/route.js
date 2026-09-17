import { handler } from '@/lib/route-helpers'
import { listStudents } from '@/lib/data/students'

export const dynamic = 'force-dynamic'

export const GET = handler(null, async ({ request, user }) => {
  const { searchParams } = new URL(request.url)
  return listStudents(
    {
      semester: searchParams.get('semester'),
      branchCode: searchParams.get('branchCode'),
      section: searchParams.get('section')
    },
    user
  )
})
