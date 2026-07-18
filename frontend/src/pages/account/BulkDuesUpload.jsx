import { useApp } from '../../context/AppContext'
import CSVUploader from '../../components/CSVUploader'

const DUES_CSV = `USN,HostelDue,LibraryDue,FeesDue
1AT23CG001,0,0,0
1AT23CG002,3500,0,25000
1AT23CG003,,500,
1AT23CG004,0,0,50000
1AT23CG005,8000,200,0`

export default function BulkDuesUpload() {
  const { dispatch } = useApp()

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Bulk Upload Dues</h1>
        <p className="text-sm text-slate-500 mt-0.5">Set hostel, library and fees dues for multiple students via CSV</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <CSVUploader
          title="Upload Dues CSV"
          description="Update all 3 due types (Hostel, Library, Fees) for students in one go"
          columns={['USN', 'HostelDue', 'LibraryDue', 'FeesDue']}
          sampleCSV={DUES_CSV}
          acceptText="Leave a field empty = not set yet | Put 0 = cleared | Put a number (e.g. 25000) = pending due amount"
          onUpload={(rows) => dispatch({ type: 'BULK_UPLOAD_DUES', payload: { dues: rows } })}
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-3">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center"><i className="fas fa-building text-sm"></i></div>
              <p className="text-sm font-bold text-slate-700">Hostel Due</p>
            </div>
            <p className="text-xs text-slate-500">Room rent, mess charges, maintenance fees</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center"><i className="fas fa-book text-sm"></i></div>
              <p className="text-sm font-bold text-slate-700">Library Due</p>
            </div>
            <p className="text-xs text-slate-500">Overdue fines, lost book charges, ID card replacement</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center"><i className="fas fa-indian-rupee-sign text-sm"></i></div>
              <p className="text-sm font-bold text-slate-700">Fees Due</p>
            </div>
            <p className="text-xs text-slate-500">Tuition fees, exam fees, lab fees, miscellaneous</p>
          </div>
        </div>
      </div>
    </div>
  )
}