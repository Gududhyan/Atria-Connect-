import 'server-only'
import bcrypt from 'bcryptjs'
import { connectDB } from '../db'
import { getSubjects, FACULTY_POOL } from '../constants'
import Student from '@/models/Student'
import User from '@/models/User'

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
  await connectDB()
  const query = {}

  if (filters.branchCode) query.branchCode = String(filters.branchCode).toUpperCase()
  if (filters.semester) query.semester = Number(filters.semester)
  if (filters.section) query.section = String(filters.section).toUpperCase()

  // Students may only ever see their own record.
  if (user?.role === 'student') query.usn = user.usn

  const students = await Student.find(query).sort({ usn: 1 }).lean()
  return serialize(students)
}

export async function getStudentByUsn(usn, user = null) {
  await connectDB()
  const student = await Student.findOne({ usn: String(usn).toUpperCase() }).lean()
  if (!student) throw new HttpError(404, 'Student not found')
  if (user?.role === 'student' && user.usn !== student.usn) {
    throw new HttpError(403, 'Access denied')
  }
  return serialize(student)
}

/* ── Single-record mutations ───────────────────────────────────────── */

export async function updateDues(usn, { hostelDue, libraryDue, feesDue }) {
  await connectDB()
  const student = await findStudent(usn)

  if (hostelDue !== undefined) student.hostelDue = parseDue(hostelDue, 'hostelDue')
  if (libraryDue !== undefined) student.libraryDue = parseDue(libraryDue, 'libraryDue')
  if (feesDue !== undefined) student.feesDue = parseDue(feesDue, 'feesDue')

  await student.save()
  return serialize(student.toObject())
}

export async function updatePlacement(usn, placement) {
  await connectDB()
  const student = await findStudent(usn)
  student.placement = placement || null
  await student.save()
  return serialize(student.toObject())
}

export async function updateClearance(usn, subjects) {
  if (!Array.isArray(subjects)) throw new HttpError(400, 'Subjects array is required')
  await connectDB()
  const student = await findStudent(usn)

  subjects.forEach((update) => {
    const subject = student.subjects.find((item) => item.code === update.code)
    if (!subject) return
    if (update.clearance) subject.clearance = update.clearance
    if (update.remarks !== undefined) subject.remarks = update.remarks
  })

  await student.save()
  return serialize(student.toObject())
}

export async function updateFaculty(usn, subjectCode, faculty) {
  if (!subjectCode || !faculty) throw new HttpError(400, 'Subject code and faculty are required')
  await connectDB()
  const student = await findStudent(usn)

  const subject = student.subjects.find((item) => item.code === subjectCode)
  if (!subject) throw new HttpError(404, 'Subject not found for this student')

  subject.faculty = faculty
  await student.save()
  return serialize(student.toObject())
}

export async function updateCCApproval(usn, approval) {
  if (!['approved', 'rejected', 'pending'].includes(approval)) {
    throw new HttpError(400, 'Approval must be approved, rejected or pending')
  }
  await connectDB()
  const student = await findStudent(usn)

  student.ccApproval = approval
  student.hallTicketIssued = approval === 'approved' && student.adminApproval === 'approved'

  await student.save()
  return serialize(student.toObject())
}

export async function updateAdminApproval(usn, approval) {
  if (!['approved', 'rejected', 'pending'].includes(approval)) {
    throw new HttpError(400, 'Approval must be approved, rejected or pending')
  }
  await connectDB()
  const student = await findStudent(usn)

  student.adminApproval = approval
  student.hallTicketIssued = approval === 'approved' && student.ccApproval === 'approved'

  await student.save()
  return serialize(student.toObject())
}

/* ── Documents ─────────────────────────────────────────────────────── */

