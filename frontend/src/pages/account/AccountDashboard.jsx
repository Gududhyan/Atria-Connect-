import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import ManageDues from './ManageDues'

export default function AccountDashboard() {
  const [page, setPage] = useState('dues')
  return (
    <DashboardLayout role="account" activePage={page} setActivePage={setPage}>
      <ManageDues />
    </DashboardLayout>
  )
}