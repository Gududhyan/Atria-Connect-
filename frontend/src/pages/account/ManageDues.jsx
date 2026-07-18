import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import SemBranchSectionSelector from '../../components/SemBranchSectionSelector'
import Badge from '../../components/Badge'
import DueDisplay from '../../components/DueDisplay'
import Button from '../../components/ui/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/ui/PageHeader'

export default function ManageDues() {
  const { state, dispatch } = useApp()
  const [sem, setSem] = useState(5)
  const [branch, setBranch] = useState('')
  const [section, setSection] = useState('')
  const [selected, setSelected] = useState(null)
  const [editValues, setEditValues] = useState({})

  const filtered = state.students.filter(s =>
    s.semester === sem && (!branch || s.branchCode === branch) && (!section || s.section === section)
  )

  const openEditor = (s) => {
    setSelected(s)
    setEditValues({
      hostelDue: s.hostelDue === null ? '' : s.hostelDue,
      libraryDue: s.libraryDue === null ? '' : s.libraryDue,
      feesDue: s.feesDue === null ? '' : s.feesDue
    })
  }

  const saveDues = () => {
    const parse = (v) => { if (v === '' || v === null) return null; const n = Number(v); return isNaN(n) || n < 0 ? null : n === 0 ? 0 : n }
    ;['hostelDue', 'libraryDue', 'feesDue'].forEach(key => {
      dispatch({ type: 'UPDATE_DUE', payload: { usn: selected.usn, dueType: key, value: parse(editValues[key]) } })
    })
    setSelected(null)
  }

  const DUE_LABELS = { hostelDue: 'Hostel Due', libraryDue: 'Library Due', feesDue: 'Fees Due' }

  return (
    <div className="fade-in">
      <PageHeader title="Manage Dues" subtitle="Set or clear hostel, library and fees dues for students" />

      <Card className="mb-6">
        <div className="p-4">
          <SemBranchSectionSelector sem={sem} setSem={setSem} branch={branch} setBranch={setBranch} section={section} setSection={setSection} />
        </div>
      </Card>

      <Card className="overflow-hidden">
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
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Library</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fees</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                  <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                  <td className="px-4 py-3 text-center"><DueDisplay value={s.hostelDue} /></td>
                  <td className="px-4 py-3 text-center"><DueDisplay value={s.libraryDue} /></td>
                  <td className="px-4 py-3 text-center"><DueDisplay value={s.feesDue} /></td>
                  <td className="px-4 py-3 text-center">
                    <Button onClick={() => openEditor(s)} variant="secondary" size="sm" className="px-3 py-2">
                      <i className="fas fa-pen mr-1"></i>Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Dues</h3>
              <p className="text-sm text-slate-500">{selected.usn} — {selected.name}</p>
            </div>
            <div className="p-6 space-y-4">
              {['hostelDue', 'libraryDue', 'feesDue'].map(key => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{DUE_LABELS[key]}</label>
                  <div className="flex gap-2">
                    <input type="number" value={editValues[key]} onChange={e => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder="Leave empty if not set" min="0"
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono placeholder:text-slate-300 placeholder:font-sans" />
                    <Button onClick={() => setEditValues(prev => ({ ...prev, [key]: 0 }))} variant="secondary" size="sm" className="px-3 py-2.5">
                      Clear
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Empty = not set yet &nbsp;|&nbsp; 0 = cleared &nbsp;|&nbsp; Amount = pending due</p>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setSelected(null)} variant="secondary" className="flex-1 py-2.5">
                  Cancel
                </Button>
                <Button onClick={saveDues} className="flex-1 py-2.5 bg-atria text-white hover:bg-atria-dark shadow-lg shadow-atria/20">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}