import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import FacultyAssignment from './FacultyAssignment'
import AdminApproval from './AdminApproval'
import BulkUploadPage from './BulkUploadPage'

export default function AdminDashboard() {
  const [page, setPage] = useState('faculty')
  return (
    <DashboardLayout role="admin" activePage={page} setActivePage={setPage}>
      {page === 'faculty' ? <FacultyAssignment /> :
       page === 'approval' ? <AdminApproval /> :
       <BulkUploadPage />}
    </DashboardLayout>
  )
}