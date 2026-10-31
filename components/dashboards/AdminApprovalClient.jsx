'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BRANCHES, SEMESTERS, SECTIONS, PLACEMENT_OPTIONS } from '@/lib/constants'
import { updateAdminApproval, updateStudentDetails } from '@/lib/api-client'
import { hallTicketBlocker } from '@/lib/rules'
import SemBranchSectionSelector from '@/components/SemBranchSectionSelector'
import Badge from '@/components/Badge'
import DueDisplay from '@/components/DueDisplay'
import Button from '@/components/ui/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/ui/PageHeader'
import DocumentPreviewModal from '@/components/DocumentPreviewModal'

export default function AdminApprovalClient({ students, sem, branch, section, search }) {
  const router = useRouter()
  const [detailUsn, setDetailUsn] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [busyUsn, setBusyUsn] = useState(null)
  const [error, setError] = useState('')
  const [rejectModalStudent, setRejectModalStudent] = useState(null)
  const [rejectFeedback, setRejectFeedback] = useState('')
  const [editModalStudent, setEditModalStudent] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [, startTransition] = useTransition()

  const detail = students.find((s) => s.usn === detailUsn) || null

  const canApprove = (s) => hallTicketBlocker(s) === null

  const issue = async (usn) => {
    setBusyUsn(usn)
    setError('')
    try {
      await updateAdminApproval(usn, 'approved', '')
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message || 'Failed to issue hall ticket')
    } finally {
      setBusyUsn(null)
    }
  }

  const openRejectModal = (student) => {
    setRejectModalStudent(student)
    setRejectFeedback(student.adminRemarks || '')
  }

  const canConfirmReject = rejectFeedback.trim().length >= 3

  const confirmReject = async () => {
    if (!rejectModalStudent) return
    const feedback = rejectFeedback.trim()
    if (feedback.length < 3) {
      setError('A specific reason (minimum 3 characters) is required to reject.')
      return
    }
    const usn = rejectModalStudent.usn
    setBusyUsn(usn)
    setError('')
    try {
      await updateAdminApproval(usn, 'rejected', feedback)
      setRejectModalStudent(null)
      setRejectFeedback('')
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message || 'Failed to reject hall ticket')
    } finally {
      setBusyUsn(null)
    }
  }

  // Quote every text cell and defuse leading =,+,-,@ so spreadsheet apps
  // don't execute names/remarks as formulas (CSV injection).
  const csvCell = (value) => {
    const text = String(value ?? '')
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }

  const exportToCSV = () => {
    if (students.length === 0) return
    const headers = [
      'USN',
      'Student Name',
      'Semester',
      'Branch',
      'Section',
      'Subjects Cleared',
      'Total Subjects',
      'Hostel Due',
      'Library Due',
      'Fees Due',
      'Total Dues',
      'CC Approval',
      'CC Feedback',
      'Admin Hall Ticket Status',
      'Admin Feedback',
      'Placement'
    ]

    const rows = students.map((s) => {
      const cleared = s.subjects.filter((sub) => sub.clearance === 'yes').length
      const total = s.subjects.length
      const totalDue = (s.hostelDue || 0) + (s.libraryDue || 0) + (s.feesDue || 0)
      const adminStatus = s.hallTicketIssued ? 'Issued' : s.adminApproval === 'rejected' ? 'Rejected' : 'Pending'
      return [
        s.usn,
        csvCell(s.name),
        s.semester,
        s.branchCode,
        s.section,
        cleared,
        total,
        s.hostelDue || 0,
        s.libraryDue || 0,
        s.feesDue || 0,
        totalDue,
        s.ccApproval || 'pending',
        csvCell(s.ccRemarks),
        adminStatus,
        csvCell(s.adminRemarks),
        csvCell(s.placement)
      ]
    })

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `hall_ticket_clearance_${branch || 'ALL'}_sem${sem || 'ALL'}_sec${section || 'ALL'}_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const openEditModal = (student) => {
    setEditModalStudent(student)
    setEditForm({
      name: student.name || '',
      semester: student.semester || 1,
      branchCode: student.branchCode || 'CG',
      section: student.section || 'A',
      placement: student.placement || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editModalStudent || savingEdit) return
    setSavingEdit(true)
    setError('')
    try {
      await updateStudentDetails(editModalStudent.usn, {
        name: editForm.name,
        semester: Number(editForm.semester),
        branchCode: editForm.branchCode,
        section: editForm.section,
        placement: editForm.placement || null
      })
      setEditModalStudent(null)
      startTransition(() => router.refresh())
    } catch (err) {
      setError(err.message || 'Failed to update student details')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Hall Ticket Approval" subtitle="Issue hall tickets to fully cleared students, manage rejections, or update student details" />

      <Card className="mb-6">
        <div className="p-4">
          <SemBranchSectionSelector sem={sem} branch={branch} section={section} search={search} />
        </div>
      </Card>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <i className="fas fa-circle-exclamation text-red-500 text-xs" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8ECF2] bg-slate-50/60 flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-semibold text-slate-700">
            {students.length} students found{search ? ` matching "${search}"` : ''}
          </p>
          <Button onClick={exportToCSV} variant="secondary" size="xs" disabled={students.length === 0} title="Export current filtered student list to CSV">
            <i className="fas fa-file-csv mr-1.5 text-emerald-600" />
            Export CSV ({students.length})
          </Button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sec</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subjects</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dues</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">CC Status</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hall Ticket</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const cleared = s.subjects.filter((sub) => sub.clearance === 'yes').length
                const total = s.subjects.length
                const hasDues = s.hostelDue || s.libraryDue || s.feesDue
                const ready = canApprove(s)
                const busy = busyUsn === s.usn
                return (
                  <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                    <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                    <td className="px-4 py-3 text-center"><Badge type={cleared === total ? 'ok' : 'warn'}>{cleared}/{total}</Badge></td>
                    <td className="px-4 py-3 text-center">{hasDues ? <Badge type="no">Due</Badge> : <Badge type="ok">Clear</Badge>}</td>
                    <td className="px-4 py-3 text-center">
                      {s.ccApproval === 'approved' ? (
                        <Badge type="ok"><i className="fas fa-signature mr-1" />Approved</Badge>
                      ) : s.ccApproval === 'rejected' ? (
                        <div className="inline-block" title={s.ccRemarks ? `CC Reason: ${s.ccRemarks}` : 'Rejected by CC'}>
                          <Badge type="no">CC Rejected</Badge>
                        </div>
                      ) : (
                        <Badge type="warn">CC Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.hallTicketIssued ? (
                        <Badge type="ok"><i className="fas fa-ticket mr-1" />Issued</Badge>
                      ) : s.adminApproval === 'rejected' ? (
                        <div className="inline-block" title={s.adminRemarks ? `Admin Reason: ${s.adminRemarks}` : 'Rejected by Admin'}>
                          <Badge type="no"><i className="fas fa-circle-xmark mr-1" />Rejected</Badge>
                        </div>
                      ) : ready ? (
                        <Badge type="info">Ready to Issue</Badge>
                      ) : (
                        <Badge type="neutral">Not Ready</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <Button onClick={() => setDetailUsn(s.usn)} variant="secondary" size="xs" title="View details">
                          <i className="fas fa-eye" />
                        </Button>
                        <Button onClick={() => openEditModal(s)} variant="secondary" size="xs" title="Edit student details">
                          <i className="fas fa-pen" />
                        </Button>

                        {/* If rejected: Provide option to change reject to accept/issue */}
                        {s.adminApproval === 'rejected' && (
                          <Button
                            onClick={() => issue(s.usn)}
                            variant="success"
                            size="xs"
                            title="Change Reject to Issue Hall Ticket (student completed requirements)"
                            disabled={busy}>
                            <i className={`fas ${busy ? 'fa-circle-notch fa-spin' : 'fa-check'} mr-1`} />
                            Approve
                          </Button>
                        )}

                        {/* If hall ticket was issued: Provide option to revoke/reject if needed */}
                        {s.hallTicketIssued && (
                          <Button
                            onClick={() => openRejectModal(s)}
                            variant="danger"
                            size="xs"
                            title="Revoke / Reject Hall Ticket"
                            disabled={busy}>
                            <i className="fas fa-xmark mr-1" />
                            Revoke
                          </Button>
                        )}

                        {/* If neither issued nor rejected: Allow Issue or Reject */}
                        {!s.hallTicketIssued && s.adminApproval !== 'rejected' && (
                          <>
                            <Button
                              onClick={() => issue(s.usn)}
                              variant={ready ? 'primary' : 'secondary'}
                              size="xs"
                              disabled={!ready || busy}
                              title={ready ? 'Issue Hall Ticket' : 'Student has pending clearances or dues'}>
                              <i className={`fas ${busy ? 'fa-circle-notch fa-spin' : 'fa-ticket'} mr-1`} />
                              Issue
                            </Button>
                            <Button
                              onClick={() => openRejectModal(s)}
                              variant="danger"
                              size="xs"
                              title="Reject Hall Ticket with feedback"
                              disabled={busy}>
                              <i className="fas fa-xmark" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {students.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">{search ? `No students found matching "${search}"` : 'No students match these filters'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Details & Decision Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailUsn(null)}>
          <div className="card rounded-[20px] shadow-modal w-full max-w-3xl max-h-[85vh] overflow-hidden fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Student Details — {detail.usn}</h3>
                <p className="text-sm text-slate-500">
                  {detail.name} · {BRANCHES.find((b) => b.code === detail.branchCode)?.name} · Section {detail.section} · Sem {detail.semester}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => { setDetailUsn(null); openEditModal(detail) }} variant="secondary" size="xs">
                  <i className="fas fa-pen mr-1" />Edit Details
                </Button>
                <button onClick={() => setDetailUsn(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                  <i className="fas fa-xmark" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin space-y-4">
              {/* Decision Status Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${detail.hallTicketIssued ? 'bg-emerald-50 border-emerald-200' : detail.adminApproval === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Admin Hall Ticket Decision:</span>
                    {detail.hallTicketIssued ? <Badge type="ok">Hall Ticket Issued</Badge>
                      : detail.adminApproval === 'rejected' ? <Badge type="no">Rejected by Admin</Badge>
                      : <Badge type="warn">Pending Admin Decision</Badge>}
                  </div>
                  {detail.adminApproval === 'rejected' && detail.adminRemarks && (
                    <p className="text-xs text-red-700 font-medium mt-1.5">
                      <i className="fas fa-comment-dots mr-1" /><strong>Rejection Reason:</strong> {detail.adminRemarks}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {detail.adminApproval === 'rejected' ? (
                    <Button
                      onClick={() => { issue(detail.usn); setDetailUsn(null) }}
                      variant="success"
                      size="sm"
                      title="Change status from Rejected to Approved & Issue">
                      <i className="fas fa-check mr-1.5" />Change to Approved & Issue
                    </Button>
                  ) : detail.hallTicketIssued ? (
                    <Button
                      onClick={() => { setDetailUsn(null); openRejectModal(detail) }}
                      variant="danger"
                      size="sm">
                      <i className="fas fa-xmark mr-1.5" />Revoke / Reject
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => { issue(detail.usn); setDetailUsn(null) }}
                        variant={canApprove(detail) ? 'primary' : 'secondary'}
                        size="sm"
                        disabled={!canApprove(detail)}
                        title={canApprove(detail) ? 'Issue Hall Ticket' : 'Clearances or dues pending'}>
                        <i className="fas fa-ticket mr-1.5" />Issue Hall Ticket
                      </Button>
                      <Button
                        onClick={() => { setDetailUsn(null); openRejectModal(detail) }}
                        variant="danger"
                        size="sm">
                        <i className="fas fa-xmark mr-1.5" />Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Subject Clearances</h4>
                <div className="space-y-2">
                  {detail.subjects.map((sub) => (
                    <div key={sub.code} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{sub.name}</p>
                        <p className="text-xs text-slate-400">{sub.faculty || 'Unassigned'}</p>
                      </div>
                      <div className="text-right">
                        {sub.clearance === 'yes' ? <Badge type="ok">YES</Badge> : <Badge type="no">NO</Badge>}
                        {sub.remarks && <p className="text-xs text-no mt-1 max-w-[200px]">{sub.remarks}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Dues Status</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Hostel', value: detail.hostelDue },
                    { label: 'Library', value: detail.libraryDue },
                    { label: 'Fees', value: detail.feesDue }
                  ].map((d) => (
                    <div key={d.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xs text-slate-500 mb-1">{d.label}</p>
                      <DueDisplay value={d.value} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">CC Status</h4>
                <div className="flex items-center gap-2">
                  <Badge type={detail.ccApproval === 'approved' ? 'ok' : detail.ccApproval === 'rejected' ? 'no' : 'warn'}>
                    {detail.ccApproval === 'approved' ? 'Approved by CC' : detail.ccApproval === 'rejected' ? 'Rejected by CC' : 'Pending CC Review'}
                  </Badge>
                  {detail.ccApproval === 'rejected' && detail.ccRemarks && (
                    <span className="text-xs text-red-600 font-medium italic">Reason: {detail.ccRemarks}</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Uploaded Documents</h4>
                {(detail.documents || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No documents uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detail.documents.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <i className="fas fa-file-alt text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 truncate">{doc.name}</span>
                          {doc.status === 'approved' && <Badge type="ok">Accepted</Badge>}
                          {doc.status === 'rejected' && <Badge type="no">Rejected</Badge>}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc) }}
                          className="text-xs font-bold text-atria hover:underline whitespace-nowrap">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity & Audit History */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Activity &amp; Audit History</h4>
                {(detail.activityLog || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {detail.activityLog.map((log, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-800">{log.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 gap-2">
                          <span>By: <strong className="text-slate-700">{log.performedBy || 'System'}</strong></span>
                          {log.remarks && <span className="text-slate-500 italic truncate max-w-[260px]" title={log.remarks}>{log.remarks}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
              <button onClick={() => setDetailUsn(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Hall Ticket Modal with Feedback */}
      {rejectModalStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRejectModalStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-circle-xmark text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Reject Hall Ticket</h3>
                <p className="text-xs text-slate-500 mt-0.5">{rejectModalStudent.name} ({rejectModalStudent.usn})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-2">
              Explain why this hall ticket is rejected or revoked so the student knows what needs resolution:
            </p>

            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="e.g. Fees clearance pending verification, Disciplinary review, Incomplete lab requirements..."
              rows="3"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none mb-2"
              autoFocus
            />

            {!canConfirmReject && (
              <p className="text-xs text-red-500 mb-3">
                <i className="fas fa-circle-info mr-1" />A specific reason (minimum 3 characters) is required to reject.
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button onClick={() => setRejectModalStudent(null)} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button onClick={confirmReject} variant="danger" size="sm" disabled={!canConfirmReject || busyUsn !== null}>
                <i className="fas fa-xmark mr-1" />Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Details Modal */}
      {editModalStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModalStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Edit Student Details</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editModalStudent.usn}</p>
              </div>
              <button onClick={() => setEditModalStudent(null)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <i className="fas fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">Student Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, semester: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria">
                    {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">Section</label>
                  <select
                    value={editForm.section}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, section: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria">
                    {SECTIONS.map((sec) => <option key={sec} value={sec}>Section {sec}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</label>
                <select
                  value={editForm.branchCode}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, branchCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria">
                  {BRANCHES.map((b) => <option key={b.code} value={b.code}>{b.name} ({b.short})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placement Status</label>
                <select
                  value={editForm.placement || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, placement: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria">
                  <option value="">Not Set</option>
                  {PLACEMENT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <Button onClick={() => setEditModalStudent(null)} variant="secondary" size="sm" disabled={savingEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} variant="primary" size="sm" disabled={savingEdit || !editForm.name.trim()}>
                {savingEdit ? <><i className="fas fa-circle-notch fa-spin mr-1" />Saving…</> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}
