import 'server-only'
import bcrypt from 'bcryptjs'
import { connectDB } from '../db'
import { getSubjects, FACULTY_POOL } from '../constants'
import Student from '@/models/Student'
import User from '@/models/User'
import {
  listLocalStudents,
  getLocalStudentByUsn,
  updateLocalDues,
  updateLocalPlacement,
  updateLocalClearance,
  updateLocalFaculty,
  updateLocalStudent,
  updateLocalCCApproval,
  updateLocalAdminApproval,
  addLocalDocument,
  reviewLocalDocument,
  removeLocalDocument,
  createLocalBulkStudents,
  assignLocalBulkFaculty,
  updateLocalBulkDues,
  assignLocalSectionFaculty
} from '@/lib/local-store'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Mongoose documents carry ObjectIds/Dates that can't cross the server/client
// boundary, so everything handed to a component goes through this first.
function serialize(value) {
  return JSON.parse(JSON.stringify(value))
}

function parseDue(value, fieldName) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  if (Number.isNaN(n) || n < 0) {
    throw new HttpError(400, `Invalid due amount for "${fieldName || 'field'}": "${value}" — must be a non-negative number`)
  }
  return n
}

async function findStudent(usn) {
  const student = await Student.findOne({ usn: String(usn).toUpperCase() })
  if (!student) throw new HttpError(404, 'Student not found')
  return student
}

/* ── Reads ─────────────────────────────────────────────────────────── */

export async function listStudents(filters = {}, user = null) {
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    let list = listLocalStudents(filters, user)
    if (filters.search) {
      const term = String(filters.search).toLowerCase().trim()
      list = list.filter((s) => s.name?.toLowerCase().includes(term) || s.usn?.toLowerCase().includes(term))
    }
    return serialize(list)
  }

  const query = {}

  if (filters.branchCode) query.branchCode = String(filters.branchCode).toUpperCase()
  if (filters.semester) query.semester = Number(filters.semester)
  if (filters.section) query.section = String(filters.section).toUpperCase()

  if (filters.search) {
    const term = String(filters.search).trim()
    const regex = new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
    query.$or = [{ name: regex }, { usn: regex }]
  }

  // Students may only ever see their own record.
  if (user?.role === 'student') query.usn = user.usn

  const students = await Student.find(query).sort({ usn: 1 }).lean()
  return serialize(students)
}

export async function getStudentByUsn(usn, user = null) {
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    const student = getLocalStudentByUsn(usn)
    if (user?.role === 'student' && user.usn?.toUpperCase() !== student.usn?.toUpperCase()) {
      throw new HttpError(403, 'Access denied')
    }
    return serialize(student)
  }

  const student = await Student.findOne({ usn: String(usn).toUpperCase() }).lean()
  if (!student) throw new HttpError(404, 'Student not found')
  if (user?.role === 'student' && user.usn !== student.usn) {
    throw new HttpError(403, 'Access denied')
  }
  return serialize(student)
}

/* ── Single-record mutations ───────────────────────────────────────── */

function recordActivity(student, action, performedBy, remarks = '') {
  if (!Array.isArray(student.activityLog)) student.activityLog = []
  student.activityLog.unshift({
    action,
    performedBy: performedBy || 'System',
    remarks: String(remarks || '').trim(),
    timestamp: new Date()
  })
  if (student.activityLog.length > 50) {
    student.activityLog = student.activityLog.slice(0, 50)
  }
}

export async function updateDues(usn, { hostelDue, libraryDue, feesDue }, user = null) {
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalDues(usn, { hostelDue, libraryDue, feesDue }, user))
  }
  const student = await findStudent(usn)

  if (hostelDue !== undefined) student.hostelDue = parseDue(hostelDue, 'hostelDue')
  if (libraryDue !== undefined) student.libraryDue = parseDue(libraryDue, 'libraryDue')
  if (feesDue !== undefined) student.feesDue = parseDue(feesDue, 'feesDue')

  const changes = []
  if (hostelDue !== undefined) changes.push(`Hostel: ₹${student.hostelDue ?? 0}`)
  if (libraryDue !== undefined) changes.push(`Library: ₹${student.libraryDue ?? 0}`)
  if (feesDue !== undefined) changes.push(`Fees: ₹${student.feesDue ?? 0}`)
  recordActivity(student, 'Dues Updated', user?.name ? `${user.name} (Accounts)` : 'Accounts', changes.join(', '))

  await student.save()
  return serialize(student.toObject())
}

