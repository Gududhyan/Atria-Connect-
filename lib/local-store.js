import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { generateAllStudents } from './seed-data'

const DATA_FILE = path.join(process.cwd(), '.local-data.json')

const STAFF_DEFAULTS = [
  { _id: 'staff_admin_01', role: 'admin', username: 'admin', name: 'Administrator', password: 'admin123' },
  { _id: 'staff_account_01', role: 'account', username: 'account', name: 'Accounts Officer', password: 'account123' },
  { _id: 'staff_cc_01', role: 'cc', username: 'cc', name: 'Class Coordinator', password: 'cc123' },
  { _id: 'staff_faculty_01', role: 'faculty', username: 'faculty', name: 'Dr. Priya Kumar', password: 'faculty123' }
]

function initStore() {
  if (global._localStore) return global._localStore

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.users)) {
        global._localStore = parsed
        return global._localStore
      }
    } catch {
      // If parsing fails, fall back to initial generation
    }
  }

  // Generate initial dataset
  const generatedStudents = generateAllStudents().map((s) => ({
    ...s,
    _id: `stu_${s.usn}`,
    documents: [],
    activityLog: [
      {
        action: 'Student Profile Created',
        performedBy: 'System',
        remarks: 'Initial student import',
        timestamp: new Date().toISOString()
      }
    ]
  }))

  const users = [
    ...STAFF_DEFAULTS.map((staff) => ({
      _id: staff._id,
      role: staff.role,
      username: staff.username,
      name: staff.name,
      passwordHash: bcrypt.hashSync(staff.password, 10)
    })),
    ...generatedStudents.map((s) => ({
      _id: `usr_${s.usn}`,
      role: 'student',
      name: s.name,
      usn: s.usn,
      studentId: s._id,
      passwordHash: bcrypt.hashSync(s.usn, 10)
    }))
  ]

  const store = { students: generatedStudents, users }
  global._localStore = store
  saveStore(store)
  return store
}

function saveStore(store) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
  } catch (err) {
    console.error('[local-store] Failed to save to .local-data.json', err)
  }
}

function recordActivity(student, action, performedBy, remarks = '') {
  if (!Array.isArray(student.activityLog)) student.activityLog = []
  student.activityLog.unshift({
    action,
    performedBy: performedBy || 'System',
    remarks: String(remarks || '').trim(),
    timestamp: new Date().toISOString()
  })
  if (student.activityLog.length > 50) {
    student.activityLog = student.activityLog.slice(0, 50)
  }
}

/* ── Auth helpers ─────────────────────────────────────────────────── */

export function getLocalUserByUsername(role, username) {
  const store = initStore()
  const u = store.users.find(
    (item) => item.role === role && item.username?.toLowerCase() === username?.toLowerCase()
  )
  return u || null
}

export function getLocalUserByUsn(usn) {
  const store = initStore()
  const targetUsn = String(usn || '').toUpperCase()
  const user = store.users.find(
    (item) => item.role === 'student' && item.usn?.toUpperCase() === targetUsn
  )
  if (!user) return null
  const student = store.students.find((s) => s.usn?.toUpperCase() === targetUsn)
  return { ...user, student: student || null }
}

export function getLocalUserById(id) {
  const store = initStore()
  const user = store.users.find((item) => String(item._id) === String(id))
  if (!user) return null
  if (user.role === 'student') {
    const student = store.students.find((s) => s.usn?.toUpperCase() === user.usn?.toUpperCase())
    return { ...user, student: student || null }
  }
  return user
}

/* ── Student queries ──────────────────────────────────────────────── */

export function listLocalStudents(filters = {}, user = null) {
  const store = initStore()
  let list = [...store.students]

  if (user?.role === 'student') {
    list = list.filter((s) => s.usn?.toUpperCase() === user.usn?.toUpperCase())
  } else {
    if (filters.branchCode) {
      const b = String(filters.branchCode).toUpperCase()
      list = list.filter((s) => s.branchCode?.toUpperCase() === b)
    }
    if (filters.semester) {
      const sem = Number(filters.semester)
      list = list.filter((s) => Number(s.semester) === sem)
    }
    if (filters.section) {
      const sec = String(filters.section).toUpperCase()
      list = list.filter((s) => s.section?.toUpperCase() === sec)
    }
  }

  return JSON.parse(JSON.stringify(list))
}

