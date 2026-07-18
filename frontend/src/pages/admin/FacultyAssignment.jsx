import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FACULTY_POOL } from '../../data/mockData'
import SemBranchSectionSelector from '../../components/SemBranchSectionSelector'
import Badge from '../../components/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/ui/PageHeader'

export default function FacultyAssignment() {
  const { state, dispatch } = useApp()
  const [sem, setSem] = useState(5)
  const [branch, setBranch] = useState('CG')
  const [section, setSection] = useState('A')
  const [selected, setSelected] = useState(null)

  const filtered = state.students.filter(s =>
    s.semester === sem && (!branch || s.branchCode === branch) && (!section || s.section === section)
  )

  const updateFaculty = (usn, subjectCode, faculty) => {
    dispatch({ type: 'UPDATE_FACULTY', payload: { usn, subjectCode, faculty } })
    setSelected(prev => prev && prev.usn === usn
      ? { ...prev, subjects: prev.subjects.map(sub => sub.code === subjectCode ? { ...sub, faculty } : sub) }
      : prev
    )
  }

  return (
    <div className="fade-in">
      <PageHeader title="Faculty Assignment" subtitle="Assign faculty members to subjects for each student" />

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
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.usn} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{s.usn}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.name}</td>
                  <td className="px-4 py-3"><Badge type="info">Sec {s.section}</Badge></td>
                  <td className="px-4 py-3 text-center">
                    <Button onClick={() => setSelected(s)} variant="secondary" size="sm" className="px-3 py-2">
                      <i className="fas fa-pen-to-square mr-1"></i>Assign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assignment Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden fade-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Assign Faculty</h3>
                <p className="text-sm text-slate-500">{selected.usn} — {selected.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <i className="fas fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto scrollbar-thin">
              {selected.subjects.map(sub => (
                <div key={sub.code} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-400">{sub.code} · {sub.type}</p>
                  </div>
                  <select value={sub.faculty} onChange={e => updateFaculty(selected.usn, sub.code, e.target.value)}
                    className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm cursor-pointer">
                    {FACULTY_POOL.map(f => <option key={f} value={f}>{f}</option>)}
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