export async function updatePlacement(usn, placement) {
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalPlacement(usn, placement))
  }
  const student = await findStudent(usn)
  student.placement = placement || null
  await student.save()
  return serialize(student.toObject())
}

export async function updateClearance(usn, subjects, user = null) {
  if (!Array.isArray(subjects)) throw new HttpError(400, 'Subjects array is required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalClearance(usn, subjects, user))
  }
  const student = await findStudent(usn)
  const VALID_CLEARANCE = ['yes', 'no', 'not_cleared']

  subjects.forEach((update) => {
    const subject = student.subjects.find((item) => item.code === update.code)
    if (!subject) return
    if (update.clearance) {
      if (!VALID_CLEARANCE.includes(update.clearance)) {
        throw new HttpError(400, `Invalid clearance value: "${update.clearance}". Must be yes, no or not_cleared`)
      }
      subject.clearance = update.clearance
    }
    if (update.remarks !== undefined) subject.remarks = update.remarks
  })

  const cleared = subjects.filter((s) => s.clearance === 'yes').map((s) => s.code)
  const rejected = subjects.filter((s) => s.clearance === 'no').map((s) => s.code)
  const parts = []
  if (cleared.length) parts.push(`Cleared: ${cleared.join(', ')}`)
  if (rejected.length) parts.push(`Not Cleared: ${rejected.join(', ')}`)
  recordActivity(student, 'Clearance Updated', user?.name ? `${user.name} (Faculty)` : 'Faculty', parts.join(' | ') || 'Clearance updated')

  await student.save()
  return serialize(student.toObject())
}

export async function updateFaculty(usn, subjectCode, faculty) {
  if (!subjectCode || !faculty) throw new HttpError(400, 'Subject code and faculty are required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalFaculty(usn, subjectCode, faculty))
  }
  const student = await findStudent(usn)

  const subject = student.subjects.find((item) => item.code === subjectCode)
  if (!subject) throw new HttpError(404, 'Subject not found for this student')

  subject.faculty = faculty
  await student.save()
  return serialize(student.toObject())
}

export async function updateStudent(usn, data, user = null) {
  if (!data || typeof data !== 'object') throw new HttpError(400, 'Update data is required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalStudent(usn, data, user))
  }
  const student = await findStudent(usn)

  if (data.name !== undefined) {
    const trimmed = String(data.name).trim()
    if (!trimmed) throw new HttpError(400, 'Student name cannot be empty')
    student.name = trimmed
    await User.updateOne({ usn: student.usn, role: 'student' }, { $set: { name: trimmed } })
  }
  if (data.semester !== undefined) {
    const s = Number(data.semester)
    if (Number.isNaN(s) || s < 1 || s > 8) throw new HttpError(400, 'Semester must be between 1 and 8')
    student.semester = s
  }
  if (data.section !== undefined) {
    const sec = String(data.section).toUpperCase().trim()
    if (!sec) throw new HttpError(400, 'Section cannot be empty')
    student.section = sec
  }
  if (data.branchCode !== undefined) {
    const b = String(data.branchCode).toUpperCase().trim()
    if (!b) throw new HttpError(400, 'Branch code cannot be empty')
    student.branchCode = b
  }
  if (data.placement !== undefined) {
    student.placement = data.placement || null
  }

  recordActivity(student, 'Details Updated', user?.name ? `${user.name} (Admin)` : 'Admin', `Fields: ${Object.keys(data).filter((k) => data[k] !== undefined).join(', ')}`)

  await student.save()
  return serialize(student.toObject())
}

export async function updateCCApproval(usn, approval, remarks = '', user = null) {
  if (!['approved', 'rejected', 'pending'].includes(approval)) {
    throw new HttpError(400, 'Approval must be approved, rejected or pending')
  }
  if (approval === 'rejected' && String(remarks || '').trim().length < 3) {
    throw new HttpError(400, 'A specific reason (minimum 3 characters) is required to reject')
  }
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalCCApproval(usn, approval, remarks, user))
  }
  const student = await findStudent(usn)

  student.ccApproval = approval
  student.ccRemarks = approval === 'rejected' ? String(remarks || '').trim() : ''
  // Hall ticket is issued if and only if BOTH CC and Admin approve
  student.hallTicketIssued = approval === 'approved' && student.adminApproval === 'approved'

  const action = approval === 'approved' ? 'CC Sign-off Approved' : approval === 'rejected' ? 'CC Sign-off Rejected' : 'CC Sign-off Set to Pending'
  recordActivity(student, action, user?.name ? `${user.name} (CC)` : 'Class Coordinator', remarks)

  await student.save()
  return serialize(student.toObject())
}

