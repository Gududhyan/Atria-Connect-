const STYLES = {
  ok: 'bg-ok-light text-ok-dark border border-ok/30',
  no: 'bg-no-light text-no-dark border border-no/30',
  warn: 'bg-warn-light text-warn-dark border border-warn/30',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200'
}

export default function Badge({ type = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STYLES[type] || STYLES.neutral} ${className}`}>
      {children}
    </span>
  )
}