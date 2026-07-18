import React, { useState, useMemo } from 'react';

const CLEARANCE_OPTIONS = [{value:'cleared',label:'Cleared'},{value:'not_cleared',label:'Not Cleared'},{value:'re_exam',label:'Re-Exam'}];

const S = {
  page:{background:'#0B0D13',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif",color:'#EAECF0',padding:28},
  heading:{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:20,marginBottom:4},
  sub:{fontSize:13,color:'#7C8298',marginBottom:24},
  infoCard:{background:'#13161F',border:'1px solid #262B3A',borderRadius:12,padding:20,marginBottom:20},
  infoRow:{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1A1E2B'},
  infoRowLast:{borderBottom:'none'},
  infoLabel:{fontSize:12,color:'#7C8298'},
  infoVal:{fontSize:13,fontWeight:600},
  infoValMono:{fontSize:12,fontFamily:'monospace',color:'#E8653A'},
  statsGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24},
  statCard:{background:'#13161F',border:'1px solid #262B3A',borderRadius:12,padding:'16px 18px',textAlign:'center'},
  statVal:{fontSize:28,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginTop:4},
  statLbl:{fontSize:10,color:'#7C8298',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5},
  tableWrap:{background:'#13161F',border:'1px solid #262B3A',borderRadius:12,overflow:'hidden',marginBottom:24},
  table:{width:'100%',borderCollapse:'separate',borderSpacing:0},
  th:{background:'#13161F',color:'#7C8298',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,padding:'11px 14px',textAlign:'left',borderBottom:'1px solid #262B3A'},
  td:{padding:'11px 14px',borderBottom:'1px solid #1A1E2B',fontSize:13},
  code:{fontSize:11,background:'#1A1E2B',padding:'2px 7px',borderRadius:4,fontFamily:'monospace',color:'#E8653A'},
  badge:{display:'inline-flex',alignItems:'center',padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:600},
  badgeGreen:{background:'rgba(34,197,94,0.12)',color:'#22C55E'},
  badgeRed:{background:'rgba(239,68,68,0.12)',color:'#EF4444'},
  badgeYellow:{background:'rgba(245,158,11,0.12)',color:'#F59E0B'},
  alertBox:{padding:16,borderRadius:10,marginBottom:20,display:'flex',alignItems:'flex-start',gap:12},
  alertOk:{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'},
  alertWarn:{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)'},
  alertErr:{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'},
  backBtn:{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:7,fontSize:12,fontWeight:600,border:'1px solid #262B3A',background:'transparent',color:'#7C8298',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginBottom:20}
};

let inj=false;function injS(){if(inj)return;inj=true;const t=document.createElement('style');t.textContent='select option{background:#13161F;color:#EAECF0}';document.head.appendChild(t);}

export default function StudentClearance({ user, onBack }) {
  const [hoveredBack,setHoveredBack]=useState(false);
  React.useEffect(()=>{injS();},[]);

  const student = useMemo(()=>({
    usn:'1AT23CS001',name:'Arjun Sharma',branch:'CS',branchName:'Computer Science & Engg',semester:3,section:'A',
    subjects:[
      {code:'23CS301',name:'OOP with Java',status:'cleared'},
      {code:'23CS302',name:'Digital Logic Design',status:'cleared'},
      {code:'23CS303',name:'Discrete Mathematics',status:'not_cleared'},
      {code:'23CS304',name:'Computer Organization & Arch',status:'cleared'}
    ]
  }),[]);

  const cleared=student.subjects.filter(s=>s.status==='cleared').length;
  const notCleared=student.subjects.filter(s=>s.status==='not_cleared').length;
  const reExam=student.subjects.filter(s=>s.status==='re_exam').length;
  const allCleared=cleared===student.subjects.length;
  const hasIssues=!allCleared;

  const statusBadge=(s)=>{
    if(s==='cleared')return{...S.badge,...S.badgeGreen,text:'Cleared'};
    if(s==='re_exam')return{...S.badge,...S.badgeYellow,text:'Re-Exam'};
    return{...S.badge,...S.badgeRed,text:'Not Cleared'};
  };

  const rowEnter=e=>{e.currentTarget.style.background='rgba(232,101,58,0.04)';};
  const rowLeave=e=>{e.currentTarget.style.background='transparent';};

  return (
    <div style={S.page}>
      <button style={{...S.backBtn,...(hoveredBack?{borderColor:'#323850',color:'#EAECF0'}:{})}} onClick={onBack} onMouseEnter={()=>setHoveredBack(true)} onMouseLeave={()=>setHoveredBack(false)}>
        {'\u2190'} Back to Dashboard
      </button>

      <h2 style={S.heading}>Subject Clearance Status</h2>
      <p style={S.sub}>View your subject-wise clearance for the current semester</p>

      <div style={S.infoCard}>
        <div style={S.infoRow}><span style={S.infoLabel}>USN</span><span style={S.infoValMono}>{student.usn}</span></div>
        <div style={S.infoRow}><span style={S.infoLabel}>Student Name</span><span style={S.infoVal}>{student.name}</span></div>
        <div style={S.infoRow}><span style={S.infoLabel}>Programme</span><span style={S.infoVal}>{student.branch} - {student.branchName}</span></div>
        <div style={{...S.infoRow,...S.infoRowLast}}><span style={S.infoLabel}>Semester / Section</span><span style={S.infoVal}>Semester {student.semester} / Section {student.section}</span></div>
      </div>

      <div style={S.statsGrid}>
        <div style={S.statCard}><p style={{...S.statVal,color:'#22C55E'}}>{cleared}</p><p style={S.statLbl}>Cleared</p></div>
        <div style={S.statCard}><p style={{...S.statVal,color:'#EF4444'}}>{notCleared}</p><p style={S.statLbl}>Not Cleared</p></div>
        <div style={S.statCard}><p style={{...S.statVal,color:'#F59E0B'}}>{reExam}</p><p style={S.statLbl}>Re-Exam</p></div>
      </div>

      {allCleared&&(
        <div style={{...S.alertBox,...S.alertOk}}>
          <span style={{fontSize:18}}>{'\u2705'}</span>
          <div><p style={{fontSize:13,fontWeight:700,color:'#22C55E',marginBottom:2}}>All Subjects Cleared</p><p style={{fontSize:13,color:'#7C8298'}}>You are eligible for hall ticket issuance subject to dues clearance.</p></div>
        </div>
      )}
      {hasIssues&&(
        <div style={{...S.alertBox,...S.alertWarn}}>
          <span style={{fontSize:18}}>{'\u26A0'}</span>
          <div><p style={{fontSize:13,fontWeight:700,color:'#F59E0B',marginBottom:2}}>Clearance Pending</p><p style={{fontSize:13,color:'#7C8298'}}>You have {notCleared} subject(s) not cleared and {reExam} subject(s) with re-exam status. Please contact the concerned faculty.</p></div>
        </div>
      )}

      <div style={S.tableWrap}>
        <table style={S.table}><thead><tr>
          <th style={S.th}>Subject Code</th><th style={S.th}>Subject Name</th><th style={S.th}>Credits</th><th style={S.th}>Status</th>
        </tr></thead><tbody>
          {student.subjects.map(s=>{const b=statusBadge(s.status);return(
            <tr key={s.code} onMouseEnter={rowEnter} onMouseLeave={rowLeave}>
              <td style={S.td}><code style={S.code}>{s.code}</code></td>
              <td style={S.td}>{s.name}</td>
              <td style={{...S.td,color:'#7C8298'}}>4</td>
              <td style={S.td}><span style={b}>{b.text}</span></td>
            </tr>
          );})}
        </tbody></table>
      </div>
    </div>
  );
}