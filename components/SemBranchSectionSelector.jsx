'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SEMESTERS, BRANCHES, SECTIONS } from '@/lib/constants'

const inputCls = 'px-3 py-2 bg-white border border-[#E8ECF2] rounded-xl text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria transition-colors'

// Filters live in the URL so the server can query only the matching students
// instead of shipping every record to the browser.
export default function SemBranchSectionSelector({ sem, branch, section }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const navigate = (next) => {
    const params = new URLSearchParams()
    params.set('sem', String(next.sem ?? sem))
    if (next.branch ?? branch) params.set('branch', next.branch ?? branch)
    if (next.section ?? section) params.set('section', next.section ?? section)
    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Semester</label>
        <select value={sem} onChange={(e) => navigate({ sem: Number(e.target.value) })} className={`w-36 ${inputCls}`}>
          {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Branch</label>
        <select value={branch} onChange={(e) => navigate({ branch: e.target.value })} className={`w-60 ${inputCls}`}>
          <option value="">All Branches</option>
          {BRANCHES.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Section</label>
        <select value={section} onChange={(e) => navigate({ section: e.target.value })} className={`w-32 ${inputCls}`}>
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {pending && (
        <span className="text-xs text-slate-400 pb-2.5 flex items-center gap-1.5">
          <i className="fas fa-circle-notch fa-spin" /> Loading…
        </span>
      )}
    </div>
  )
}
