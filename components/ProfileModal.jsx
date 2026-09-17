'use client'

import Modal from './Modal'
import { BRANCHES } from '@/lib/constants'
import { ROLE_META } from '@/lib/nav'

function Row({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}

export default function ProfileModal({ user, onClose }) {
  if (!user) return null

  const meta = ROLE_META[user.role] || { color: '#94A3B8', label: user.role }
  const branch = BRANCHES.find((b) => b.code === user.branchCode)
  const initial = (user.name || user.username || user.usn || '?').charAt(0).toUpperCase()

  return (
    <Modal title="My Profile" size="sm" onClose={onClose}>
      <div className="flex flex-col items-center text-center pb-5 mb-2 border-b border-slate-100">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm mb-3"
          style={{ background: `linear-gradient(135deg, ${meta.color}dd, ${meta.color}99)` }}>
          {initial}
        </div>
        <h4 className="text-base font-bold text-slate-900">{user.name || user.username || user.usn}</h4>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
          <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
        </div>
      </div>

      <div>
        {user.role === 'student' ? (
          <>
            <Row label="USN" value={user.usn} />
            <Row label="Branch" value={branch ? `${branch.name} (${branch.short})` : user.branchCode} />
            <Row label="Semester" value={user.semester} />
            <Row label="Section" value={user.section} />
          </>
        ) : (
          <>
            <Row label="Username" value={user.username} />
            <Row label="Role" value={meta.label} />
          </>
        )}
      </div>
    </Modal>
  )
}
