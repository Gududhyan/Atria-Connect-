import { getServerUser } from '@/lib/session'
import { listStudents } from '@/lib/data/students'
import { parseFilters, toQuery } from '@/lib/filters'
import CCDashboardClient from '@/components/dashboards/CCDashboardClient'

export const dynamic = 'force-dynamic'

export default async function CCPage({ searchParams }) {
  const user = await getServerUser()
  const filters = parseFilters(await searchParams)
  const students = await listStudents(toQuery(filters), user)

  return <CCDashboardClient students={students} sem={filters.sem} branch={filters.branch} section={filters.section} />
}
