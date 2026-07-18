import { SEMESTERS, BRANCHES, SECTIONS } from '../data/mockData'

export default function SemBranchSectionSelector({ sem, setSem, branch, setBranch, section, setSection }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Semester</label>
        <select value={sem} onChange={e => setSem(Number(e.target.value))}
          className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer">
          {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Branch</label>
        <select value={branch} onChange={e => setBranch(e.target.value)}
          className="w-56 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer">
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Section</label>
        <select value={section} onChange={e => setSection(e.target.value)}
          className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer">
          <option value="">All</option>
          {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>
    </div>
  )
}