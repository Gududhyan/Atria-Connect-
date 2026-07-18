export default function StatCard({ label, value, color }) {
  const bg = {green:'#059669', red:'#dc2626', yellow:'#d97706', blue:'#2563eb', brand:'#c41e24'}
  return (
    <div className="sc" style={{background:bg[color]||bg.brand}}>
      <p className="sc-label">{label}</p>
      <p className="sc-val">{value}</p>
    </div>
  )
}