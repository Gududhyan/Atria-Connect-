import { getServerUser } from '@/lib/session'
import { listStudents } from '@/lib/data/students'
import { parseFilters, toQuery } from '@/lib/filters'
import AdminApprovalClient from '@/components/dashboards/AdminApprovalClient'

export const dynamic = 'force-dynamic'

export default async function AdminApprovalPage({ searchParams }) {
  const user = await getServerUser()
  const filters = parseFilters(await searchParams)
  const students = await listStudents(toQuery(filters), user)

  return <AdminApprovalClient students={students} sem={filters.sem} branch={filters.branch} section={filters.section} />
}
