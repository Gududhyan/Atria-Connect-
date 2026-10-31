'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { REMARKS_OPTIONS } from '@/lib/constants'
import { updateClearance, reviewDocument } from '@/lib/api-client'
import SemBranchSectionSelector from '@/components/SemBranchSectionSelector'
import Badge from '@/components/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/ui/PageHeader'
import DocumentPreviewModal from '@/components/DocumentPreviewModal'

// Splits the stored "reason a, reason b | free text" remark back into its parts.
function parseRemarks(raw) {
  if (!raw) return { remarks: [], customRemark: '' }
  if (raw.includes(' | ')) {
    const [selectedPart, ...rest] = raw.split(' | ')
    return {
      remarks: selectedPart ? selectedPart.split(', ').map((r) => r.trim()).filter(Boolean) : [],
      customRemark: rest.join(' | ')
    }
  }
  const parts = raw.split(', ').map((r) => r.trim())
  return {
    remarks: parts.filter((p) => REMARKS_OPTIONS.includes(p)),
    customRemark: parts.filter((p) => !REMARKS_OPTIONS.includes(p)).join(', ')
  }
}

function buildRemarks(value) {
  const selected = (value.remarks || []).join(', ')
  const custom = value.customRemark?.trim() || ''
  return [selected, custom].filter(Boolean).join(' | ')
}

