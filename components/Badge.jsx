const STYLES = {
  ok: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  no: 'bg-red-50 text-red-700 border border-red-200',
  warn: 'bg-amber-50 text-amber-700 border border-amber-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  purple: 'bg-violet-50 text-violet-700 border border-violet-200'
}

export default function Badge({ type = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight ${STYLES[type] || STYLES.neutral} ${className}`}>
      {children}
    </span>
  )
}
