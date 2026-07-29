import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { uploadFile } from '../../api'
import { BRANCHES } from '../../data/mockData'
import DashboardLayout from '../../components/DashboardLayout'
import Badge from '../../components/Badge'
import PageHeader from '../../components/ui/PageHeader'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'

const PLACEMENT_STYLES = {
  'Placed': { bg: 'bg-ok-light/40', border: 'border-ok/30', text: 'text-ok-dark', icon: 'fa-circle-check' },
  'Unplaced': { bg: 'bg-no-light/40', border: 'border-no/30', text: 'text-no-dark', icon: 'fa-circle-xmark' },
  'Higher Studies': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', icon: 'fa-graduation-cap' },
  'Entrepreneurship': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'fa-rocket' },
  'Not Eligible': { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', icon: 'fa-ban' }
}

export default function StudentDashboard() {
  const { state, dispatch } = useApp()
  const [page, setPage] = useState('status')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [pendingUpload, setPendingUpload] = useState(null)
  const user = state.currentUser
  const student = state.students.find(s => s.usn === user.usn)

  if (!student) return <div className="p-8 text-center text-slate-500">Student not found</div>

  const branchInfo = BRANCHES.find(b => b.code === student.branchCode)
  const clearedCount = student.subjects.filter(s => s.clearance === 'yes').length
  const totalCount = student.subjects.length
  const hasDues = student.hostelDue || student.libraryDue || student.feesDue
  const allClear = clearedCount === totalCount && !hasDues
  const pStyle = PLACEMENT_STYLES[student.placement] || null

  return (
    <DashboardLayout role="student" activePage={page} setActivePage={setPage} extra={`${student.usn} · Sem ${student.semester}`}>
      <div className="fade-in space-y-6">
        <PageHeader title="Your No Due Summary" subtitle="Track clearance, dues, and approval status for your current semester" />

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-atria to-atria-dark px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-atria-pale text-xs font-semibold uppercase tracking-widest mb-1">Student No Due Status</p>
                <h1 className="text-xl font-bold text-white">{student.name}</h1>
                <p className="text-atria-pale/80 text-sm mt-0.5">{student.usn}</p>
              </div>
              <div className="text-right">
                {student.hallTicketIssued ? (
                  <div className="bg-ok text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-ok/30"><i className="fas fa-ticket mr-1"></i>Hall Ticket Issued</div>
                ) : (
                  <div className="bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm backdrop-blur-sm"><i className="fas fa-hourglass-half mr-1"></i>Pending</div>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50/50 border-b border-slate-100">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch</p><p className="text-sm font-semibold text-slate-700 mt-0.5">{branchInfo?.name}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</p><p className="text-sm font-semibold text-slate-700 mt-0.5">{student.semester}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section</p><p className="text-sm font-semibold text-slate-700 mt-0.5">{student.section}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall</p>
              <p className="text-sm font-semibold mt-0.5">
                {allClear ? <span className="text-ok"><i className="fas fa-circle-check mr-1"></i>All Clear</span> : <span className="text-no"><i className="fas fa-circle-exclamation mr-1"></i>Issues</span>}
              </p>
            </div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Placement</p>
              <p className="text-sm font-semibold mt-0.5">
                {student.placement ? <span className={pStyle?.text || 'text-slate-700'}><i className={`fas ${pStyle?.icon || 'fa-circle'} mr-1`}></i>{student.placement}</span> : <span className="text-slate-400">Not Set</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Clearances */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Subject-wise Faculty Clearance</h2>
              <p className="text-xs text-slate-500 mt-0.5">{clearedCount} of {totalCount} subjects cleared</p>
            </div>
            <Badge type={clearedCount === totalCount ? 'ok' : 'warn'}>{clearedCount}/{totalCount}</Badge>
          </div>
          <div className="divide-y divide-slate-50">
            {student.subjects.map(sub => (
              <div key={sub.code} className={`px-6 py-4 flex items-center justify-between ${sub.clearance === 'no' ? 'bg-no-light/20' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-700">{sub.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{sub.code}</span>
                    {sub.type === 'lab' && <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-semibold">LAB</span>}
                    {sub.type === 'project' && <span className="text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-semibold">PROJECT</span>}
                    {sub.type === 'seminar' && <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-semibold">SEMINAR</span>}
                    {sub.type === 'internship' && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-semibold">INTERNSHIP</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1"><i className="fas fa-user-tie mr-1"></i>{sub.faculty}</p>
                </div>
                <div className="text-right ml-4">
                  {sub.clearance === 'yes' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ok text-white rounded-lg text-xs font-bold shadow-sm shadow-ok/30"><i className="fas fa-check"></i>YES</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-no text-white rounded-lg text-xs font-bold shadow-sm shadow-no/30"><i className="fas fa-xmark"></i>NO</span>
                  )}
                  {sub.remarks && <p className="text-xs text-no mt-1.5 max-w-[220px] flex items-start gap-1 justify-end"><i className="fas fa-comment-dots mt-0.5 text-[10px]"></i>{sub.remarks}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dues Status */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Dues Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Hostel, Library and Fees due information</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Hostel Due', value: student.hostelDue, icon: 'fa-building', desc: 'Hostel accommodation charges' },
              { label: 'Library Due', value: student.libraryDue, icon: 'fa-book', desc: 'Library fines or pending returns' },
              { label: 'Fees Due', value: student.feesDue, icon: 'fa-indian-rupee-sign', desc: 'Tuition and other fee dues' }
            ].map(item => (
              <div key={item.label} className={`p-5 rounded-xl border-2 ${
                item.value === null ? 'border-slate-100 bg-slate-50' : item.value === 0 ? 'border-ok/30 bg-ok-light/30' : 'border-no/30 bg-no-light/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.value === null ? 'bg-slate-200 text-slate-500' : item.value === 0 ? 'bg-ok/20 text-ok' : 'bg-no/20 text-no'
                  }`}><i className={`fas ${item.icon}`}></i></div>
                  <div><p className="text-sm font-bold text-slate-700">{item.label}</p><p className="text-[10px] text-slate-400">{item.desc}</p></div>
                </div>
                {item.value === null ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">N/A</span> :
                 item.value === 0 ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-ok-light text-ok-dark border border-ok/30">Cleared</span> :
                 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-no-light text-no-dark border border-no/30">Not Cleared — ₹{item.value.toLocaleString()}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Approval Status */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-base font-bold text-slate-800">Approval Status</h2></div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border-2 border-slate-100 bg-slate-50">
              <p className="text-sm font-bold text-slate-700 mb-1">Class Coordinator Sign</p>
              <p className="text-xs text-slate-400 mb-3">CC review and approval status</p>
              {student.ccApproval === 'approved' ? <Badge type="ok" className="text-sm px-4 py-1.5"><i className="fas fa-signature mr-1"></i>Approved & Signed</Badge> :
               student.ccApproval === 'rejected' ? <Badge type="no" className="text-sm px-4 py-1.5"><i className="fas fa-ban mr-1"></i>Rejected</Badge> :
               <Badge type="warn" className="text-sm px-4 py-1.5"><i className="fas fa-clock mr-1"></i>Pending Review</Badge>}
            </div>
            <div className="p-5 rounded-xl border-2 border-slate-100 bg-slate-50">
              <p className="text-sm font-bold text-slate-700 mb-1">Admin Approval</p>
              <p className="text-xs text-slate-400 mb-3">Final hall ticket issuance</p>
              {student.hallTicketIssued ? <Badge type="ok" className="text-sm px-4 py-1.5"><i className="fas fa-ticket mr-1"></i>Hall Ticket Issued</Badge> :
               student.adminApproval === 'rejected' ? <Badge type="no" className="text-sm px-4 py-1.5"><i className="fas fa-ban mr-1"></i>Rejected</Badge> :
               <Badge type="warn" className="text-sm px-4 py-1.5"><i className="fas fa-clock mr-1"></i>Pending</Badge>}
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800">Uploaded Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upload certificates and clearance proofs</p>
            </div>
            <div>
              <input
                type="file"
                id="docUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setPendingUpload({
                        name: file.name,
                        url: ev.target.result,
                        file: file
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                  // Reset input so the same file can be selected again if canceled
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="docUpload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-atria text-white rounded-xl text-sm font-bold shadow-md hover:bg-atria-dark transition-colors"
              >
                <i className="fas fa-upload"></i> Upload
              </label>
            </div>
          </div>
          <div className="p-6">
            {pendingUpload && (
              <div className="mb-6 p-4 rounded-xl border border-sky-200 bg-sky-50 shadow-sm animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Pending Upload: {pendingUpload.name}</h3>
                      <button 
                        onClick={() => setPreviewDoc({ name: pendingUpload.name, url: pendingUpload.url })}
                        className="text-xs text-atria hover:underline mt-0.5 font-semibold"
                      >
                        Preview File
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPendingUpload(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          // Upload to the backend
                          const res = await uploadFile(pendingUpload.file)
                          
                          // Dispatch with the backend URL
                          dispatch({
                            type: 'UPLOAD_DOCUMENT',
                            payload: {
                              usn: student.usn,
                              document: {
                                name: pendingUpload.name,
                                url: res.url, // the static URL returned by the backend
                                uploadedAt: new Date().toISOString()
                              }
                            }
                          });
                          setPendingUpload(null);
                        } catch (err) {
                          alert('Failed to upload file: ' + err.message)
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ok text-white hover:bg-ok-dark transition-colors shadow-sm"
                    >
                      Confirm Upload
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(!student.documents || student.documents.length === 0) ? (
              <p className="text-sm text-slate-500 text-center py-4">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-3">
                {student.documents.map((doc, idx) => (
                  <li key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{doc.name}</p>
                        <p className="text-xs text-slate-400">{new Date(doc.uploadedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPreviewDoc(doc)}
                      className="text-sm font-semibold text-atria hover:underline"
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        <DocumentPreviewModal 
          document={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
        />

      </div>

    </DashboardLayout>
  )
}