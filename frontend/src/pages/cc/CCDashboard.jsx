import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { BRANCHES } from '../../data/mockData'
import DashboardLayout from '../../components/DashboardLayout'
import SemBranchSectionSelector from '../../components/SemBranchSectionSelector'
import Badge from '../../components/Badge'
import DueDisplay from '../../components/DueDisplay'
import Button from '../../components/ui/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/ui/PageHeader'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'

export default function CCDashboard() {
  const { state, dispatch } = useApp()
  const [page, setPage] = useState('review')
  const [sem, setSem] = useState(5)
  const [branch, setBranch] = useState('')
  const [section, setSection] = useState('')
  const [detail, setDetail] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  const filtered = state.students.filter(s =>
    s.semester === sem && (!branch || s.branchCode === branch) && (!section || s.section === section)
  )

  return (
    <DashboardLayout role="cc" activePage={page} setActivePage={setPage}>
      <div className="fade-in">
        <PageHeader title="Review & Approve" subtitle="Review all clearances and dues, then approve or reject hall tickets" />

        <Card className="mb-6">
          <div className="p-4">
            <SemBranchSectionSelector sem={sem} setSem={setSem} branch={branch} setBranch={setBranch} section={section} setSection={setSection} />
          </div>
        </Card>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
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
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">CC Sign</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const cleared = s.subjects.filter(sub => sub.clearance === 'yes').length
                  const total = s.subjects.length
                  const hasDues = s.hostelDue || s.libraryDue || s.feesDue
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
                        {s.ccApproval === 'approved' ? <Badge type="ok"><i className="fas fa-signature mr-1"></i>Signed</Badge> :
                         s.ccApproval === 'rejected' ? <Badge type="no">Rejected</Badge> :
                         <Badge type="warn">Pending</Badge>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!s.hallTicketIssued && s.ccApproval !== 'approved' && (
                          <div className="flex items-center justify-center gap-2">
                            <Button onClick={() => setDetail(s)} variant="secondary" size="xs">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button onClick={() => dispatch({ type: 'UPDATE_CC', payload: { usn: s.usn, approval: 'approved' } })} variant="success" size="xs" title="Approve">
                              <i className="fas fa-check"></i>
                            </Button>
                            <Button onClick={() => dispatch({ type: 'UPDATE_CC', payload: { usn: s.usn, approval: 'rejected' } })} variant="danger" size="xs" title="Reject">
                              <i className="fas fa-xmark"></i>
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {detail && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden fade-in" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{detail.usn}</h3>
                  <p className="text-sm text-slate-500">{detail.name} · {BRANCHES.find(b => b.code === detail.branchCode)?.name} · Section {detail.section}</p>
                </div>
                <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><i className="fas fa-xmark"></i></button>
              </div>
              <div className="p-6 max-h-[65vh] overflow-y-auto scrollbar-thin space-y-4">
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
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Dues Summary</h4>
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
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col fade-in" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-sky-100 text-sky-600 flex items-center justify-center">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <h3 className="font-bold text-slate-800 truncate">{previewDoc.name}</h3>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <i className="fas fa-xmark text-lg"></i>
                </button>
              </div>
              <div className="p-6 bg-slate-100 flex-1 overflow-auto flex justify-center items-center min-h-[50vh]">
                {previewDoc.url?.startsWith('data:image/') ? (
                  <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm" />
                ) : (
                  <object data={previewDoc.url} className="w-full h-[75vh] rounded-lg shadow-sm bg-white" title={previewDoc.name}>
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                      <i className="fas fa-file-pdf text-4xl text-slate-300"></i>
                      <p>Browser cannot display this file inline.</p>
                      <a href={previewDoc.url} download={previewDoc.name} className="px-4 py-2 bg-atria text-white rounded-lg text-sm font-bold shadow hover:bg-atria-dark transition-colors">
                        Download File
                      </a>
                    </div>
                  </object>
                )}
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
    </DashboardLayout>
  )
}