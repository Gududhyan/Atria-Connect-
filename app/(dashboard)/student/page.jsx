import { getServerUser } from '@/lib/session'
import { getStudentByUsn } from '@/lib/data/students'
import StudentDashboardClient from '@/components/dashboards/StudentDashboardClient'

// Per-user data that changes on every approval, so never statically rendered.
export const dynamic = 'force-dynamic'

export default async function StudentPage() {
  const user = await getServerUser()

  let student = null
  try {
    student = await getStudentByUsn(user.usn, user)
  } catch {
    student = null
  }

  if (!student) {
    return (
      <div className="card p-10 text-center">
        <i className="fas fa-user-slash text-3xl text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-600">No student record found for {user.usn}</p>
        <p className="text-xs text-slate-400 mt-1">Please contact the administration office.</p>
      </div>
    )
  }

  return <StudentDashboardClient student={student} />
}
