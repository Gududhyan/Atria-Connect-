export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden ${className}`}>
      {children}
    </div>
  )
}