export async function updateAdminApproval(usn, approval, remarks = '', user = null) {
  if (!['approved', 'rejected', 'pending'].includes(approval)) {
    throw new HttpError(400, 'Approval must be approved, rejected or pending')
  }
  if (approval === 'rejected' && String(remarks || '').trim().length < 3) {
    throw new HttpError(400, 'A specific reason (minimum 3 characters) is required to reject')
  }
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(updateLocalAdminApproval(usn, approval, remarks, user))
  }
  const student = await findStudent(usn)

  student.adminApproval = approval
  student.adminRemarks = approval === 'rejected' ? String(remarks || '').trim() : ''
  // Hall ticket is issued if and only if BOTH CC and Admin approve
  student.hallTicketIssued = approval === 'approved' && student.ccApproval === 'approved'

  const action = approval === 'approved' ? 'Hall Ticket Issued' : approval === 'rejected' ? 'Hall Ticket Rejected' : 'Admin Set to Pending'
  recordActivity(student, action, user?.name ? `${user.name} (Admin)` : 'Admin', remarks)

  await student.save()
  return serialize(student.toObject())
}

/* ── Documents ─────────────────────────────────────────────────────── */

export async function addDocument(usn, { name, url }) {
  if (!name || !url) throw new HttpError(400, 'Document name and url are required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(addLocalDocument(usn, { name, url }))
  }
  const student = await findStudent(usn)

  student.documents.push({ name, url, uploadedAt: new Date(), status: 'pending', reason: '' })
  await student.save()
  return serialize(student.toObject())
}

export async function reviewDocument(usn, documentId, { status, reason, reviewedBy }) {
  if (!['approved', 'rejected'].includes(status)) {
    throw new HttpError(400, 'Status must be approved or rejected')
  }
  if (status === 'rejected' && !String(reason || '').trim()) {
    throw new HttpError(400, 'A reason is required when rejecting a document')
  }
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(reviewLocalDocument(usn, documentId, { status, reason, reviewedBy }))
  }
  const student = await findStudent(usn)

  const doc = student.documents.id(documentId)
  if (!doc) throw new HttpError(404, 'Document not found')

  doc.status = status
  doc.reason = status === 'rejected' ? String(reason).trim() : ''
  doc.reviewedAt = new Date()
  doc.reviewedBy = reviewedBy || ''

  await student.save()
  return serialize(student.toObject())
}

export async function removeDocument(usn, documentId) {
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(removeLocalDocument(usn, documentId))
  }
  const student = await findStudent(usn)

  const doc = student.documents.id(documentId)
  if (!doc) throw new HttpError(404, 'Document not found')

  doc.deleteOne()
  await student.save()
  return serialize(student.toObject())
}

/* ── Bulk operations ───────────────────────────────────────────────── */
// These use bulkWrite rather than a findOne/save loop — a 900-row CSV would
// otherwise be 900 sequential round trips and blow the serverless time limit.

