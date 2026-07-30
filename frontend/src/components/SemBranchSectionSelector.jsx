import { SEMESTERS, BRANCHES, SECTIONS } from '../data/mockData'

const inputCls = "px-3 py-2 bg-white border border-[#E8ECF2] rounded-xl text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria transition-colors"

export default function SemBranchSectionSelector({ sem, setSem, branch, setBranch, section, setSection }) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Semester</label>
        <select value={sem} onChange={e => setSem(Number(e.target.value))} className={`w-36 ${inputCls}`}>
          {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Branch</label>
        <select value={branch} onChange={e => setBranch(e.target.value)} className={`w-60 ${inputCls}`}>
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Section</label>
        <select value={section} onChange={e => setSection(e.target.value)} className={`w-32 ${inputCls}`}>
          <option value="">All Sections</option>
          {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>
    </div>
  )
}