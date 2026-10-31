'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BRANCHES, PLACEMENT_OPTIONS } from '@/lib/constants'
import { bulkCreateStudents, bulkFacultyMapping, bulkDuesUpdate, updatePlacement } from '@/lib/api-client'
import CSVUploader from '@/components/CSVUploader'
import SemBranchSectionSelector from '@/components/SemBranchSectionSelector'
import Badge from '@/components/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/ui/PageHeader'

const STUDENT_CSV = `USN,Name,BranchCode,Semester,Section,Password,Placement
1AT23CG001,Aarav Sharma,CG,6,A,1AT23CG001,Placed
1AT23CG002,Aditi Kumar,CG,6,A,1AT23CG002,Unplaced
1AT23CS001,Akash Reddy,CS,6,B,1AT23CS001,Higher Studies
1AT23IS001,Ananya Rao,IS,6,A,1AT23IS001,Placed`

const FACULTY_CSV = `USN,SubjectCode,Faculty
1AT23CG001,CG601,Dr. Priya Kumar
1AT23CG001,CG602,Prof. Suresh M.
1AT23CG001,CG6L1,Dr. Lakshmi N.
1AT23CG002,CG601,Dr. Priya Kumar`

const DUES_CSV = `USN,HostelDue,LibraryDue,FeesDue
1AT23CG001,0,0,0
1AT23CG002,3500,0,25000
1AT23CS001,,500,
1AT23IS001,0,0,0`

const TABS = [
  { id: 'students', label: 'Bulk Upload Students', icon: 'fa-users' },
  { id: 'faculty', label: 'Bulk Faculty Mapping', icon: 'fa-user-tie' },
  { id: 'dues', label: 'Bulk Dues Upload', icon: 'fa-indian-rupee-sign' },
  { id: 'placement', label: 'Update Placements', icon: 'fa-briefcase' }
]

export default function BulkUploadClient({ students, stats, sem, branch, section, search }) {
  const router = useRouter()
  const [tab, setTab] = useState('students')
  const [placementFilter, setPlacementFilter] = useState('')
  const [savingUsn, setSavingUsn] = useState(null)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const refresh = () => startTransition(() => router.refresh())

  const setPlacement = async (usn, placement) => {
    setSavingUsn(usn)
    setError('')
    try {
      await updatePlacement(usn, placement || null)
      refresh()
    } catch (err) {
      setError(err.message || 'Failed to update placement')
    } finally {
      setSavingUsn(null)
    }
  }

  const visible = students.filter((s) => {
    if (!placementFilter) return true
    if (placementFilter === '__none__') return !s.placement
    return s.placement === placementFilter
  })

  return (
    <div className="fade-in">
      <PageHeader title="Bulk Upload & Mapping" subtitle="Upload student data, map faculty, update dues and placements via CSV" />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2 p-3">
          {TABS.map((t) => (
            <Button
              key={t.id}
              onClick={() => setTab(t.id)}
              variant={tab === t.id ? 'primary' : 'secondary'}
              size="sm"
              className="flex items-center gap-2">
              <i className={`fas ${t.icon} text-xs`} />{t.label}
            </Button>
          ))}
        </div>
      </Card>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <i className="fas fa-circle-exclamation text-red-500 text-xs" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {tab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <CSVUploader
            title="Upload Students"
            description="Add new students or update details for existing ones. A login is created for each row."
            columns={['USN', 'Name', 'BranchCode', 'Semester', 'Section', 'Password', 'Placement']}
            sampleCSV={STUDENT_CSV}
            acceptText="Password defaults to USN if left empty. Placement values: Placed, Unplaced, Higher Studies, Entrepreneurship, Not Eligible, or leave empty."
            onUpload={async (rows) => {
              const result = await bulkCreateStudents(rows)
              refresh()
              return result
            }}
          />
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-1">Total Students</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-2xl font-bold text-slate-800">{stats.withPlacement}</p>
                <p className="text-xs text-slate-500 mt-1">With Placement Data</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-2xl font-bold text-slate-800">{stats.total - stats.withPlacement}</p>
                <p className="text-xs text-slate-500 mt-1">Placement Not Set</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'faculty' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <CSVUploader
            title="Map Faculty to Students"
            description="Assign faculty members to specific subjects for each student"
            columns={['USN', 'SubjectCode', 'Faculty']}
            sampleCSV={FACULTY_CSV}
            acceptText="Each row maps one faculty to one subject for one student. Multiple rows per student for multiple subjects."
            onUpload={async (rows) => {
              const result = await bulkFacultyMapping(rows)
              refresh()
              return result
            }}
          />
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <i className="fas fa-lightbulb text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> You can also set faculty one-by-one from the &quot;Faculty Assignment&quot; page. Use this for bulk mapping an entire section at once.
            </p>
          </div>
        </div>
      )}

      {tab === 'dues' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <CSVUploader
            title="Bulk Dues Upload"
            description="Set hostel, library and fees dues for multiple students at once"
            columns={['USN', 'HostelDue', 'LibraryDue', 'FeesDue']}
            sampleCSV={DUES_CSV}
            acceptText="Leave empty = not set yet. Put 0 = cleared. Put a number = pending due amount."
            onUpload={async (rows) => {
              const result = await bulkDuesUpdate(rows)
              refresh()
              return result
            }}
          />
        </div>
      )}

      {tab === 'placement' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Update Placement Status</h3>
            <p className="text-sm text-slate-500 mt-0.5">Quickly update placement status for individual students</p>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <SemBranchSectionSelector sem={sem} branch={branch} section={section} search={search} />
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                <option value="">All Placement Status</option>
                {PLACEMENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                <option value="__none__">Not Set</option>
              </select>
              <div className="flex items-center gap-2">
                <Badge type="ok">{stats.placed} Placed</Badge>
                <Badge type="no">{stats.unplaced} Unplaced</Badge>
                <Badge type="neutral">{stats.withPlacement} Set</Badge>
              </div>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sem</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Placement</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{s.name}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{BRANCHES.find((b) => b.code === s.branchCode)?.short}</td>
                    <td className="px-4 py-2.5 text-center text-xs text-slate-500">{s.semester}</td>
                    <td className="px-4 py-2.5 text-center">
                      <select
                        value={s.placement || ''}
                        onChange={(e) => setPlacement(s.usn, e.target.value)}
                        disabled={savingUsn === s.usn}
                        className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer disabled:opacity-60">
                        <option value="">Not Set</option>
                        {PLACEMENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">{search ? `No students found matching "${search}"` : 'No students match these filters'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
