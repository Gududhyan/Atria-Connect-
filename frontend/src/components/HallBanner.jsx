export default function HallBanner({ status }) {
  const m = {
    approved:{bg:'#059669',icon:'fa-circle-check',t:'Hall Ticket Approved',s:'All clearances completed. You are eligible.'},
    rejected:{bg:'#dc2626',icon:'fa-circle-xmark',t:'Hall Ticket Not Approved',s:'You have pending clearances or dues.'},
    pending:{bg:'#d97706',icon:'fa-hourglass-half',t:'Awaiting Approval',s:'Your clearances are being reviewed.'},
  }
  const c = m[status]||m.pending
  return (
    <div className="rounded-xl p-5 flex items-center gap-4 text-white" style={{background:c.bg}}>
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{background:'rgba(255,255,255,0.2)'}}>
        <i className={"fas "+c.icon} style={{fontSize:20}}/>
      </div>
      <div>
        <p className="font-bold" style={{fontSize:16}}>{c.t}</p>
        <p style={{fontSize:13,opacity:0.85}}>{c.s}</p>
      </div>
    </div>
  )
}