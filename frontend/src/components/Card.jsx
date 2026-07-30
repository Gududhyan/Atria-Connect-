export default function Card({ children, className = '' }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {children}
    </div>
  )
}