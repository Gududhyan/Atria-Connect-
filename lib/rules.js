// Approval rules shared by the server (Mongo + local store) and the dashboards,
// so the API never accepts a decision the UI would have refused.

// A due of null means "not applicable" (e.g. not a hostel resident), not "unknown".
export const hasDue = (value) => Number(value) > 0

export const hasAnyDue = (student) =>
  hasDue(student.hostelDue) || hasDue(student.libraryDue) || hasDue(student.feesDue)

export const allSubjectsCleared = (student) =>
  (student.subjects || []).every((sub) => sub.clearance === 'yes')

// Ready for the Class Coordinator's batch sign-off.
export const isReadyForCC = (student) => allSubjectsCleared(student) && !hasAnyDue(student)

// Returns why a hall ticket can't be issued yet, or null when it can.
export function hallTicketBlocker(student) {
  if (student.ccApproval !== 'approved') return 'Class Coordinator sign-off is pending'
  const pending = (student.subjects || []).filter((sub) => sub.clearance !== 'yes')
  if (pending.length) return `subject clearance pending for ${pending.map((sub) => sub.code).join(', ')}`
  if (hasAnyDue(student)) return 'student has outstanding dues'
  return null
}

// Issued only while the admin has approved AND every prerequisite still holds.
export const computeHallTicket = (student) =>
  student.adminApproval === 'approved' && hallTicketBlocker(student) === null