export function getLocalStudentByUsn(usn) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }
  return JSON.parse(JSON.stringify(student))
}

/* ── Mutations ────────────────────────────────────────────────────── */

export function updateLocalDues(usn, dues, user = null) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }

  if (dues.hostelDue !== undefined) student.hostelDue = Number(dues.hostelDue) || 0
  if (dues.libraryDue !== undefined) student.libraryDue = Number(dues.libraryDue) || 0
  if (dues.feesDue !== undefined) student.feesDue = Number(dues.feesDue) || 0

  recordActivity(
    student,
    'Dues Updated',
    user?.name ? `${user.name} (Accounts)` : 'Accounts',
    `Hostel: ₹${student.hostelDue}, Library: ₹${student.libraryDue}, Fees: ₹${student.feesDue}`
  )

  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function updateLocalPlacement(usn, placement) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }
  student.placement = placement || null
  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function updateLocalClearance(usn, subjects, user = null) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }

  subjects.forEach((update) => {
    const sub = student.subjects.find((item) => item.code === update.code)
    if (!sub) return
    if (update.clearance) sub.clearance = update.clearance
    if (update.remarks !== undefined) sub.remarks = update.remarks
  })

  const cleared = subjects.filter((s) => s.clearance === 'yes').map((s) => s.code)
  const rejected = subjects.filter((s) => s.clearance === 'no').map((s) => s.code)
  const parts = []
  if (cleared.length) parts.push(`Cleared: ${cleared.join(', ')}`)
  if (rejected.length) parts.push(`Not Cleared: ${rejected.join(', ')}`)

  recordActivity(
    student,
    'Clearance Updated',
    user?.name ? `${user.name} (Faculty)` : 'Faculty',
    parts.join(' | ') || 'Clearance updated'
  )

  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function updateLocalFaculty(usn, subjectCode, faculty) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }
  const sub = student.subjects.find((item) => item.code === subjectCode)
  if (!sub) {
    const err = new Error('Subject not found')
    err.status = 404
    throw err
  }
  sub.faculty = faculty
  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function updateLocalStudent(usn, data, user = null) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }

  if (data.name !== undefined) {
    const trimmed = String(data.name).trim()
    student.name = trimmed
    const u = store.users.find((item) => item.usn?.toUpperCase() === target)
    if (u) u.name = trimmed
  }
  if (data.semester !== undefined) student.semester = Number(data.semester)
  if (data.section !== undefined) student.section = String(data.section).toUpperCase().trim()
  if (data.branchCode !== undefined) student.branchCode = String(data.branchCode).toUpperCase().trim()
  if (data.placement !== undefined) student.placement = data.placement || null

  recordActivity(
    student,
    'Details Updated',
    user?.name ? `${user.name} (Admin)` : 'Admin',
    `Fields: ${Object.keys(data).filter((k) => data[k] !== undefined).join(', ')}`
  )

  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function updateLocalCCApproval(usn, approval, remarks = '', user = null) {
  if (approval === 'rejected' && String(remarks || '').trim().length < 3) {
    const err = new Error('A specific reason (minimum 3 characters) is required to reject')
    err.status = 400
    throw err
  }
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }

  student.ccApproval = approval
  student.ccRemarks = approval === 'rejected' ? String(remarks || '').trim() : ''
  student.hallTicketIssued = approval === 'approved' && student.adminApproval === 'approved'

  const action = approval === 'approved' ? 'CC Sign-off Approved' : approval === 'rejected' ? 'CC Sign-off Rejected' : 'CC Sign-off Set to Pending'
  recordActivity(student, action, user?.name ? `${user.name} (CC)` : 'Class Coordinator', remarks)

  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function updateLocalAdminApproval(usn, approval, remarks = '', user = null) {
  if (approval === 'rejected' && String(remarks || '').trim().length < 3) {
    const err = new Error('A specific reason (minimum 3 characters) is required to reject')
    err.status = 400
    throw err
  }
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }

  student.adminApproval = approval
  student.adminRemarks = approval === 'rejected' ? String(remarks || '').trim() : ''
  student.hallTicketIssued = approval === 'approved' && student.ccApproval === 'approved'

  const action = approval === 'approved' ? 'Hall Ticket Issued' : approval === 'rejected' ? 'Hall Ticket Rejected' : 'Admin Set to Pending'
  recordActivity(student, action, user?.name ? `${user.name} (Admin)` : 'Admin', remarks)

  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function addLocalDocument(usn, { name, url }) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }
  if (!Array.isArray(student.documents)) student.documents = []
  const doc = {
    _id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    url,
    uploadedAt: new Date().toISOString(),
    status: 'pending',
    reason: ''
  }
  student.documents.push(doc)
  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function reviewLocalDocument(usn, docId, { status, reason, reviewedBy }) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }
  const doc = (student.documents || []).find((d) => String(d._id) === String(docId))
  if (!doc) {
    const err = new Error('Document not found')
    err.status = 404
    throw err
  }
  doc.status = status
  doc.reason = status === 'rejected' ? String(reason || '').trim() : ''
  doc.reviewedAt = new Date().toISOString()
  doc.reviewedBy = reviewedBy || ''
  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function removeLocalDocument(usn, docId) {
  const store = initStore()
  const target = String(usn || '').toUpperCase()
  const student = store.students.find((s) => s.usn?.toUpperCase() === target)
  if (!student) {
    const err = new Error('Student not found')
    err.status = 404
    throw err
  }
  student.documents = (student.documents || []).filter((d) => String(d._id) !== String(docId))
  saveStore(store)
  return JSON.parse(JSON.stringify(student))
}

