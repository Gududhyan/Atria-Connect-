import { BRANCHES, SECTIONS, SEMESTERS, FACULTY_POOL, REMARKS_OPTIONS, getSubjects } from './constants.js'

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function generateStudent(semester, branchCode, section, rollNumber) {
  const usn = `1AT23${branchCode}${String(rollNumber).padStart(3, '0')}`
  const h = hashString(usn)
  const name = `Student ${String(h % 999).padStart(3, '0')}`
  const subjects = getSubjects(semester, branchCode).map((subject, index) => {
    const clearance = index % 3 === 0 ? 'no' : 'yes'
    return {
      code: subject.code,
      name: subject.name,
      type: subject.type,
      faculty: FACULTY_POOL[(h + index) % FACULTY_POOL.length],
      clearance,
      remarks: clearance === 'no' ? REMARKS_OPTIONS[h % REMARKS_OPTIONS.length] : ''
    }
  })

  const duesRoll = hashString(usn + 'dues')
  return {
    usn,
    name,
    semester,
    branchCode,
    section,
    password: usn,
    placement: null,
    hostelDue: duesRoll % 10 > 6 ? [1500, 2500, 3500, 5000, 8000][duesRoll % 5] : 0,
    libraryDue: duesRoll % 10 > 7 ? [200, 500, 800, 1000][duesRoll % 4] : 0,
    feesDue: duesRoll % 10 > 5 ? [15000, 25000, 35000, 50000, 75000, 100000][duesRoll % 6] : 0,
    ccApproval: 'pending',
    adminApproval: 'pending',
    hallTicketIssued: false,
    subjects,
    documents: []
  }
}

const PER_SECTION = 5
const PER_SEMESTER = SECTIONS.length * PER_SECTION

export function generateAllStudents() {
  const students = []
  for (const semester of SEMESTERS) {
    for (const branch of BRANCHES) {
      for (const section of SECTIONS) {
        for (let roll = 1; roll <= PER_SECTION; roll++) {
          // The roll number has to encode the semester too — otherwise every
          // semester generates the same 15 USNs per branch and the unique index
          // silently drops all but the first, leaving only semester 1 populated.
          const rollNumber =
            (semester - 1) * PER_SEMESTER + SECTIONS.indexOf(section) * PER_SECTION + roll
          students.push(generateStudent(semester, branch.code, section, rollNumber))
        }
      }
    }
  }
  return students
}
