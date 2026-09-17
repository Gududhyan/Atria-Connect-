'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FACULTY_POOL } from '@/lib/constants'
import { updateFaculty } from '@/lib/api-client'
import SemBranchSectionSelector from '@/components/SemBranchSectionSelector'
import Badge from '@/components/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/ui/PageHeader'

export default function FacultyAssignmentClient({ students, sem, branch, section }) {
  const router = useRouter()
  const [selectedUsn, setSelectedUsn] = useState(null)
  const [savingCode, setSavingCode] = useState(null)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const selected = students.find((s) => s.usn === selectedUsn) || null

  const assign = async (usn, subjectCode, faculty) => {
    setSavingCode(subjectCode)
    setError('')
    try {
      await updateFaculty(usn, subjectCode, faculty)
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message || 'Failed to assign faculty')
    } finally {
      setSavingCode(null)
    }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Faculty Assignment" subtitle="Assign faculty members to subjects for each student" />

      <Card className="mb-6">
        <div className="p-4">
          <SemBranchSectionSelector sem={sem} branch={branch} section={section} />
        </div>
      </Card>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <i className="fas fa-circle-exclamation text-red-500 text-xs" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-700">{students.length} students found</p>
        </div>
        <div className="max-h-[55vh] overflow-y-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                  <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                  <td className="px-4 py-3 text-center">
                    <Button onClick={() => setSelectedUsn(s.usn)} variant="secondary" size="sm" className="px-3 py-2">
                      <i className="fas fa-pen-to-square mr-1" />Assign
                    </Button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">No students match these filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUsn(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Assign Faculty</h3>
                <p className="text-sm text-slate-500">{selected.usn} — {selected.name}</p>
              </div>
              <button onClick={() => setSelectedUsn(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto scrollbar-thin">
              {selected.subjects.map((sub) => (
                <div key={sub.code} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-400">{sub.code} · {sub.type}</p>
                  </div>
                  {savingCode === sub.code && <i className="fas fa-circle-notch fa-spin text-slate-400 text-xs" />}
                  <select
                    value={sub.faculty || ''}
                    onChange={(e) => assign(selected.usn, sub.code, e.target.value)}
                    disabled={savingCode === sub.code}
                    className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm cursor-pointer disabled:opacity-60">
                    <option value="" disabled>Unassigned</option>
                    {FACULTY_POOL.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