export async function createBulkStudents(rows) {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Students array is required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return createLocalBulkStudents(rows)
  }

  // Deduplicate within the uploaded batch itself
  const seenInBatch = new Set()
  const uniqueRows = []
  for (const item of rows) {
    const usn = String(item.usn || item.USN || '').toUpperCase().trim()
    if (!usn) continue
    if (seenInBatch.has(usn)) continue
    seenInBatch.add(usn)
    uniqueRows.push({ ...item, usn })
  }

  if (uniqueRows.length === 0) {
    throw new HttpError(400, 'No valid student records with USN found in upload')
  }

  // Detect duplicates against existing database records
  const allUsns = uniqueRows.map((r) => r.usn)
  const existing = await Student.find({ usn: { $in: allUsns } }, { usn: 1 }).lean()
  const existingSet = new Set(existing.map((s) => s.usn))

  // If ALL rows already exist, reject the duplicate upload completely
  if (existingSet.size === allUsns.length) {
    const sample = allUsns.slice(0, 4).join(', ')
    const extra = allUsns.length > 4 ? ` and ${allUsns.length - 4} more` : ''
    throw new HttpError(
      409,
      `Duplicate upload rejected: All ${allUsns.length} students already exist in the system (${sample}${extra}). No duplicates were taken.`
    )
  }

  // Separate new students from existing duplicates to prevent re-processing identical sets
  const newRows = uniqueRows.filter((r) => !existingSet.has(r.usn))
  const duplicateRows = uniqueRows.filter((r) => existingSet.has(r.usn))

  const studentOps = []
  const credentials = []

  for (const item of newRows) {
    const usn = item.usn
    const semester = Number(item.semester || item.Semester || 1)
    const branchCode = String(item.branchCode || item.BranchCode || 'CS').toUpperCase()
    const subjects = Array.isArray(item.subjects) && item.subjects.length
      ? item.subjects
      : getSubjects(semester, branchCode).map((subject, index) => ({
        ...subject,
        faculty: FACULTY_POOL[index % FACULTY_POOL.length],
        clearance: 'not_cleared',
        remarks: ''
      }))

    studentOps.push({
      insertOne: {
        document: {
          usn,
          name: item.name || item.Name || 'Unknown Student',
          semester,
          branchCode,
          section: String(item.section || item.Section || 'A').toUpperCase(),
          placement: item.placement || item.Placement || null,
          hostelDue: parseDue(item.hostelDue ?? item.HostelDue ?? null, 'hostelDue'),
          libraryDue: parseDue(item.libraryDue ?? item.LibraryDue ?? null, 'libraryDue'),
          feesDue: parseDue(item.feesDue ?? item.FeesDue ?? null, 'feesDue'),
          ccApproval: 'pending',
          adminApproval: 'pending',
          hallTicketIssued: false,
          subjects,
          documents: []
        }
      }
    })

    credentials.push({
      usn,
      name: item.name || item.Name || 'Unknown Student',
      password: item.password || item.Password || usn
    })
  }

  if (studentOps.length === 0) return { count: 0, created: 0, skipped: duplicateRows.length }

  await Student.bulkWrite(studentOps, { ordered: false })

  // Every uploaded student also needs a login
  const saved = await Student.find({ usn: { $in: credentials.map((c) => c.usn) } }, { usn: 1 }).lean()
  const idByUsn = new Map(saved.map((s) => [s.usn, s._id]))

  const userOps = await Promise.all(credentials.map(async (cred) => ({
    updateOne: {
      filter: { usn: cred.usn, role: 'student' },
      update: {
        $set: {
          role: 'student',
          name: cred.name,
          usn: cred.usn,
          student: idByUsn.get(cred.usn)
        },
        $setOnInsert: {
          passwordHash: await bcrypt.hash(String(cred.password), 10)
        }
      },
      upsert: true
    }
  })))

  await User.bulkWrite(userOps, { ordered: false })

  return {
    count: studentOps.length,
    created: studentOps.length,
    skipped: duplicateRows.length,
    duplicates: duplicateRows.map((r) => r.usn),
    message: duplicateRows.length > 0
      ? `Successfully added ${studentOps.length} new student(s). Skipped ${duplicateRows.length} duplicate student(s) already in the database.`
      : `Successfully added ${studentOps.length} student(s).`
  }
}

