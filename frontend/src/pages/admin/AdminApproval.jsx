import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { BRANCHES } from '../../data/mockData'
import SemBranchSectionSelector from '../../components/SemBranchSectionSelector'
import Badge from '../../components/Badge'
import DueDisplay from '../../components/DueDisplay'
import Button from '../../components/ui/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/ui/PageHeader'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'

export default function AdminApproval() {
  const { state, dispatch } = useApp()
  const [sem, setSem] = useState(5)
  const [branch, setBranch] = useState('')
  const [section, setSection] = useState('')
  const [detail, setDetail] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  const filtered = state.students.filter(s =>
    s.semester === sem && (!branch || s.branchCode === branch) && (!section || s.section === section)
  )

  const canApprove = (s) =>
    s.subjects.every(sub => sub.clearance === 'yes') &&
    !s.hostelDue && !s.libraryDue && !s.feesDue &&
    s.ccApproval === 'approved'

  return (
    <div className="fade-in">
      <PageHeader title="Hall Ticket Approval" subtitle="Issue hall tickets to fully cleared students (all subjects, no dues, CC approval)" />

      <Card className="mb-6">
        <div className="p-4">
          <SemBranchSectionSelector sem={sem} setSem={setSem} branch={branch} setBranch={setBranch} section={section} setSection={setSection} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8ECF2] bg-slate-50/60 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{filtered.length} students found</p>
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
              {filtered.map(s => {
                const cleared = s.subjects.filter(sub => sub.clearance === 'yes').length
                const total = s.subjects.length
                const hasDues = s.hostelDue || s.libraryDue || s.feesDue
                const ready = canApprove(s)
                return (
                  <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                    <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                    <td className="px-4 py-3 text-center">
                      <Badge type={cleared === total ? 'ok' : 'warn'}>{cleared}/{total}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasDues ? <Badge type="no">Due</Badge> : <Badge type="ok">Clear</Badge>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.ccApproval === 'approved' ? <Badge type="ok"><i className="fas fa-signature mr-1"></i>Approved</Badge> :
                       s.ccApproval === 'rejected' ? <Badge type="no">Rejected</Badge> :
                       <Badge type="warn">Pending</Badge>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.hallTicketIssued ? (
                        <Badge type="ok" className="bg-ok text-white"><i className="fas fa-ticket mr-1"></i>Issued</Badge>
                      ) : ready ? (
                        <Badge type="info">Ready to Issue</Badge>
                      ) : (
                        <Badge type="neutral">Not Ready</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button onClick={() => setDetail(s)} variant="secondary" size="xs">
                          <i className="fas fa-eye"></i>
                        </Button>
                        {!s.hallTicketIssued && (
                          <Button
                            onClick={() => dispatch({ type: 'ISSUE_HALL_TICKET', payload: { usn: s.usn } })}
                            variant={ready ? 'primary' : 'secondary'}
                            size="xs"
                            disabled={!ready}
                            title={ready ? 'Issue Hall Ticket' : 'Student has pending clearances or dues'}
                          >
                            <i className="fas fa-ticket mr-1"></i>Issue
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="card rounded-[20px] shadow-modal w-full max-w-3xl max-h-[85vh] overflow-hidden fade-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Student Details — {detail.usn}</h3>
                <p className="text-sm text-slate-500">{detail.name} · {BRANCHES.find(b => b.code === detail.branchCode)?.name} · Section {detail.section}</p>
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><i className="fas fa-xmark"></i></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Subject Clearances</h4>
                <div className="space-y-2">
                  {detail.subjects.map(sub => (
                    <div key={sub.code} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div><p className="text-sm font-medium text-slate-700">{sub.name}</p><p className="text-xs text-slate-400">{sub.faculty}</p></div>
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
                  ].map(d => (
                    <div key={d.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xs text-slate-500 mb-1">{d.label}</p>
                      <DueDisplay value={d.value} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">CC Status</h4>
                <Badge type={detail.ccApproval === 'approved' ? 'ok' : detail.ccApproval === 'rejected' ? 'no' : 'warn'}>
                  {detail.ccApproval === 'approved' ? 'Approved by CC' : detail.ccApproval === 'rejected' ? 'Rejected by CC' : 'Pending CC Review'}
                </Badge>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Uploaded Documents</h4>
                {(!detail.documents || detail.documents.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No documents uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detail.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <i className="fas fa-file-alt text-slate-400"></i>
                          <span className="text-sm font-medium text-slate-700 truncate">{doc.name}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                          }} 
                          className="text-xs font-bold text-atria hover:underline whitespace-nowrap"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal 
        document={previewDoc} 
        onClose={() => setPreviewDoc(null)} 
      />
    </div>
  )
}