import { createContext, useContext, useEffect, useReducer } from 'react'
import { getMe, login as apiLogin, setAuthToken } from '../api'
import { INITIAL_STUDENTS, getSubjects, FACULTY_POOL } from '../data/mockData'

const AppContext = createContext()

function normalizeUser(user) {
  if (!user) return null
  if (user.role === 'student') {
    return {
      role: 'student',
      usn: user.usn,
      name: user.name,
      branchCode: user.student?.branchCode,
      section: user.student?.section,
      semester: user.student?.semester
    }
  }
  return { role: user.role, name: user.name }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, initializing: false }
    case 'LOGOUT':
      return { ...state, currentUser: null, initializing: false }
    case 'INITIALIZE':
      return { ...state, currentUser: action.payload, initializing: false }
    case 'UPDATE_FACULTY': {
      const { usn, subjectCode, faculty } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, subjects: s.subjects.map(sub => sub.code === subjectCode ? { ...sub, faculty } : sub) } : s) }
    }
    case 'UPDATE_CLEARANCE': {
      const { usn, subjectCode, clearance, remarks } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, subjects: s.subjects.map(sub => sub.code === subjectCode ? { ...sub, clearance, remarks: remarks || '' } : sub) } : s) }
    }
    case 'UPDATE_DUE': {
      const { usn, dueType, value } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, [dueType]: value } : s) }
    }
    case 'UPDATE_CC': {
      const { usn, approval } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, ccApproval: approval } : s) }
    }
    case 'UPDATE_ADMIN': {
      const { usn, approval } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, adminApproval: approval, hallTicketIssued: approval === 'approved' } : s) }
    }
    case 'UPDATE_PLACEMENT': {
      const { usn, placement } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, placement } : s) }
    }
    case 'UPDATE_PASSWORD': {
      const { usn, password } = action.payload
      return { ...state, students: state.students.map(s => s.usn === usn ? { ...s, password } : s) }
    }
    case 'BULK_UPLOAD_STUDENTS': {
      const { newStudents } = action.payload
      const existingUSNs = new Set(state.students.map(s => s.usn))
      const toAdd = newStudents.map(row => {
        const subjects = getSubjects(Number(row.Semester), row.BranchCode).map((s, si) => ({
          code: s.code, name: s.name, type: s.type,
          faculty: FACULTY_POOL[si % FACULTY_POOL.length],
          clearance: 'yes', remarks: ''
        }))
        return {
          usn: row.USN, name: row.Name, semester: Number(row.Semester),
          branchCode: row.BranchCode, section: row.Section,
          password: row.Password || row.USN,
          placement: row.Placement || null,
          subjects, hostelDue: null, libraryDue: null, feesDue: null,
          ccApproval: null, adminApproval: null, hallTicketIssued: false
        }
      }).filter(s => !existingUSNs.has(s.usn))
      const updates = newStudents.filter(r => existingUSNs.has(r.USN))
      let updated = [...state.students, ...toAdd]
      updates.forEach(row => {
        updated = updated.map(s => {
          if (s.usn !== row.USN) return s
          return { ...s, placement: row.Placement || s.placement, password: row.Password || s.password }
        })
      })
      return { ...state, students: updated }
    }
    case 'BULK_UPLOAD_DUES': {
      const { dues } = action.payload
      const dueMap = {}
      dues.forEach(d => { dueMap[d.USN] = d })
      return {
        ...state,
        students: state.students.map(s => {
          if (!dueMap[s.usn]) return s
          const d = dueMap[s.usn]
          return {
            ...s,
            hostelDue: d.HostelDue === '' ? null : d.HostelDue === '0' ? 0 : Number(d.HostelDue) || null,
            libraryDue: d.LibraryDue === '' ? null : d.LibraryDue === '0' ? 0 : Number(d.LibraryDue) || null,
            feesDue: d.FeesDue === '' ? null : d.FeesDue === '0' ? 0 : Number(d.FeesDue) || null
          }
        })
      }
    }
    case 'BULK_MAP_FACULTY': {
      const { mappings } = action.payload
      return {
        ...state,
        students: state.students.map(s => {
          const studentMaps = mappings.filter(m => m.USN === s.usn)
          if (studentMaps.length === 0) return s
          return {
            ...s,
            subjects: s.subjects.map(sub => {
              const map = studentMaps.find(m => m.SubjectCode === sub.code)
              return map ? { ...sub, faculty: map.Faculty } : sub
            })
          }
        })
      }
    }
    default: return state
  }
}

const initialState = { currentUser: null, initializing: true, students: INITIAL_STUDENTS }

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      dispatch({ type: 'INITIALIZE', payload: null })
      return
    }

    setAuthToken(token)
    getMe()
      .then(data => {
        dispatch({ type: 'INITIALIZE', payload: normalizeUser(data.user) })
      })
      .catch(() => {
        setAuthToken(null)
        dispatch({ type: 'INITIALIZE', payload: null })
      })
  }, [])

  const loginUser = async (credentials) => {
    const data = await apiLogin(credentials)
    dispatch({ type: 'LOGIN', payload: normalizeUser(data.user) })
  }

  const logoutUser = () => {
    setAuthToken(null)
    dispatch({ type: 'LOGOUT' })
  }

  return <AppContext.Provider value={{ state, dispatch, loginUser, logoutUser }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export default AppContext