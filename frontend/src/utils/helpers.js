export const LOGO_URL = 'https://z-cdn-media.chatglm.cn/files/608301c8-f027-41d7-b9db-4228f7cbce3f.png?auth_key=1876273443-882fc7e2cde84494918353d33989b58a-0-24bcfb36407b60aaf539c68aa4526b71'

export const BRANCHES = [
  { id: 'cse', name: 'Computer Science & Engineering', short: 'CSE', specializations: ['Data Science', 'CS & Design'] },
  { id: 'ise', name: 'Information Science & Engineering', short: 'ISE', specializations: [] },
  { id: 'ece', name: 'Electronics & Communication Engineering', short: 'ECE', specializations: [] },
  { id: 'aiml', name: 'Artificial Intelligence & Machine Learning', short: 'AI&ML', specializations: [] },
  { id: 'me', name: 'Mechanical Engineering', short: 'ME', specializations: [] },
  { id: 'ce', name: 'Civil Engineering', short: 'CE', specializations: [] },
]

export const SECTIONS = ['A', 'B', 'C']
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

export function getBranchName(branchId) {
  const b = BRANCHES.find(b => b.id === branchId)
  return b ? b.short : branchId
}

export function getStudent(students, id) {
  return students.find(s => s.id === id)
}

export function getFaculty(faculties, id) {
  return faculties.find(f => f.id === id)
}

export function getSubjectFacultyName(subjects, faculties, subjectId) {
  const sub = subjects.find(s => s.id === subjectId)
  if (!sub) return '—'
  const fac = faculties.find(f => f.id === sub.facultyId)
  return fac ? fac.name : 'Unassigned'
}

export function getFacultySubjects(subjects, facultyId) {
  return subjects.filter(s => s.facultyId === facultyId)
}

export function countStatuses(arr) {
  let cleared = 0, pending = 0, notCleared = 0
  arr.forEach(v => {
    if (v === true) cleared++
    else if (v === false) notCleared++
    else pending++
  })
  return { cleared, pending, notCleared }
}

export function isEligible(student) {
  if (!student.ccSign || !student.adminApproval) return 'pending'
  if (student.ccSign === false || student.adminApproval === false) return 'rejected'
  for (const sid in student.subjects) {
    if (student.subjects[sid].cleared !== true) return 'rejected'
  }
  if (student.hostel.cleared !== true || student.library.cleared !== true || student.fees.cleared !== true) return 'rejected'
  return 'approved'
}

export function formatCurrency(amount) {
  if (!amount) return ''
  return '₹' + amount.toLocaleString('en-IN')
}

export function getFilteredStudents(students, filters) {
  return students.filter(s => {
    if (filters.semester && s.sem !== parseInt(filters.semester)) return false
    if (filters.branch && s.branch !== filters.branch) return false
    if (filters.section && s.section !== filters.section) return false
    return true
  })
}

export const ROLE_LABELS = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
  account: 'Account Person',
  cc: 'Class Coordinator',
}

export const ROLE_MENUS = {
  student: [
    { id: '/student/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: '/student/clearances', icon: 'fa-clipboard-check', label: 'My Clearances' },
  ],
  faculty: [
    { id: '/faculty/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: '/faculty/clearance', icon: 'fa-pen-to-square', label: 'Subject Clearance' },
  ],
  admin: [
    { id: '/admin/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: '/admin/assign', icon: 'fa-user-gear', label: 'Faculty Assignment' },
    { id: '/admin/approval', icon: 'fa-stamp', label: 'Hall Ticket Approval' },
  ],
  account: [
    { id: '/account/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: '/account/dues', icon: 'fa-indian-rupee-sign', label: 'Manage Dues' },
  ],
  cc: [
    { id: '/cc/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: '/cc/decision', icon: 'fa-gavel', label: 'Hall Ticket Decision' },
  ],
}