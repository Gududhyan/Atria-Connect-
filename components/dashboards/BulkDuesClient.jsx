'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { bulkDuesUpdate } from '@/lib/api-client'
import CSVUploader from '@/components/CSVUploader'
import PageHeader from '@/components/ui/PageHeader'

const DUES_CSV = `USN,HostelDue,LibraryDue,FeesDue
1AT23CG001,0,0,0
1AT23CG002,3500,0,25000
1AT23CS001,,500,
1AT23IS001,0,0,0`

export default function BulkDuesClient() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <div className="fade-in">
      <PageHeader title="Bulk Upload Dues" subtitle="Set hostel, library and fees dues for many students at once" />

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <CSVUploader
          title="Bulk Dues Upload"
          description="Set hostel, library and fees dues for multiple students at once"
          columns={['USN', 'HostelDue', 'LibraryDue', 'FeesDue']}
          sampleCSV={DUES_CSV}
          acceptText="Leave empty = not set yet. Put 0 = cleared. Put a number = pending due amount."
          onUpload={async (rows) => {
            const result = await bulkDuesUpdate(rows)
            startTransition(() => router.refresh())
            return result
          }}
        />
      </div>
    </div>
  )
}
