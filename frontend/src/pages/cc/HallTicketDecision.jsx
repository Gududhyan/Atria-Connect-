import React, { useState, useMemo, useCallback } from 'react';

/* ── Constants ── */
const BRANCHES = ['CG','CS','CD','IS','CV','ME','AI'];
const BRANCH_NAMES = {
  CG:'CSE (Design & Tech)', CS:'Computer Science & Engg', CD:'Cyber Security',
  IS:'Information Science', CV:'Civil Engineering', ME:'Mechanical Engineering', AI:'AI & Machine Learning'
};
const SECTIONS = ['A','B'];
const SEMESTERS = [1,2,3,4,5,6,7,8];
const STUDENT_NAMES = [
  'Arjun Sharma','Priya Patel','Rahul Kumar','Sneha Reddy','Vikram Singh',
  'Ananya Iyer','Karthik Nair','Divya Menon','Rohan Das','Meera Joshi',
  'Aditya Rao','Kavitha Srinivas','Nikhil Gupta','Pooja Kulkarni','Suresh Babu',
  'Lakshmi Venkatesh','Deepak Mohan','Ashwini Prabhu','Manoj Tiwari','Shruti Bhat'
];
const COMMON_SUBS = {
  1:[['23MAT101','Calculus & Linear Algebra'],['23PHY101','Engineering Physics'],['23CHE101','Engineering Chemistry'],['23EG101','English for Communication'],['23CSE101','Programming in C'],['23ECC101','Constitution of India & Ethics']],
  2:[['23MAT201','Advanced Calculus & Statistics'],['23PHY201','Physics Laboratory'],['23EVS201','Environmental Science'],['23CSE201','Data Structures with C'],['23DBM201','Database Management Systems'],['23EDC201','Basic Electronics']]
};
const BRANCH_SUBS = {
  CG:[['23CG301','Design Thinking & Innovation'],['23CG302','OOP with Java'],['23CG303','Digital Logic Design'],['23CG304','Computer Graphics Fundamentals'],['23CG401','Analysis of Algorithms'],['23CG402','UI/UX Design Principles'],['23CG403','Operating Systems'],['23CG404','Web Technologies & Frameworks'],['23CG501','Software Engineering'],['23CG502','Computer Networks'],['23CG503','Advanced Database Systems'],['23CG504','Design Patterns & UX Research'],['23CG601','ML for Designers'],['23CG602','Cloud Computing & DevOps'],['23CG603','Information Security'],['23CG604','Project Work Phase I']],
  CS:[['23CS301','OOP with Java'],['23CS302','Digital Logic Design'],['23CS303','Discrete Mathematics'],['23CS304','Computer Organization & Arch'],['23CS401','Analysis of Algorithms'],['23CS402','Operating Systems'],['23CS403','Microprocessors & Interfacing'],['23CS404','Theory of Computation'],['23CS501','Software Engineering'],['23CS502','Computer Networks'],['23CS503','Compiler Design'],['23CS504','Database Applications'],['23CS601','Machine Learning'],['23CS602','Cloud Computing'],['23CS603','Information Security'],['23CS604','Project Work Phase I']],
  CD:[['23CD301','OOP with Java'],['23CD302','Digital Logic Design'],['23CD303','Network Fundamentals'],['23CD304','Linux System Administration'],['23CD401','Cryptography Basics'],['23CD402','Operating Systems'],['23CD403','Web Application Security'],['23CD404','Database Systems'],['23CD501','Ethical Hacking & Pen Testing'],['23CD502','Network Security'],['23CD503','Malware Analysis'],['23CD504','Security Auditing & Compliance'],['23CD601','Advanced Cryptography'],['23CD602','Cloud Security'],['23CD603','Digital Forensics'],['23CD604','Project Work Phase I']],
  IS:[['23IS301','OOP with Java'],['23IS302','Digital Logic Design'],['23IS303','Discrete Structures'],['23IS304','Data Communication'],['23IS401','Analysis of Algorithms'],['23IS402','Operating Systems'],['23IS403','Database Management Systems'],['23IS404','Computer Networks'],['23IS501','Software Engineering'],['23IS502','Web Technologies'],['23IS503','Data Mining & Warehousing'],['23IS504','Information Retrieval Systems'],['23IS601','Big Data Analytics'],['23IS602','Machine Learning'],['23IS603','Cloud Computing'],['23IS604','Project Work Phase I']],
  CV:[['23CV301','Strength of Materials'],['23CV302','Engineering Geology'],['23CV303','Surveying - I'],['23CV304','Fluid Mechanics'],['23CV401','Structural Analysis - I'],['23CV402','Concrete Technology'],['23CV403','Hydraulics & Water Resources'],['23CV404','Transportation Engineering'],['23CV501','Design of RC Structures'],['23CV502','Geotechnical Engineering'],['23CV503','Environmental Engineering'],['23CV504','Estimation & Costing'],['23CV601','Advanced Structural Design'],['23CV602','Construction Management'],['23CV603','GIS & Remote Sensing'],['23CV604','Project Work Phase I']],
  ME:[['23ME301','Engineering Thermodynamics'],['23ME302','Manufacturing Technology - I'],['23ME303','Kinematics of Machinery'],['23ME304','Material Science & Metallurgy'],['23ME401','Fluid Mechanics'],['23ME402','Strength of Materials'],['23ME403','Metrology & Quality Control'],['23ME404','CAD/CAM'],['23ME501','Heat Transfer'],['23ME502','Design of Machine Elements'],['23ME503','Dynamics of Machinery'],['23ME504','Industrial Engineering & Mgmt'],['23ME601','Advanced Manufacturing'],['23ME602','Mechatronics'],['23ME603','Automobile Engineering'],['23ME604','Project Work Phase I']],
  AI:[['23AI301','OOP with Python'],['23AI302','Linear Algebra for AI'],['23AI303','Probability & Statistics'],['23AI304','Data Structures in Python'],['23AI401','Machine Learning Foundations'],['23AI402','Deep Learning with TensorFlow'],['23AI403','Natural Language Processing'],['23AI404','Computer Vision Basics'],['23AI501','Reinforcement Learning'],['23AI502','MLOps & Deployment'],['23AI503','AI Ethics & Governance'],['23AI504','Big Data for AI Systems'],['23AI601','Advanced Deep Learning'],['23AI602','Generative AI Techniques'],['23AI603','Edge AI & IoT'],['23AI604','Project Work Phase I']]
};