export async function bulkFacultyMapping(rows) {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Mappings array is required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return assignLocalBulkFaculty(rows)
  }
  await connectDB()

  // Deduplicate within the incoming batch
  const seenInBatch = new Set()
  const validRows = []
  for (const mapping of rows) {
    const usn = String(mapping.USN || mapping.usn || '').toUpperCase().trim()
    const subjectCode = String(mapping.SubjectCode || mapping.subjectCode || '').trim()
    const faculty = String(mapping.Faculty || mapping.faculty || '').trim()
    if (!usn || !subjectCode || !faculty) continue

    const key = `${usn}:${subjectCode}`
    if (seenInBatch.has(key)) continue
    seenInBatch.add(key)
    validRows.push({ usn, subjectCode, faculty })
  }

  if (validRows.length === 0) {
    throw new HttpError(400, 'No valid faculty mapping rows found')
  }

  // Check existing faculty assignments in database
  const targetUsns = [...new Set(validRows.map((r) => r.usn))]
  const students = await Student.find({ usn: { $in: targetUsns } }, { usn: 1, subjects: 1 }).lean()
  const studentMap = new Map(students.map((s) => [s.usn, s]))

  let alreadyMappedCount = 0
  const ops = []

  for (const { usn, subjectCode, faculty } of validRows) {
    const student = studentMap.get(usn)
    if (!student) continue

    const subject = (student.subjects || []).find((s) => s.code === subjectCode)
    if (subject && subject.faculty === faculty) {
      // Exactly the same assignment already exists — duplicate!
      alreadyMappedCount++
      continue
    }

    ops.push({
      updateOne: {
        filter: { usn },
        update: { $set: { 'subjects.$[subject].faculty': faculty } },
        arrayFilters: [{ 'subject.code': subjectCode }]
      }
    })
  }

  // If ALL rows in the upload are already mapped identically, reject the duplicate
  if (ops.length === 0 && alreadyMappedCount > 0) {
    throw new HttpError(
      409,
      `Duplicate mapping rejected: All ${alreadyMappedCount} faculty assignments in this file are already configured. No changes were made.`
    )
  }

  if (ops.length === 0) {
    throw new HttpError(400, 'No matching student subjects found for mapping. Ensure student USNs and subject codes exist.')
  }

  const result = await Student.bulkWrite(ops, { ordered: false })
  const updatedCount = result.modifiedCount ?? ops.length

  return {
    count: updatedCount,
    updated: updatedCount,
    skipped: alreadyMappedCount,
    message: alreadyMappedCount > 0
      ? `Updated ${updatedCount} faculty assignment(s). Skipped ${alreadyMappedCount} duplicate assignment(s) already configured.`
      : `Successfully mapped ${updatedCount} subject(s) to faculty.`
  }
}

export async function bulkDuesUpdate(rows) {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Dues array is required')
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return updateLocalBulkDues(rows)
  }
  await connectDB()

  // Deduplicate by USN
  const seenInBatch = new Set()
  const validRows = []
  for (const item of rows) {
    const usn = String(item.USN || item.usn || '').toUpperCase().trim()
    if (!usn || seenInBatch.has(usn)) continue
    seenInBatch.add(usn)
    validRows.push(item)
  }

  if (validRows.length === 0) {
    throw new HttpError(400, 'No valid dues rows found')
  }

  const targetUsns = validRows.map((r) => String(r.USN || r.usn).toUpperCase().trim())
  const existingStudents = await Student.find(
    { usn: { $in: targetUsns } },
    { usn: 1, hostelDue: 1, libraryDue: 1, feesDue: 1 }
  ).lean()
  const studentMap = new Map(existingStudents.map((s) => [s.usn, s]))

  let identicalCount = 0
  const ops = []

  for (const item of validRows) {
    const usn = String(item.USN || item.usn || '').toUpperCase().trim()
    const rawHostel = item.HostelDue ?? item.hostelDue
    const rawLibrary = item.LibraryDue ?? item.libraryDue
    const rawFees = item.FeesDue ?? item.feesDue

    const update = {}
    if (rawHostel !== undefined) update.hostelDue = parseDue(rawHostel, 'hostelDue')
    if (rawLibrary !== undefined) update.libraryDue = parseDue(rawLibrary, 'libraryDue')
    if (rawFees !== undefined) update.feesDue = parseDue(rawFees, 'feesDue')

    if (Object.keys(update).length === 0) continue

    const current = studentMap.get(usn)
    if (current) {
      const hostelMatches = update.hostelDue === undefined || update.hostelDue === current.hostelDue
      const libraryMatches = update.libraryDue === undefined || update.libraryDue === current.libraryDue
      const feesMatches = update.feesDue === undefined || update.feesDue === current.feesDue

      if (hostelMatches && libraryMatches && feesMatches) {
        // Values are identical to current database values
        identicalCount++
        continue
      }
    }

    ops.push({
      updateOne: {
        filter: { usn },
        update: { $set: update }
      }
    })
  }

  if (ops.length === 0 && identicalCount > 0) {
    throw new HttpError(
      409,
      `Duplicate dues upload rejected: All dues in this file already match existing student records.`
    )
  }

  if (ops.length === 0) return { count: 0, updated: 0, skipped: identicalCount }

  const result = await Student.bulkWrite(ops, { ordered: false })
  const updatedCount = result.modifiedCount ?? ops.length

  return {
    count: updatedCount,
    updated: updatedCount,
    skipped: identicalCount,
    message: identicalCount > 0
      ? `Updated dues for ${updatedCount} student(s). Skipped ${identicalCount} identical record(s).`
      : `Successfully updated dues for ${updatedCount} student(s).`
  }
}