export async function addDocument(usn, { name, url }) {
  if (!name || !url) throw new HttpError(400, 'Document name and url are required')
  await connectDB()
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

  await connectDB()
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
  await connectDB()
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
  await connectDB()

  const studentOps = []
  const credentials = []

  for (const item of rows) {
    const usn = String(item.usn || item.USN || '').toUpperCase().trim()
    if (!usn) continue

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

    // Only override subjects on re-upload if the CSV explicitly provided them;
    // otherwise preserve existing clearance/remarks data.
    const hasExplicitSubjects = Array.isArray(item.subjects) && item.subjects.length > 0

    studentOps.push({
      updateOne: {
        filter: { usn },
        update: {
          $set: {
            usn,
            name: item.name || item.Name || 'Unknown Student',
            semester,
            branchCode,
            section: String(item.section || item.Section || 'A').toUpperCase(),
            placement: item.placement || item.Placement || null,
            hostelDue: parseDue(item.hostelDue ?? item.HostelDue ?? 0, 'hostelDue'),
            libraryDue: parseDue(item.libraryDue ?? item.LibraryDue ?? 0, 'libraryDue'),
            feesDue: parseDue(item.feesDue ?? item.FeesDue ?? 0, 'feesDue'),
            // Only overwrite subjects if the CSV row explicitly provided them
            ...(hasExplicitSubjects ? { subjects } : {})
          },
          $setOnInsert: {
            ccApproval: 'pending',
            adminApproval: 'pending',
            hallTicketIssued: false,
            // Auto-generated subjects only for new records (preserves clearance on re-upload)
            ...(!hasExplicitSubjects ? { subjects } : {}),
            documents: []
          }
        },
        upsert: true
      }
    })

    credentials.push({
      usn,
      name: item.name || item.Name || 'Unknown Student',
      password: item.password || item.Password || usn
    })
  }

  if (studentOps.length === 0) return { count: 0 }

  await Student.bulkWrite(studentOps, { ordered: false })

  // Every uploaded student also needs a login, otherwise the row is unusable.
  const saved = await Student.find({ usn: { $in: credentials.map((c) => c.usn) } }, { usn: 1 }).lean()
  const idByUsn = new Map(saved.map((s) => [s.usn, s._id]))

  const userOps = await Promise.all(credentials.map(async (cred) => ({
    updateOne: {
      filter: { usn: cred.usn, role: 'student' },
      update: {
        $set: {
          // Only update non-sensitive fields on re-upload
          role: 'student',
          name: cred.name,
          usn: cred.usn,
          student: idByUsn.get(cred.usn)
        },
        $setOnInsert: {
          // Password is only set on first creation — never overwritten on re-upload
          passwordHash: await bcrypt.hash(String(cred.password), 10)
        }
      },
      upsert: true
    }
  })))

  await User.bulkWrite(userOps, { ordered: false })

  return { count: studentOps.length }
}

export async function bulkFacultyMapping(rows) {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Mappings array is required')
  await connectDB()

  const ops = []
  for (const mapping of rows) {
    const usn = String(mapping.USN || mapping.usn || '').toUpperCase().trim()
    const subjectCode = mapping.SubjectCode || mapping.subjectCode
    const faculty = mapping.Faculty || mapping.faculty
    if (!usn || !subjectCode || !faculty) continue

    ops.push({
      updateOne: {
        filter: { usn },
        update: { $set: { 'subjects.$[subject].faculty': faculty } },
        arrayFilters: [{ 'subject.code': subjectCode }]
      }
    })
  }

  if (ops.length === 0) return { count: 0 }
  const result = await Student.bulkWrite(ops, { ordered: false })
  return { count: result.modifiedCount ?? ops.length }
}

export async function bulkDuesUpdate(rows) {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Dues array is required')
  await connectDB()

  const ops = []
  for (const item of rows) {
    const usn = String(item.USN || item.usn || '').toUpperCase().trim()
    if (!usn) continue

    ops.push({
      updateOne: {
        filter: { usn },
        update: {
          $set: {
            hostelDue: parseDue(item.HostelDue ?? item.hostelDue),
            libraryDue: parseDue(item.LibraryDue ?? item.libraryDue),
            feesDue: parseDue(item.FeesDue ?? item.feesDue)
          }
        }
      }
    })
  }

  if (ops.length === 0) return { count: 0 }
  const result = await Student.bulkWrite(ops, { ordered: false })
  return { count: result.modifiedCount ?? ops.length }
}

/* ── Aggregates used by dashboards ─────────────────────────────────── */

export async function getStudentStats(filters = {}) {
  await connectDB()
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