export function createLocalBulkStudents(rows) {
  const store = initStore()
  let added = 0
  let updated = 0
  const existingMap = new Map(store.students.map((s) => [s.usn?.toUpperCase(), s]))

  for (const item of rows) {
    const usn = String(item.usn || '').toUpperCase().trim()
    if (!usn) continue
    if (existingMap.has(usn)) {
      const existing = existingMap.get(usn)
      if (item.name) existing.name = String(item.name).trim()
      if (item.semester) existing.semester = Number(item.semester)
      if (item.branchCode) existing.branchCode = String(item.branchCode).toUpperCase().trim()
      if (item.section) existing.section = String(item.section).toUpperCase().trim()
      updated++
    } else {
      const newStudent = {
        ...item,
        usn,
        _id: `stu_${usn}`,
        hostelDue: 0,
        libraryDue: 0,
        feesDue: 0,
        ccApproval: 'pending',
        ccRemarks: '',
        adminApproval: 'pending',
        adminRemarks: '',
        hallTicketIssued: false,
        subjects: [],
        documents: [],
        activityLog: [
          {
            action: 'Student Profile Created',
            performedBy: 'Bulk Upload',
            remarks: 'Uploaded via CSV',
            timestamp: new Date().toISOString()
          }
        ]
      }
      store.students.push(newStudent)
      store.users.push({
        _id: `usr_${usn}`,
        role: 'student',
        name: newStudent.name,
        usn,
        studentId: newStudent._id,
        passwordHash: bcrypt.hashSync(usn, 10)
      })
      added++
    }
  }

  saveStore(store)
  return { added, updated, total: rows.length }
}

export function assignLocalBulkFaculty(rows) {
  const store = initStore()
  let matched = 0
  const existingMap = new Map(store.students.map((s) => [s.usn?.toUpperCase(), s]))

  for (const item of rows) {
    const usn = String(item.usn || '').toUpperCase().trim()
    const student = existingMap.get(usn)
    if (!student) continue
    const sub = (student.subjects || []).find((s) => s.code === item.subjectCode)
    if (sub) {
      sub.faculty = item.faculty
      matched++
    }
  }

  saveStore(store)
  return { matched, total: rows.length }
}

export function updateLocalBulkDues(rows) {
  const store = initStore()
  let matched = 0
  const existingMap = new Map(store.students.map((s) => [s.usn?.toUpperCase(), s]))

  for (const item of rows) {
    const usn = String(item.usn || '').toUpperCase().trim()
    const student = existingMap.get(usn)
    if (!student) continue
    if (item.hostelDue !== undefined) student.hostelDue = Number(item.hostelDue) || 0
    if (item.libraryDue !== undefined) student.libraryDue = Number(item.libraryDue) || 0
    if (item.feesDue !== undefined) student.feesDue = Number(item.feesDue) || 0
    matched++
  }

  saveStore(store)
  return { matched, total: rows.length }
}
