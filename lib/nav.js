// Single source of truth for sidebar links and per-route page titles.
export const MENU = {
  admin: [
    { href: '/admin/faculty', icon: 'fa-chalkboard-user', label: 'Faculty Assignment', title: 'Faculty Assignment', sub: 'Assign subjects to faculty members' },
    { href: '/admin/approval', icon: 'fa-stamp', label: 'Hall Ticket Approval', title: 'Hall Ticket Approval', sub: 'Issue hall tickets to cleared students' },
    { href: '/admin/bulk', icon: 'fa-cloud-arrow-up', label: 'Bulk Upload', title: 'Bulk Upload', sub: 'Upload student data, dues, faculty mapping and placements' }
  ],
  account: [
    { href: '/account/dues', icon: 'fa-indian-rupee-sign', label: 'Manage Dues', title: 'Manage Dues', sub: 'Set hostel, library and fee dues per student' },
    { href: '/account/bulk-dues', icon: 'fa-cloud-arrow-up', label: 'Bulk Upload Dues', title: 'Bulk Upload Dues', sub: 'Upload dues data via CSV' }
  ],
  cc: [
    { href: '/cc', icon: 'fa-clipboard-check', label: 'Review & Approve', title: 'Review & Approve', sub: 'Sign off on student hall tickets' }
  ],
  faculty: [
    { href: '/faculty', icon: 'fa-check-double', label: 'Subject Clearance', title: 'Subject Clearance', sub: 'Update clearances for your assigned subjects' }
  ],
  student: [
    { href: '/student', icon: 'fa-file-lines', label: 'My No Due Status', title: 'No Due Status', sub: 'Clearance, dues & approval overview' }
  ]
}

export const ROLE_META = {
  admin: { label: 'Administrator', color: '#F97316', glow: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.12)' },
  account: { label: 'Accounts', color: '#10B981', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.12)' },
  cc: { label: 'Class Coordinator', color: '#FBBF24', glow: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.12)' },
  faculty: { label: 'Faculty', color: '#38BDF8', glow: 'rgba(56,189,248,0.3)', bg: 'rgba(56,189,248,0.12)' },
  student: { label: 'Student', color: '#A78BFA', glow: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.12)' }
}

export function findMenuItem(role, pathname) {
  const items = MENU[role] || []
  return (
    items.find((item) => item.href === pathname) ||
    items.find((item) => pathname.startsWith(item.href) && item.href !== `/${role}`) ||
    items[0]
  )
}
