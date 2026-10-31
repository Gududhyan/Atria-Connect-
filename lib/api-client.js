'use client'

// Same-origin fetch helpers for Client Components. Auth rides along on the
// httpOnly session cookie, so there are no tokens to attach here.
async function request(path, { method = 'GET', body, isFormData } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Request failed')
  }
  return data
}

export const login = (payload) => request('/auth/login', { method: 'POST', body: payload })
export const logout = () => request('/auth/logout', { method: 'POST' })

export const updateDues = (usn, dues) =>
  request(`/students/${usn}/dues`, { method: 'PUT', body: dues })

export const updateClearance = (usn, subjects) =>
  request(`/students/${usn}/clearance`, { method: 'PUT', body: { subjects } })

export const updateFaculty = (usn, subjectCode, faculty) =>
  request(`/students/${usn}/faculty`, { method: 'PUT', body: { subjectCode, faculty } })

export const updatePlacement = (usn, placement) =>
  request(`/students/${usn}/placement`, { method: 'PUT', body: { placement } })

export const updateStudentDetails = (usn, details) =>
  request(`/students/${usn}`, { method: 'PATCH', body: details })

export const updateCCApproval = (usn, approval, remarks = '') =>
  request(`/students/${usn}/approve/cc`, { method: 'PUT', body: { approval, remarks } })

export const updateAdminApproval = (usn, approval, remarks = '') =>
  request(`/students/${usn}/approve/admin`, { method: 'PUT', body: { approval, remarks } })

export const uploadDocument = (usn, file) => {
  const formData = new FormData()
  formData.append('document', file)
  return request(`/students/${usn}/documents`, { method: 'POST', body: formData, isFormData: true })
}

export const reviewDocument = (usn, docId, status, reason) =>
  request(`/students/${usn}/documents/${docId}`, { method: 'PATCH', body: { status, reason } })

export const deleteDocument = (usn, docId) =>
  request(`/students/${usn}/documents/${docId}`, { method: 'DELETE' })

export const bulkCreateStudents = (students) =>
  request('/students/bulk', { method: 'POST', body: { students } })

export const bulkFacultyMapping = (mappings) =>
  request('/students/bulk-faculty', { method: 'POST', body: { mappings } })

export const bulkDuesUpdate = (dues) =>
  request('/students/bulk-dues', { method: 'POST', body: { dues } })

export const assignSectionFaculty = ({ semester, branchCode, section, assignments }) =>
  request('/students/assign-section-faculty', {
    method: 'POST',
    body: { semester, branchCode, section, assignments }
  })
