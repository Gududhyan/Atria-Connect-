import { useApp } from '../context/AppContext'
import { BRANCHES, SECTIONS, SEMESTERS } from '../utils/helpers'

export default function FilterBar() {
  const { state, setFilter, clearFilters } = useApp()
  const f = state.filters
  const has = f.semester||f.branch||f.section
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <select className="inp" style={{width:'auto',minWidth:130}} value={f.semester} onChange={(e)=>setFilter({semester:e.target.value})}>
        <option value="">All Semesters</option>
        {SEMESTERS.map(s=><option key={s} value={s}>Sem {s}</option>)}
      </select>
      <select className="inp" style={{width:'auto',minWidth:210}} value={f.branch} onChange={(e)=>setFilter({branch:e.target.value})}>
        <option value="">All Branches</option>
        {BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select className="inp" style={{width:'auto',minWidth:110}} value={f.section} onChange={(e)=>setFilter({section:e.target.value})}>
        <option value="">All Sections</option>
        {SECTIONS.map(s=><option key={s} value={s}>Sec {s}</option>)}
      </select>
      {has && <button onClick={clearFilters} className="bdg-s">Clear</button>}
    </div>
  )
}