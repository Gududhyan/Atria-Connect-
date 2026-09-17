import { handler } from '@/lib/route-helpers'
import { getStudentByUsn } from '@/lib/data/students'

export const dynamic = 'force-dynamic'

export const GET = handler(null, ({ user, params }) => getStudentByUsn(params.usn, user))
