import { getServerUser } from '@/lib/session'
import { listStudents } from '@/lib/data/students'
import { parseFilters, toQuery } from '@/lib/filters'
import FacultyAssignmentClient from '@/components/dashboards/FacultyAssignmentClient'

export const dynamic = 'force-dynamic'

export default async function FacultyAssignmentPage({ searchParams }) {
  const user = await getServerUser()
  const filters = parseFilters(await searchParams)
  const students = await listStudents(toQuery(filters), user)

  return <FacultyAssignmentClient students={students} sem={filters.sem} branch={filters.branch} section={filters.section} search={filters.search} />
}
