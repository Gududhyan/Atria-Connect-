import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FACULTY_POOL, REMARKS_OPTIONS } from '../../data/mockData'
import DashboardLayout from '../../components/DashboardLayout'
import SemBranchSectionSelector from '../../components/SemBranchSectionSelector'
import Badge from '../../components/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/ui/PageHeader'

// Demo: logged in as first faculty in pool
const CURRENT_FACULTY = FACULTY_POOL[0]

export default function FacultyDashboard() {
  const { state, dispatch } = useApp()
  const [page, setPage] = useState('clearance')
  const [sem, setSem] = useState(5)
  const [branch, setBranch] = useState('')
  const [section, setSection] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})

  const filtered = state.students
    .filter(s => s.semester === sem && (!branch || s.branchCode === branch) && (!section || s.section === section))
    .map(s => ({ ...s, assigned: s.subjects.filter(sub => sub.faculty === CURRENT_FACULTY) }))
    .filter(s => s.assigned.length > 0)

  const openClearance = (s) => {
    setSelected(s)
    const f = {}
    s.assigned.forEach(sub => {
      let remarksArray = []
      let customRemark = ''
      
      if (sub.remarks) {
        if (sub.remarks.includes(' | ')) {
          // Split by ' | ' separator
          const parts = sub.remarks.split(' | ')
          const selectedPart = parts[0]
          customRemark = parts.slice(1).join(' | ')
          remarksArray = selectedPart ? selectedPart.split(', ').map(r => r.trim()).filter(Boolean) : []
        } else if (typeof sub.remarks === 'string' && REMARKS_OPTIONS.some(opt => sub.remarks.includes(opt))) {
          // Old format - just selected reasons
          remarksArray = sub.remarks.split(', ').map(r => r.trim()).filter(r => REMARKS_OPTIONS.includes(r))
          customRemark = sub.remarks.split(', ').map(r => r.trim()).filter(r => !REMARKS_OPTIONS.includes(r)).join(', ')
        } else if (typeof sub.remarks === 'string') {
          // Custom text only
          customRemark = sub.remarks
        } else if (Array.isArray(sub.remarks)) {
          remarksArray = sub.remarks
        }
      }
      
      f[sub.code] = { clearance: sub.clearance, remarks: remarksArray, customRemark }
    })
    setForm(f)
  }

  const saveClearance = () => {
    Object.entries(form).forEach(([code, val]) => {
      if (val.clearance === 'no' && (!val.remarks || val.remarks.length === 0) && !val.customRemark?.trim()) return
      const selectedReasons = (val.remarks || []).join(', ')
      const customText = val.customRemark?.trim() || ''
      const remarksStr = [selectedReasons, customText].filter(Boolean).join(' | ')
      dispatch({ type: 'UPDATE_CLEARANCE', payload: { usn: selected.usn, subjectCode: code, clearance: val.clearance, remarks: remarksStr } })
    })
    setSelected(null)
  }

  const markAllClear = () => {
    if (filtered.length === 0) {
      alert('No students found for selected filters')
      return
    }
    if (!window.confirm(`Mark all ${filtered.length} students as cleared for their assigned subjects?`)) {
      return
    }
    filtered.forEach(s => {
      s.assigned.forEach(sub => {
        dispatch({ type: 'UPDATE_CLEARANCE', payload: { usn: s.usn, subjectCode: sub.code, clearance: 'yes', remarks: '' } })
      })
    })
    alert(`Successfully marked ${filtered.length} students as cleared!`)
  }

  const markAllSubjectsClear = () => {
    if (!selected) return
    const updated = {}
    selected.assigned.forEach(sub => {
      updated[sub.code] = { clearance: 'yes', remarks: '' }
    })
    setForm(updated)
  }

  const updateForm = (code, field, value) => {
    setForm(prev => ({ ...prev, [code]: { ...prev[code], [field]: value } }))
  }

  const toggleRemark = (code, remark) => {
    setForm(prev => {
      const current = prev[code].remarks || []
      const updated = current.includes(remark) ? current.filter(r => r !== remark) : [...current, remark]
      return { ...prev, [code]: { ...prev[code], remarks: updated } }
    })
  }

  const updateCustomRemark = (code, text) => {
    setForm(prev => ({ ...prev, [code]: { ...prev[code], customRemark: text } }))
  }

  return (
    <DashboardLayout role="faculty" activePage={page} setActivePage={setPage} extra={CURRENT_FACULTY}>
      <div className="fade-in">
        <div className="flex items-center justify-between mb-6">
          <PageHeader title="Subject Clearance" subtitle={`Logged in as ${CURRENT_FACULTY} — Only your assigned subjects are shown`} />
          <Button onClick={markAllClear} variant="primary" className="px-6 py-2 whitespace-nowrap">
            <i className="fas fa-check-double mr-2"></i>ALL CLEAR
          </Button>
        </div>

        <Card className="mb-6">
          <div className="p-4">
            <SemBranchSectionSelector sem={sem} setSem={setSem} branch={branch} setBranch={setBranch} section={section} setSection={setSection} />
          </div>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <i className="fas fa-triangle-exclamation text-amber-600 mt-0.5"></i>
          <div>
            <p className="text-sm font-semibold text-amber-800">Important</p>
            <p className="text-sm text-amber-700">If marking "Not Cleared", you <strong>must</strong> provide a reason. Clearance without remarks is accepted directly.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-700">{filtered.length} students with your assigned subjects</p>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <i className="fas fa-inbox text-3xl text-slate-300 mb-3"></i>
              <p className="text-sm text-slate-500">No students found with your assigned subjects in this selection</p>
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">USN</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sec</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Your Subjects</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const allOk = s.assigned.every(sub => sub.clearance === 'yes')
                    return (
                      <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                        <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {s.assigned.map(sub => (
                              <div key={sub.code} className="flex items-center gap-2">
                                {sub.clearance === 'yes' ? <i className="fas fa-circle-check text-ok text-xs"></i> : <i className="fas fa-circle-xmark text-no text-xs"></i>}
                                <span className="text-xs text-slate-600">{sub.name}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {allOk ? <Badge type="ok">All Clear</Badge> : <Badge type="warn">Pending</Badge>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button onClick={() => openClearance(s)} variant="secondary" size="sm" className="px-3 py-2">
                            <i className="fas fa-check-double mr-1"></i>Update
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

        {/* Clearance Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden fade-in" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Update Clearance</h3>
                  <p className="text-sm text-slate-500">{selected.usn} — {selected.name}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><i className="fas fa-xmark"></i></button>
              </div>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <p className="text-sm font-semibold text-slate-700">Subject Clearance Status</p>
                  <button onClick={markAllSubjectsClear}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-atria text-white hover:bg-atria-dark transition-all shadow-sm shadow-atria/20">
                    <i className="fas fa-check-double mr-1"></i>Clear All Subjects
                  </button>
                </div>
                {selected.assigned.map(sub => {
                  const fv = form[sub.code] || { clearance: sub.clearance, remarks: [], customRemark: '' }
                  const isNo = fv.clearance === 'no'
                  const missingReason = isNo && (!fv.remarks || fv.remarks.length === 0) && !fv.customRemark?.trim()
                  return (
                    <div key={sub.code} className={`p-4 rounded-xl border-2 transition-colors ${missingReason ? 'border-no/50 bg-no-light/30' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{sub.name}</p>
                          <p className="text-xs text-slate-400">{sub.code} · {sub.type}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => updateForm(sub.code, 'clearance', 'yes')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${fv.clearance === 'yes' ? 'bg-ok text-white shadow-sm shadow-ok/30' : 'bg-ok-light text-ok hover:bg-ok/10'}`}>
                            <i className="fas fa-check mr-1"></i>YES
                          </button>
                          <button onClick={() => updateForm(sub.code, 'clearance', 'no')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${fv.clearance === 'no' ? 'bg-no text-white shadow-sm shadow-no/30' : 'bg-no-light text-no hover:bg-no/10'}`}>
                            <i className="fas fa-xmark mr-1"></i>NO
                          </button>
                        </div>
                      </div>
                      {isNo && (
                        <div>
                          <label className="block text-xs font-bold text-no uppercase tracking-wider mb-2">Reasons (select one or more)</label>
                          <div className="space-y-2 mb-3">
                            {REMARKS_OPTIONS.map(remark => (
                              <label key={remark} className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-2 rounded transition-colors">
                                <input type="checkbox" checked={(fv.remarks || []).includes(remark)} onChange={() => toggleRemark(sub.code, remark)}
                                  className="w-4 h-4 accent-no rounded" />
                                <span className="text-sm text-slate-700">{remark}</span>
                              </label>
                            ))}
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Additional Notes</label>
                            <textarea value={fv.customRemark || ''} onChange={e => updateCustomRemark(sub.code, e.target.value)}
                              placeholder="Add custom reason or notes..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-no/30 resize-none"
                              rows="3" />
                          </div>
                          {missingReason && <p className="text-xs text-no mt-2"><i className="fas fa-exclamation-circle mr-1"></i>Please select at least one reason or add custom notes</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button onClick={saveClearance} className="flex-1 py-2.5 bg-atria text-white rounded-lg text-sm font-semibold hover:bg-atria-dark transition-colors shadow-lg shadow-atria/20">Save Clearance</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}