import { getServerUser } from '@/lib/session'
import { listStudents, getStudentStats } from '@/lib/data/students'
import { parseFilters, toQuery } from '@/lib/filters'
import BulkUploadClient from '@/components/dashboards/BulkUploadClient'

export const dynamic = 'force-dynamic'

export default async function BulkUploadPage({ searchParams }) {
  const user = await getServerUser()
  const filters = parseFilters(await searchParams)

  // Counts come from an aggregate so the page never loads all 900+ records.
  const [students, stats] = await Promise.all([
    listStudents(toQuery(filters), user),
    getStudentStats()
  ])

  return <BulkUploadClient students={students} stats={stats} sem={filters.sem} branch={filters.branch} section={filters.section} search={filters.search} />
}
