export default function Panel({ className = '', children }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
