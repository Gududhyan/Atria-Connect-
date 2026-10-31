'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SEMESTERS, BRANCHES, SECTIONS } from '@/lib/constants'

const inputCls = 'px-3 py-2 bg-white border border-[#E8ECF2] rounded-xl text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria transition-colors'

// Filters live in the URL so the server can query only the matching students
// instead of shipping every record to the browser.
export default function SemBranchSectionSelector({ sem, branch, section, search = '' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search || '')
  const debounceTimer = useRef(null)

  // Keep local input in sync if URL search param changes
  useEffect(() => {
    setSearchInput(search || '')
  }, [search])

  const navigate = (next) => {
    const params = new URLSearchParams()
    const nextSem = next.sem !== undefined ? next.sem : sem
    const nextBranch = next.branch !== undefined ? next.branch : branch
    const nextSection = next.section !== undefined ? next.section : section
    const nextSearch = next.search !== undefined ? next.search : searchInput

    if (nextSem !== null && nextSem !== '' && nextSem !== undefined) {
      params.set('sem', String(nextSem))
    }
    if (nextBranch) params.set('branch', nextBranch)
    if (nextSection) params.set('section', nextSection)
    if (nextSearch && nextSearch.trim()) params.set('search', nextSearch.trim())

    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  const handleSearchChange = (val) => {
    setSearchInput(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      navigate({ search: val })
    }, 400)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      navigate({ search: searchInput })
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    navigate({ search: '' })
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search by Name or USN */}
      <div className="flex-1 min-w-[200px] max-w-xs">
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Search Student</label>
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search name or USN…"
            className="w-full pl-8 pr-8 py-2 bg-white border border-[#E8ECF2] rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-atria/20 focus:border-atria transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              title="Clear search">
              <i className="fas fa-circle-xmark text-xs" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Semester</label>
        <select
          value={sem ?? ''}
          onChange={(e) => navigate({ sem: e.target.value ? Number(e.target.value) : '' })}
          className={`w-36 ${inputCls}`}>
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Branch</label>
        <select value={branch || ''} onChange={(e) => navigate({ branch: e.target.value })} className={`w-60 ${inputCls}`}>
          <option value="">All Branches</option>
          {BRANCHES.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-2xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Section</label>
        <select value={section || ''} onChange={(e) => navigate({ section: e.target.value })} className={`w-32 ${inputCls}`}>
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {pending && (
        <span className="text-xs text-slate-400 pb-2.5 flex items-center gap-1.5">
          <i className="fas fa-circle-notch fa-spin text-atria" /> Searching…
        </span>
      )}
    </div>
  )
}
