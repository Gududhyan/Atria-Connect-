const API_BASE = '/api'
let authToken = localStorage.getItem('token') || null

export function setAuthToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

async function request(path, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type']
  } else if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(`${API_BASE}${path}`, config)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message || response.statusText || 'Request failed'
    throw new Error(message)
  }

  return data
}

export async function login(payload) {
  const data = await request('/auth/login', { method: 'POST', body: payload })
  setAuthToken(data.token)
  return data
}

export async function logout() {
  setAuthToken(null)
}

export async function getMe() {
  return request('/auth/me')
}

export async function getStudents(query = {}) {
  const queryString = typeof query === 'string'
    ? query
    : new URLSearchParams(query).toString()
  return request(`/students${queryString ? `?${queryString}` : ''}`)
}

export async function getMeta() {
  return request('/meta')
}

export async function updateDues(usn, dues) {
  return request(`/students/${usn}/dues`, { method: 'PUT', body: dues })
}

export async function updateClearance(usn, subjects) {
  return request(`/students/${usn}/clearance`, { method: 'PUT', body: { subjects } })
}

export async function updateCCApproval(usn, approval) {
  return request(`/students/${usn}/approve/cc`, { method: 'PUT', body: { approval } })
}

export async function updateAdminApproval(usn, approval) {
  return request(`/students/${usn}/approve/admin`, { method: 'PUT', body: { approval } })
}

export async function updateFaculty(usn, subjectCode, faculty) {
  return request(`/students/${usn}/faculty`, { method: 'PUT', body: { subjectCode, faculty } })
}

export async function bulkCreateStudents(students) {
  return request('/students/bulk', { method: 'POST', body: { students } })
}

export async function bulkFacultyMapping(mappings) {
  return request('/students/bulk-faculty', { method: 'POST', body: { mappings } })
}

export async function bulkDuesUpdate(dues) {
  return request('/students/bulk-dues', { method: 'POST', body: { dues } })
}

export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('document', file)
  return request('/upload', { method: 'POST', body: formData })
}
