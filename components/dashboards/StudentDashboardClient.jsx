'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BRANCHES } from '@/lib/constants'
import { uploadDocument, deleteDocument } from '@/lib/api-client'
import Badge from '@/components/Badge'
import DocumentPreviewModal from '@/components/DocumentPreviewModal'

const PLACEMENT_STYLES = {
  Placed: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'fa-circle-check', dot: 'bg-emerald-500' },
  Unplaced: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: 'fa-circle-xmark', dot: 'bg-red-500' },
  'Higher Studies': { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', icon: 'fa-graduation-cap', dot: 'bg-sky-500' },
  Entrepreneurship: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'fa-rocket', dot: 'bg-amber-500' },
  'Not Eligible': { text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'fa-ban', dot: 'bg-slate-400' }
}

function ProgressRing({ value, max, size = 64, stroke = 6, color = '#C41E3A' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? value / max : 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  )
}

export default function StudentDashboardClient({ student }) {
  const router = useRouter()
  const [previewDoc, setPreviewDoc] = useState(null)
  const [pendingUpload, setPendingUpload] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  const branchInfo = BRANCHES.find((b) => b.code === student.branchCode)
  const documents = student.documents || []
  const clearedCount = student.subjects.filter((s) => s.clearance === 'yes').length
  const totalCount = student.subjects.length
  const hasDues = student.hostelDue || student.libraryDue || student.feesDue
  const allClear = clearedCount === totalCount && !hasDues
  const pStyle = PLACEMENT_STYLES[student.placement] || null
  const clearancePct = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0

  const dues = [
    { label: 'Hostel', value: student.hostelDue, icon: 'fa-building' },
    { label: 'Library', value: student.libraryDue, icon: 'fa-book' },
    { label: 'Fees', value: student.feesDue, icon: 'fa-indian-rupee-sign' }
  ]

  const refresh = () => startTransition(() => router.refresh())

  const confirmUpload = async () => {
    if (!pendingUpload || busy) return
    setBusy(true)
    setError('')
    try {
      await uploadDocument(student.usn, pendingUpload.file)
      setPendingUpload(null)
      refresh()
    } catch (err) {
      setError(err.message || 'Failed to upload')
    } finally {
      setBusy(false)
    }
  }

  const removeDoc = async (doc) => {
    if (!window.confirm(`Remove ${doc.name}?`)) return
    setError('')
    try {
      await deleteDocument(student.usn, doc._id)
      refresh()
    } catch (err) {
      setError(err.message || 'Failed to remove document')
    }
  }

  return (
    <div className="fade-in space-y-4">
      {/* Hero banner */}
      <div className="enterprise-card overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-atria px-8 py-8">
          <div className="absolute top-0 right-0 w-64 h-full opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute top-16 right-24 w-16 h-16 rounded-full border-2 border-white" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{student.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em] mb-0.5">Hall Ticket Portal</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">{student.name}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-slate-400 text-sm font-mono">{student.usn}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-slate-400 text-sm">{branchInfo?.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-slate-400 text-sm">Sem {student.semester} · Sec {student.section}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {student.hallTicketIssued ? (
                <div className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25">
                  <i className="fas fa-ticket" /> Hall Ticket Issued
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
                  <i className="fas fa-hourglass-half text-amber-400" /> Pending Approval
                </div>
              )}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border ${allClear ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <i className={`fas ${allClear ? 'fa-shield-halved' : 'fa-circle-exclamation'}`} />
                {allClear ? 'All Cleared' : 'Action Needed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subject clearances */}
        <div className="lg:col-span-2 enterprise-card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Subject Clearances</h2>
              <p className="text-xs text-slate-500 mt-0.5">Faculty sign-off on each enrolled subject</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <ProgressRing value={clearedCount} max={totalCount} size={52} stroke={5} color={clearedCount === totalCount ? '#16A34A' : '#C41E3A'} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-700">{clearancePct}%</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {clearedCount}<span className="text-slate-400 font-normal text-sm">/{totalCount}</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Cleared</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {student.subjects.map((sub) => (
              <div key={sub.code} className={`px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${sub.clearance !== 'yes' ? 'bg-red-50/50' : ''}`}>
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.clearance === 'yes' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{sub.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{sub.code}</span>
                      {sub.type === 'lab' && <span className="text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded-full font-bold uppercase">Lab</span>}
                      {sub.type === 'project' && <span className="text-[10px] text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full font-bold uppercase">Project</span>}
                      {sub.type === 'seminar' && <span className="text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-full font-bold uppercase">Seminar</span>}
                      {sub.type === 'internship' && <span className="text-[10px] text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-full font-bold uppercase">Intern</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5"><i className="fas fa-user-tie mr-1" />{sub.faculty || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  {sub.clearance === 'yes' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                      <i className="fas fa-check text-[10px]" /> Cleared
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
                      <i className="fas fa-xmark text-[10px]" /> Not Cleared
                    </span>
                  )}
                  {sub.remarks && (
                    <p className="text-[10px] text-red-500 mt-1 max-w-[180px] text-right">
                      <i className="fas fa-comment-dots mr-1" />{sub.remarks}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <div className="enterprise-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Financial Dues</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Hostel, Library &amp; Fees</p>
            </div>
            <div className="p-4 space-y-2.5">
              {dues.map((due) => {
                const isNull = due.value === null || due.value === undefined
                const isZero = due.value === 0
                return (
                  <div key={due.label} className={`flex items-center justify-between p-3 rounded-xl border ${isNull ? 'bg-slate-50 border-slate-200' : isZero ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${isNull ? 'bg-slate-200 text-slate-500' : isZero ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>
                        <i className={`fas ${due.icon}`} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{due.label}</span>
                    </div>
                    <div className="text-right">
                      {isNull ? <span className="text-[10px] font-bold text-slate-400 uppercase">N/A</span>
                        : isZero ? <span className="text-[10px] font-bold text-emerald-600 uppercase">Clear</span>
                        : <span className="text-sm font-bold text-red-600">₹{due.value.toLocaleString()}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="enterprise-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Sign-off Status</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">CC &amp; Admin approval chain</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                {
                  label: 'Class Coordinator',
                  icon: 'fa-user-check',
                  status: student.ccApproval,
                  successLabel: 'Signed & Approved',
                  remarks: student.ccRemarks
                },
                {
                  label: 'Admin Approval',
                  icon: 'fa-stamp',
                  status: student.hallTicketIssued ? 'approved' : student.adminApproval,
                  successLabel: 'Hall Ticket Issued',
                  remarks: student.adminRemarks
                }
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      <i className={`fas ${item.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{item.label}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${item.status === 'approved' ? 'text-emerald-600' : item.status === 'rejected' ? 'text-red-500' : 'text-amber-600'}`}>
                        {item.status === 'approved' ? item.successLabel : item.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                      </p>
                    </div>
                    <i className={`fas text-xs ${item.status === 'approved' ? 'fa-circle-check text-emerald-500' : item.status === 'rejected' ? 'fa-circle-xmark text-red-400' : 'fa-clock text-amber-400'}`} />
                  </div>
                  {item.status === 'rejected' && item.remarks && (
                    <div className="mt-2 pt-2 border-t border-red-100">
                      <p className="text-xs text-red-600 font-medium">
                        <i className="fas fa-circle-exclamation mr-1" />
                        Feedback: {item.remarks}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {student.placement && pStyle && (
            <div className={`enterprise-card overflow-hidden border ${pStyle.border}`}>
              <div className={`px-5 py-4 ${pStyle.bg}`}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Placement Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${pStyle.dot}`} />
                  <p className={`font-bold text-base ${pStyle.text}`}>{student.placement}</p>
                  <i className={`fas ${pStyle.icon} ml-auto ${pStyle.text}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document vault */}
      <div className="enterprise-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Document Vault</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload and manage your clearance certificates &amp; proofs</p>
          </div>
          <div>
            <input
              type="file"
              id="docUpload"
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => setPendingUpload({ name: file.name, url: ev.target.result, file })
                  reader.readAsDataURL(file)
                }
                e.target.value = ''
              }} />
            <label
              htmlFor="docUpload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm">
              <i className="fas fa-upload text-xs" /> Upload File
            </label>
          </div>
        </div>

        {pendingUpload && (
          <div className="mx-6 mt-5 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-200 text-amber-700 flex items-center justify-center">
                <i className="fas fa-file-arrow-up text-sm" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{pendingUpload.name}</p>
                <button
                  onClick={() => setPreviewDoc({ name: pendingUpload.name, url: pendingUpload.url })}
                  className="text-[11px] text-atria font-semibold hover:underline mt-0.5">
                  Preview before uploading →
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setPendingUpload(null)}
                disabled={busy}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={busy}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60">
                {busy ? <><i className="fas fa-circle-notch fa-spin mr-1" />Uploading…</> : 'Confirm Upload'}
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <i className="fas fa-circle-exclamation text-red-500 text-xs" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {documents.some((d) => d.status === 'rejected') && (
            <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
              <i className="fas fa-circle-exclamation text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700">Some documents were rejected</p>
                <div className="mt-1.5 space-y-1">
                  {documents.filter((d) => d.status === 'rejected').map((d) => (
                    <p key={d._id} className="text-xs text-red-600">
                      <span className="font-semibold">{d.name}:</span> {d.reason || 'No reason provided'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {documents.some((d) => d.status === 'approved') && (
            <div className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3">
              <i className="fas fa-circle-check text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-700">Some documents were accepted</p>
                <div className="mt-1.5 space-y-1">
                  {documents.filter((d) => d.status === 'approved').map((d) => (
                    <p key={d._id} className="text-xs text-emerald-700">{d.name}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <i className="fas fa-folder-open text-xl text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No documents uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload your clearance proofs and certificates above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc) => {
                const status = doc.status || 'pending'
                return (
                  <div
                    key={doc._id}
                    className={`group flex items-center gap-3 p-4 rounded-xl border hover:bg-white hover:shadow-sm transition-all ${status === 'rejected' ? 'border-red-200 bg-red-50/50' : status === 'approved' ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-atria flex items-center justify-center flex-shrink-0 shadow-sm">
                      <i className="fas fa-file-alt text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      <div className="mt-1">
                        {status === 'approved' && <Badge type="ok">Accepted</Badge>}
                        {status === 'rejected' && <Badge type="no">Rejected</Badge>}
                        {status === 'pending' && <Badge type="warn">Pending Review</Badge>}
                      </div>
                      {status === 'rejected' && doc.reason && (
                        <p className="text-[10px] text-red-500 mt-1"><i className="fas fa-comment-dots mr-1" />{doc.reason}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors">
                        <i className="fas fa-eye text-[10px]" />
                      </button>
                      <button
                        onClick={() => removeDoc(doc)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <i className="fas fa-trash-alt text-[10px]" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}
