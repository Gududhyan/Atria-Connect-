import { getServerUser } from '@/lib/session'
import { listStudents } from '@/lib/data/students'
import { parseFilters, toQuery } from '@/lib/filters'
import ManageDuesClient from '@/components/dashboards/ManageDuesClient'

export const dynamic = 'force-dynamic'

export default async function ManageDuesPage({ searchParams }) {
  const user = await getServerUser()
  const filters = parseFilters(await searchParams)
  const students = await listStudents(toQuery(filters), user)

  return <ManageDuesClient students={students} sem={filters.sem} branch={filters.branch} section={filters.section} />
}