const getSubjects = (sem, branch) => {
  if (sem <= 2) return COMMON_SUBS[sem].map(([c,n])=>({code:c,name:n}));
  const pool = BRANCH_SUBS[branch]; if(!pool) return [];
  const s = (sem-3)*4; return pool.slice(s,s+4).map(([c,n])=>({code:c,name:n}));
};
const getStudents = (sem, branch, section) => {
  const si=section==='A'?0:1, start=si*5;
  return Array.from({length:5},(_,i)=>({
    usn:`1AT23${branch}${String(start+i+1).padStart(3,'0')}`,
    name:STUDENT_NAMES[(start+i)%STUDENT_NAMES.length], semester:sem, branch, section
  }));
};
const scKey = (usn,code) => `${usn}-${code}`;

/* ── Styles ── */
const S = {
  page:{background:'#0B0D13',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif",color:'#EAECF0',padding:24},
  heading:{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:22,marginBottom:4},
  sub:{fontSize:14,color:'#7C8298',marginBottom:24},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24},
  card:{background:'#13161F',border:'1px solid #262B3A',borderRadius:12,padding:'16px 20px',display:'flex',alignItems:'center',gap:16},
  icon:{width:44,height:44,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0},
  cardLabel:{fontSize:11,color:'#7C8298',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'},
  cardVal:{fontSize:20,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginTop:2},
  tableWrap:{background:'#13161F',border:'1px solid #262B3A',borderRadius:12,overflow:'hidden'},
  table:{width:'100%',borderCollapse:'separate',borderSpacing:0},
  th:{background:'#13161F',color:'#7C8298',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',padding:'12px 16px',textAlign:'left',borderBottom:'1px solid #262B3A'},
  td:{padding:'12px 16px',borderBottom:'1px solid #1A1E2B',fontSize:13,verticalAlign:'middle'},
  code:{fontSize:12,background:'#1A1E2B',padding:'3px 8px',borderRadius:4,fontFamily:'monospace',color:'#E8653A'},
  badge:{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600},
  badgeGreen:{background:'rgba(34,197,94,0.12)',color:'#22C55E'},
  badgeRed:{background:'rgba(239,68,68,0.12)',color:'#EF4444'},
  badgeYellow:{background:'rgba(245,158,11,0.12)',color:'#F59E0B'},
  sel:{background:'#13161F',border:'1px solid #262B3A',color:'#EAECF0',padding:'8px 12px',borderRadius:7,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',width:'100%',cursor:'pointer'},
  filterRow:{display:'flex',gap:16,flexWrap:'wrap',marginBottom:24,padding:20,background:'#13161F',border:'1px solid #262B3A',borderRadius:12},
  filterGroup:{flex:'1 1 180px',minWidth:160},
  label:{display:'block',fontSize:11,fontWeight:600,color:'#7C8298',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6},
  btn:{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:7,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",background:'#E8653A',color:'#fff'},
  btnReset:{background:'transparent',color:'#7C8298',border:'1px solid #262B3A',padding:'7px 14px',alignSelf:'flex-end'},
  centerCell:{textAlign:'center'},
  truncate:{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  /* Modal */
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',opacity:0,pointerEvents:'none',transition:'opacity .25s'},
  overlayShow:{opacity:1,pointerEvents:'all'},
  modal:{background:'#1A1E2B',border:'1px solid #262B3A',borderRadius:16,width:560,maxWidth:'90vw',maxHeight:'85vh',overflow:'hidden',transform:'translateY(20px) scale(0.97)',transition:'transform .25s',display:'flex',flexDirection:'column'},
  modalShow:{transform:'translateY(0) scale(1)'},
  modalHead:{padding:'20px 24px',borderBottom:'1px solid #262B3A',display:'flex',alignItems:'center',justifyContent:'space-between'},
  modalBody:{padding:24,overflowY:'auto',flex:1},
  modalFoot:{padding:'16px 24px',borderTop:'1px solid #262B3A',display:'flex',justifyContent:'flex-end',gap:10},
  modalTitle:{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16},
  closeBtn:{background:'none',border:'none',color:'#7C8298',fontSize:18,cursor:'pointer',padding:4},
  studentBanner:{display:'flex',alignItems:'center',gap:12,marginBottom:20,background:'#1A1E2B',borderRadius:8,padding:12},
  avatar:{width:36,height:36,borderRadius:'50%',background:'rgba(232,101,58,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#E8653A'},
  infoGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20},
  infoBox:{background:'#13161F',border:'1px solid #262B3A',borderRadius:8,padding:12},
  infoLabel:{fontSize:10,color:'#7C8298',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600,marginBottom:4},
  infoValue:{fontSize:13,fontWeight:600},
  textGreen:{color:'#22C55E'}, textRed:{color:'#EF4444'}, textYellow:{color:'#F59E0B'},
  /* Radio */
  radioGroup:{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20},
  radioOpt:{position:'relative'},
  radioInput:{position:'absolute',opacity:0,pointerEvents:'none'},
  radioLabel:{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 18px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',border:'1px solid #262B3A',color:'#7C8298',transition:'all .2s'},
  radioLabelIssue:{background:'rgba(34,197,94,0.15)',color:'#22C55E',borderColor:'rgba(34,197,94,0.3)'},
  radioLabelHold:{background:'rgba(245,158,11,0.15)',color:'#F59E0B',borderColor:'rgba(245,158,11,0.3)'},
  radioLabelReject:{background:'rgba(239,68,68,0.15)',color:'#EF4444',borderColor:'rgba(239,68,68,0.3)'},
  textarea:{background:'#13161F',border:'1px solid #262B3A',color:'#EAECF0',padding:'10px 14px',borderRadius:7,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',width:'100%',boxSizing:'border-box',resize:'vertical',minHeight:80},
  btnGhost:{background:'transparent',color:'#7C8298',border:'1px solid #262B3A',padding:'8px 16px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,borderRadius:7},
  btnAccent:{background:'#E8653A',color:'#fff',border:'none',padding:'8px 16px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,borderRadius:7},
  /* Toast */
  toastWrap:{position:'fixed',top:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8},
  toast:{padding:'12px 20px',borderRadius:10,fontSize:13,fontWeight:500,color:'#fff',display:'flex',alignItems:'center',gap:10,animation:'toastIn .3s ease, toastOut .3s ease 2.7s forwards',boxShadow:'0 8px 24px rgba(0,0,0,.3)'},
  toastOk:{background:'linear-gradient(135deg,#16a34a,#15803d)'},
  toastErr:{background:'linear-gradient(135deg,#dc2626,#b91c1c)'},
};

const BADGE_MAP = { issue:S.badgeGreen, hold:S.badgeYellow, reject:S.badgeRed };
const LABEL_MAP = { issue:'Issued', hold:'On Hold', reject:'Rejected' };
const RADIO_CLASS = { issue:'radioLabelIssue', hold:'radioLabelHold', reject:'radioLabelReject' };

export default function HallTicketDecision() {
  const [semester,setSemester]=useState(3);
  const [branch,setBranch]=useState('CS');
  const [section,setSection]=useState('A');
  const [clearance,setClearance]=useState({});
  const [dues,setDues]=useState({});
  const [decisions,setDecisions]=useState({});
  const [modalOpen,setModalOpen]=useState(false);
  const [modalUsn,setModalUsn]=useState(null);
  const [modalDecision,setModalDecision]=useState('hold');
  const [modalReason,setModalReason]=useState('');
  const [toasts,setToasts]=useState([]);

  const subjects = useMemo(()=>getSubjects(semester,branch),[semester,branch]);
  const students = useMemo(()=>getStudents(semester,branch,section),[semester,branch,section]);

  const getClearanceStatus = useCallback((usn)=>{
    let cleared=0,notCleared=0,reExam=0;
    subjects.forEach(s=>{const v=clearance[scKey(usn,s.code)];if(v==='cleared')cleared++;else if(v==='re_exam')reExam++;else notCleared++;});
    return {cleared,notCleared,reExam,total:subjects.length};
  },[clearance,subjects]);

  const getTotalDue = useCallback((usn)=>{
    const d=dues[usn];if(!d)return 0;
    return (d.library||0)+(d.lab||0)+(d.tuition||0)+(d.examFee||0)+(d.hostel||0);
  },[dues]);

  const counts = useMemo(()=>{
    let issued=0,held=0,rejected=0;
    students.forEach(s=>{
      const d=decisions[s.usn];
      if(!d)held++;else if(d.decision==='issue')issued++;else if(d.decision==='reject')rejected++;else held++;
    });
    return {issued,held,rejected};
  },[students,decisions]);

  const addToast=useCallback((msg,type='ok')=>{
    const id=Date.now();setToasts(prev=>[...prev,{id,msg,type}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),3200);
  },[]);

  const openModal=(usn)=>{
    const existing=decisions[usn]||{decision:'hold',reason:''};
    setModalUsn(usn); setModalDecision(existing.decision); setModalReason(existing.reason); setModalOpen(true);
  };

  const closeModal=()=>{setModalOpen(false);setModalUsn(null);};

  const saveDecision=()=>{
    setDecisions(prev=>({...prev,[modalUsn]:{decision:modalDecision,reason:modalReason}}));
    closeModal();
    const lbl=LABEL_MAP[modalDecision];
    addToast(`Hall ticket decision: ${lbl}`, modalDecision==='issue'?'ok':'err');
  };

  const studentName = useMemo(()=>{
    if(!modalUsn)return '';
    return students.find(s=>s.usn===modalUsn)?.name||'';
  },[modalUsn,students]);

  const modalClearance = useMemo(()=>modalUsn?getClearanceStatus(modalUsn):{cleared:0,notCleared:0,reExam:0,total:0},[modalUsn,getClearanceStatus]);
  const modalDues = useMemo(()=>modalUsn?getTotalDue(modalUsn):0,[modalUsn,getTotalDue]);

  const clrOk = modalClearance.cleared===modalClearance.total;
  const clrPartial = modalClearance.cleared>0||modalClearance.reExam>0;

  return (
    <div style={S.page}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
      @keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(40px)}}
      select option{background:#13161F;color:#EAECF0}`}</style>

      <h2 style={S.heading}>Hall Ticket Decision</h2>
      <p style={S.sub}>Make final hall ticket decisions based on clearance and dues status.</p>

      <div style={S.filterRow}>
        <div style={S.filterGroup}>
          <label style={S.label}>Semester</label>
          <select style={S.sel} value={semester} onChange={e=>setSemester(+e.target.value)}>
            {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div style={S.filterGroup}>
          <label style={S.label}>Branch</label>
          <select style={S.sel} value={branch} onChange={e=>setBranch(e.target.value)}>
            {BRANCHES.map(b=><option key={b} value={b}>{b} - {BRANCH_NAMES[b]}</option>)}
          </select>
        </div>
        <div style={S.filterGroup}>
          <label style={S.label}>Section</label>
          <select style={S.sel} value={section} onChange={e=>setSection(e.target.value)}>
            {SECTIONS.map(s=><option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
        <div><button style={S.btnReset} onClick={()=>{setSemester(3);setBranch('CS');setSection('A');}}>↻ Reset</button></div>
      </div>

      <div style={S.grid}>
        <div style={S.card}><div style={{...S.icon,background:'rgba(56,189,248,0.12)',color:'#38BDF8'}}>👤</div><div><p style={S.cardLabel}>Total Students</p><p style={S.cardVal}>{students.length}</p></div></div>
        <div style={S.card}><div style={{...S.icon,background:'rgba(34,197,94,0.12)',color:'#22C55E'}}>🎫</div><div><p style={S.cardLabel}>Issued</p><p style={S.cardVal}>{counts.issued}</p></div></div>
        <div style={S.card}><div style={{...S.icon,background:'rgba(245,158,11,0.12)',color:'#F59E0B'}}>⏸</div><div><p style={S.cardLabel}>On Hold</p><p style={S.cardVal}>{counts.held}</p></div></div>
        <div style={S.card}><div style={{...S.icon,background:'rgba(239,68,68,0.12)',color:'#EF4444'}}>🚫</div><div><p style={S.cardLabel}>Rejected</p><p style={S.cardVal}>{counts.rejected}</p></div></div>
      </div>

      <div style={S.tableWrap}>
        <div style={{overflowX:'auto'}}>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>USN</th><th style={S.th}>Student Name</th><th style={{...S.th,...S.centerCell}}>Clearance</th><th style={{...S.th,...S.centerCell}}>Dues</th><th style={S.th}>Decision</th><th style={S.th}>Reason</th><th style={{...S.th,width:110}}>Actions</th>
            </tr></thead>
            <tbody>
              {students.map(st=>{
                const cs=getClearanceStatus(st.usn);
                const td=getTotalDue(st.usn);
                const dec=decisions[st.usn]||{decision:'hold',reason:''};
                const clrAll=cs.cleared===cs.total;
                const clrIcon=clrAll?'✓':(cs.cleared>0||cs.reExam>0)?'⚠':'✕';
                const clrColor=clrAll?S.textGreen:(cs.cleared>0||cs.reExam>0)?S.textYellow:S.textRed;
                const duesIcon=td>0?'✕':'✓';
                const duesColor=td>0?S.textRed:S.textGreen;
                return (
                  <tr key={st.usn} onMouseEnter={e=>e.currentTarget.style.background='rgba(232,101,58,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={S.td}><code style={S.code}>{st.usn}</code></td>
                    <td style={{...S.td,fontWeight:500}}>{st.name}</td>
                    <td style={{...S.td,...S.centerCell}}>
                      <span style={{...clrColor,fontSize:14}}>{clrIcon}</span>
                      <span style={{fontSize:11,color:'#7C8298',marginLeft:6}}>{cs.cleared}/{cs.total}</span>
                    </td>
                    <td style={{...S.td,...S.centerCell}}>
                      <span style={{...duesColor,fontSize:14}}>{duesIcon}</span>
                      <span style={{fontSize:11,color:'#7C8298',marginLeft:6}}>{td>0?`₹${td.toLocaleString()}`:'Nil'}</span>
                    </td>
                    <td style={S.td}><span style={{...S.badge,...BADGE_MAP[dec.decision]}}>{LABEL_MAP[dec.decision]}</span></td>
                    <td style={{...S.td,color:'#7C8298',fontSize:12}}><span style={S.truncate}>{dec.reason||'—'}</span></td>
                    <td style={S.td}><button style={S.btn} onClick={()=>openModal(st.usn)}>✎ Update</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <div style={{...S.overlay,...(modalOpen?S.overlayShow:{})}} onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
        <div style={{...S.modal,...(modalOpen?S.modalShow:{})}}>
          <div style={S.modalHead}>
            <span style={S.modalTitle}>Hall Ticket Decision</span>
            <button style={S.closeBtn} onClick={closeModal}>✕</button>
          </div>
          <div style={S.modalBody}>
            <div style={S.studentBanner}>
              <div style={S.avatar}>{studentName.split(' ').map(w=>w[0]).join('')}</div>
              <div><p style={{fontSize:14,fontWeight:600}}>{studentName}</p><p style={{fontSize:12,color:'#7C8298',fontFamily:'monospace'}}>{modalUsn}</p></div>
            </div>

            <div style={S.infoGrid}>
              <div style={S.infoBox}>
                <p style={S.infoLabel}>Subject Clearance</p>
                <p style={{...S.infoValue,...(clrOk?S.textGreen:clrPartial?S.textYellow:S.textRed)}}>
                  {clrOk?'✓ All subjects cleared':`⚠ ${modalClearance.cleared}/${modalClearance.total} cleared`}
                  {modalClearance.reExam>0 && <span style={{marginLeft:8,fontSize:11}}> ({modalClearance.reExam} re-exam)</span>}
                </p>
              </div>
              <div style={S.infoBox}>
                <p style={S.infoLabel}>Dues Status</p>
                <p style={{...S.infoValue,...(modalDues>0?S.textRed:S.textGreen)}}>
                  {modalDues>0?`✕ Outstanding: ₹${modalDues.toLocaleString()}`:'✓ No outstanding dues'}
                </p>
              </div>
            </div>

            <div>
              <label style={S.label}>Decision</label>
              <div style={S.radioGroup}>
                {['issue','hold','reject'].map(val=>(
                  <div key={val} style={S.radioOpt}>
                    <input type="radio" name="htd" className="htd-radio" value={val} checked={modalDecision===val} onChange={()=>setModalDecision(val)} style={S.radioInput} id={`htd-${val}`}/>
                    <label htmlFor={`htd-${val}`} style={{...S.radioLabel,...(modalDecision===val?S[RADIO_CLASS[val]]:{})}}>
                      {val==='issue'?'🎫 Issue':val==='hold'?'⏸ Hold':'🚫 Reject'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {modalDecision!=='issue' && (
              <div>
                <label style={S.label}>Reason</label>
                <textarea style={S.textarea} value={modalReason} onChange={e=>setModalReason(e.target.value)} placeholder="Enter reason for hold/rejection..." onFocus={e=>e.target.style.borderColor='#E8653A'} onBlur={e=>e.target.style.borderColor='#262B3A'}/>
              </div>
            )}
          </div>
          <div style={S.modalFoot}>
            <button style={S.btnGhost} onClick={closeModal}>Cancel</button>
            <button style={S.btnAccent} onClick={saveDecision}>💾 Save Decision</button>
          </div>
        </div>
      </div>

      <div style={S.toastWrap}>
        {toasts.map(t=><div key={t.id} style={{...S.toast,...(t.type==='ok'?S.toastOk:S.toastErr)}}>{t.type==='ok'?'✓':'✕'} {t.msg}</div>)}
      </div>
    </div>
  );
}