export default function FacultyDashboardClient({ students, sem, branch, section, search, facultyName }) {
  const router = useRouter()
  const [selectedUsn, setSelectedUsn] = useState(null)
  const [form, setForm] = useState({})
  const [previewDoc, setPreviewDoc] = useState(null)
  const [rejectingDocId, setRejectingDocId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [, startTransition] = useTransition()

  // Only subjects this faculty member actually teaches.
  const withAssigned = students
    .map((s) => ({ ...s, assigned: s.subjects.filter((sub) => sub.faculty === facultyName) }))
    .filter((s) => s.assigned.length > 0)

  const selected = withAssigned.find((s) => s.usn === selectedUsn) || null
  const refresh = () => startTransition(() => router.refresh())

  const openClearance = (s) => {
    setSelectedUsn(s.usn)
    setError('')
    setRejectingDocId(null)
    setRejectReason('')
    const next = {}
    s.assigned.forEach((sub) => {
      next[sub.code] = { clearance: sub.clearance, ...parseRemarks(sub.remarks) }
    })
    setForm(next)
  }

  const closeClearance = () => {
    setSelectedUsn(null)
    setRejectingDocId(null)
    setRejectReason('')
    setError('')
  }

  const saveClearance = async () => {
    if (!selected || busy) return

    // Check if any subject is marked 'no' without a reason — block the save.
    const missingReasons = Object.entries(form).filter(
      ([, value]) => value.clearance === 'no' && !buildRemarks(value)
    )
    if (missingReasons.length > 0) {
      setError('Please add a reason for all subjects marked as not cleared before saving.')
      return
    }

    const payload = Object.entries(form)
      .map(([code, value]) => ({
        code,
        clearance: value.clearance,
        remarks: value.clearance === 'yes' ? '' : buildRemarks(value)
      }))

    if (payload.length === 0) {
      setError('No subjects to save.')
      return
    }

    setBusy(true)
    setError('')
    try {
      await updateClearance(selected.usn, payload)
      closeClearance()
      refresh()
    } catch (err) {
      setError(err.message || 'Failed to save clearance')
    } finally {
      setBusy(false)
    }
  }

  const markAllClear = async () => {
    if (withAssigned.length === 0) {
      setError('No students found for the selected filters')
      return
    }
    if (!window.confirm(`Mark all ${withAssigned.length} students as cleared for your assigned subjects?`)) return

    setBusy(true)
    setError('')
    try {
      await Promise.all(withAssigned.map((s) =>
        updateClearance(s.usn, s.assigned.map((sub) => ({ code: sub.code, clearance: 'yes', remarks: '' })))
      ))
      refresh()
    } catch (err) {
      setError(err.message || 'Failed to update clearances')
    } finally {
      setBusy(false)
    }
  }

  const markAllSubjectsClear = () => {
    if (!selected) return
    const next = {}
    selected.assigned.forEach((sub) => { next[sub.code] = { clearance: 'yes', remarks: [], customRemark: '' } })
    setForm(next)
  }

  const updateForm = (code, field, value) =>
    setForm((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }))

  const toggleRemark = (code, remark) =>
    setForm((prev) => {
      const current = prev[code].remarks || []
      return {
        ...prev,
        [code]: {
          ...prev[code],
          remarks: current.includes(remark) ? current.filter((r) => r !== remark) : [...current, remark]
        }
      }
    })

  const decideDocument = async (doc, status, reason) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await reviewDocument(selected.usn, doc._id, status, reason)
      setRejectingDocId(null)
      setRejectReason('')
      refresh()
    } catch (err) {
      setError(err.message || 'Failed to review document')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Subject Clearance" subtitle={`Logged in as ${facultyName} — only your assigned subjects are shown`} />
        <Button onClick={markAllClear} variant="primary" className="px-6 py-2 whitespace-nowrap" disabled={busy}>
          <i className="fas fa-check-double mr-2" />ALL CLEAR
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <SemBranchSectionSelector sem={sem} branch={branch} section={section} search={search} />
        </div>
      </Card>

      <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5">
        <i className="fas fa-triangle-exclamation text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Important</p>
          <p className="text-sm text-amber-700">
            If marking &quot;Not Cleared&quot;, you <strong>must</strong> provide a reason. Clearance without remarks is accepted directly.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <i className="fas fa-circle-exclamation text-red-500 text-xs" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8ECF2] bg-slate-50/60 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {withAssigned.length} students with your assigned subjects{search ? ` matching "${search}"` : ''}
          </p>
          {search && students.length > withAssigned.length && (
            <p className="text-xs text-slate-400">
              ({students.length - withAssigned.length} other matching students assigned to other faculty)
            </p>
          )}
        </div>

        {withAssigned.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-inbox text-3xl text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              {search && students.length > 0
                ? `Found ${students.length} student(s) matching "${search}", but none are assigned to you (${facultyName}).`
                : search
                  ? `No students found matching "${search}".`
                  : 'No students found with your assigned subjects in this selection.'}
            </p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sec</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Your Subjects</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Docs</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {withAssigned.map((s) => {
                  const allOk = s.assigned.every((sub) => sub.clearance === 'yes')
                  const docs = s.documents || []
                  return (
                    <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                      <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {s.assigned.map((sub) => (
                            <div key={sub.code} className="flex items-center gap-2">
                              <i className={`fas text-xs ${sub.clearance === 'yes' ? 'fa-circle-check text-ok' : 'fa-circle-xmark text-no'}`} />
                              <span className="text-xs text-slate-600">{sub.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {allOk ? <Badge type="ok">All Clear</Badge> : <Badge type="warn">Pending</Badge>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {docs.length > 0
                          ? <Badge type={docs.some((d) => (d.status || 'pending') === 'pending') ? 'warn' : 'info'}><i className="fas fa-paperclip mr-1" />{docs.length}</Badge>
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button onClick={() => openClearance(s)} variant="secondary" size="sm" className="px-3 py-2">
                          <i className="fas fa-check-double mr-1" />Update
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeClearance}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Update Clearance</h3>
                <p className="text-sm text-slate-500">{selected.usn} — {selected.name}</p>
              </div>
              <button onClick={closeClearance} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <p className="text-sm font-semibold text-slate-700">Subject Clearance Status</p>
                <button
                  onClick={markAllSubjectsClear}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-atria text-white hover:bg-atria-dark transition-all shadow-sm shadow-atria/20">
                  <i className="fas fa-check-double mr-1" />Clear All Subjects
                </button>
              </div>

              {selected.assigned.map((sub) => {
                const fv = form[sub.code] || { clearance: sub.clearance, remarks: [], customRemark: '' }
                const isNo = fv.clearance === 'no'
                const missingReason = isNo && !buildRemarks(fv)
                return (
                  <div key={sub.code} className={`p-4 rounded-xl border-2 transition-colors ${missingReason ? 'border-no/50 bg-no-light/30' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{sub.name}</p>
                        <p className="text-xs text-slate-400">{sub.code} · {sub.type}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setForm((prev) => ({ ...prev, [sub.code]: { ...prev[sub.code], clearance: 'yes', remarks: [], customRemark: '' } }))}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${fv.clearance === 'yes' ? 'bg-ok text-white shadow-sm shadow-ok/30' : 'bg-ok-light text-ok hover:bg-ok/10'}`}>
                          <i className="fas fa-check mr-1" />YES
                        </button>
                        <button
                          onClick={() => updateForm(sub.code, 'clearance', 'no')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isNo ? 'bg-no text-white shadow-sm shadow-no/30' : 'bg-no-light text-no hover:bg-no/10'}`}>
                          <i className="fas fa-xmark mr-1" />NO
                        </button>
                      </div>
                    </div>

                    {isNo && (
                      <div>
                        <label className="block text-xs font-bold text-no uppercase tracking-wider mb-2">Reasons (select one or more)</label>
                        <div className="space-y-2 mb-3">
                          {REMARKS_OPTIONS.map((remark) => (
                            <label key={remark} className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-2 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={(fv.remarks || []).includes(remark)}
                                onChange={() => toggleRemark(sub.code, remark)}
                                className="w-4 h-4 accent-no rounded" />
                              <span className="text-sm text-slate-700">{remark}</span>
                            </label>
                          ))}
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Additional Notes</label>
                          <textarea
                            value={fv.customRemark || ''}
                            onChange={(e) => updateForm(sub.code, 'customRemark', e.target.value)}
                            placeholder="Add custom reason or notes..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-no/30 resize-none"
                            rows="3" />
                        </div>
                        {missingReason && (
                          <p className="text-xs text-no mt-2"><i className="fas fa-exclamation-circle mr-1" />Please select at least one reason or add custom notes</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Uploaded documents — accept or reject with a reason */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2 mt-4">Uploaded Documents</h4>
                {(selected.documents || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No documents uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {selected.documents.map((doc) => {
                      const status = doc.status || 'pending'
                      const isRejectingThis = rejectingDocId === doc._id
                      return (
                        <div key={doc._id} className={`p-3 border rounded-lg ${status === 'rejected' ? 'bg-red-50 border-red-100' : status === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <i className="fas fa-file-alt text-slate-400" />
                              <span className="text-sm font-medium text-slate-700 truncate">{doc.name}</span>
                              {status === 'approved' && <Badge type="ok">Accepted</Badge>}
                              {status === 'rejected' && <Badge type="no">Rejected</Badge>}
                              {status === 'pending' && <Badge type="warn">Pending</Badge>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => setPreviewDoc(doc)} className="text-xs font-bold text-atria hover:underline whitespace-nowrap">
                                View
                              </button>
                              <button
                                onClick={() => decideDocument(doc, 'approved', '')}
                                disabled={busy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${status === 'approved' ? 'bg-ok text-white' : 'bg-ok-light text-ok hover:bg-ok/10'}`}>
                                <i className="fas fa-check mr-1" />Accept
                              </button>
                              <button
                                onClick={() => { setRejectingDocId(doc._id); setRejectReason(doc.reason || '') }}
                                disabled={busy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${status === 'rejected' ? 'bg-no text-white' : 'bg-no-light text-no hover:bg-no/10'}`}>
                                <i className="fas fa-xmark mr-1" />Reject
                              </button>
                            </div>
                          </div>

                          {status === 'rejected' && doc.reason && !isRejectingThis && (
                            <p className="text-xs text-no mt-2"><i className="fas fa-comment-dots mr-1" />{doc.reason}</p>
                          )}

                          {isRejectingThis && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Reason for rejection</label>
                              <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explain why this document is being rejected..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-no/30 resize-none"
                                rows="2"
                                autoFocus />
                              {!rejectReason.trim() && (
                                <p className="text-xs text-no mt-1"><i className="fas fa-exclamation-circle mr-1" />A reason is required to reject.</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => { setRejectingDocId(null); setRejectReason('') }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                                  Cancel
                                </button>
                                <button
                                  onClick={() => decideDocument(doc, 'rejected', rejectReason)}
                                  disabled={!rejectReason.trim() || busy}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-no text-white hover:opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                  Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeClearance}
                  disabled={busy}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={saveClearance}
                  disabled={busy}
                  className="flex-1 py-2.5 bg-atria text-white rounded-lg text-sm font-semibold hover:bg-atria-dark transition-colors shadow-lg shadow-atria/20 disabled:opacity-60">
                  {busy ? <><i className="fas fa-circle-notch fa-spin mr-1" />Saving…</> : 'Save Clearance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  )
}