/* ── Aggregates used by dashboards ─────────────────────────────────── */

export async function getStudentStats(filters = {}) {
  const conn = await connectDB().catch(() => null)
  if (!conn) {
    const students = listLocalStudents(filters)
    const total = students.length
    const placed = students.filter((s) => s.placement === 'Placed').length
    const unplaced = students.filter((s) => s.placement === 'Unplaced').length
    const withPlacement = students.filter((s) => Boolean(s.placement)).length
    const issued = students.filter((s) => Boolean(s.hallTicketIssued)).length
    return { total, placed, unplaced, withPlacement, issued }
  }

  const query = {}
  if (filters.branchCode) query.branchCode = String(filters.branchCode).toUpperCase()
  if (filters.semester) query.semester = Number(filters.semester)
  if (filters.section) query.section = String(filters.section).toUpperCase()

  const [stats] = await Student.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$placement', 'Placed'] }, 1, 0] } },
        unplaced: { $sum: { $cond: [{ $eq: ['$placement', 'Unplaced'] }, 1, 0] } },
        withPlacement: { $sum: { $cond: [{ $ifNull: ['$placement', false] }, 1, 0] } },
        issued: { $sum: { $cond: ['$hallTicketIssued', 1, 0] } }
      }
    }
  ])

  return stats
    ? { total: stats.total, placed: stats.placed, unplaced: stats.unplaced, withPlacement: stats.withPlacement, issued: stats.issued }
    : { total: 0, placed: 0, unplaced: 0, withPlacement: 0, issued: 0 }
}

export async function assignSectionFaculty({ semester, branchCode, section, assignments }, user = null) {
  const sem = Number(semester)
  const branch = String(branchCode).toUpperCase().trim()
  const sec = String(section).toUpperCase().trim()

  if (!sem || !branch || !sec) {
    throw new HttpError(400, 'Semester, branch, and section are required')
  }
  if (!assignments || typeof assignments !== 'object' || Object.keys(assignments).length === 0) {
    throw new HttpError(400, 'Faculty assignments for subjects are required')
  }

  const conn = await connectDB().catch(() => null)
  if (!conn) {
    return serialize(assignLocalSectionFaculty({ semester: sem, branchCode: branch, section: sec, assignments }, user))
  }

  const students = await Student.find({ semester: sem, branchCode: branch, section: sec })
  if (!students || students.length === 0) {
    throw new HttpError(404, `No students found in Semester ${sem}, ${branch}, Section ${sec}`)
  }

  const curriculum = getSubjects(sem, branch)
  let updatedCount = 0

  for (const student of students) {
    let modified = false
    if (!student.subjects || student.subjects.length === 0) {
      student.subjects = curriculum.map((sub) => ({
        code: sub.code,
        name: sub.name,
        type: sub.type,
        faculty: assignments[sub.code] || '',
        clearance: 'not_cleared',
        remarks: ''
      }))
      modified = true
    } else {
      for (const [code, faculty] of Object.entries(assignments)) {
        if (!faculty) continue
        const sub = student.subjects.find((s) => s.code.toUpperCase() === code.toUpperCase())
        if (sub) {
          if (sub.faculty !== faculty) {
            sub.faculty = faculty
            modified = true
          }
        } else {
          const meta = curriculum.find((c) => c.code.toUpperCase() === code.toUpperCase())
          student.subjects.push({
            code,
            name: meta?.name || code,
            type: meta?.type || 'theory',
            faculty,
            clearance: 'not_cleared',
            remarks: ''
          })
          modified = true
        }
      }
    }
    if (modified) {
      recordActivity(
        student,
        'Section Faculty Assigned',
        user?.name ? `${user.name} (Admin)` : 'Admin',
        `Assigned faculty for section ${branch}-${sec}`
      )
      await student.save()
      updatedCount++
    }
  }

  return {
    success: true,
    studentCount: students.length,
    updatedCount,
    subjectCount: Object.keys(assignments).length,
    message: `Assigned faculty for ${Object.keys(assignments).length} subject(s) to all ${students.length} student(s) in Sem ${sem} ${branch}-${sec}`
  }
}
