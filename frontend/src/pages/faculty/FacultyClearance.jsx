import React, { useState, useMemo } from 'react';

var BRANCHES = ['CG','CS','CD','IS','CV','ME','AI'];
var BRANCH_NAMES = {
  CG:'CSE (Design & Tech)', CS:'Computer Science & Engg', CD:'Cyber Security',
  IS:'Information Science', CV:'Civil Engineering', ME:'Mechanical Engineering', AI:'AI & Machine Learning'
};
var SEMESTERS = [1,2,3,4,5,6,7,8];
var SECTIONS = ['A','B'];
var STUDENT_NAMES = ['Arjun Sharma','Priya Patel','Rahul Kumar','Sneha Reddy','Vikram Singh','Ananya Iyer','Karthik Nair','Divya Menon','Rohan Das','Meera Joshi'];
var CLEARANCE_OPTIONS = [
  {value:'cleared', label:'Cleared'},
  {value:'not_cleared', label:'Not Cleared'},
  {value:'re_exam', label:'Re-Exam'}
];
var COMMON_SUBS = {
  1:[['23MAT101','Calculus & Linear Algebra'],['23PHY101','Engineering Physics'],['23CHE101','Engineering Chemistry'],['23EG101','English for Communication'],['23CSE101','Programming in C'],['23ECC101','Constitution of India & Ethics']],
  2:[['23MAT201','Advanced Calculus & Statistics'],['23PHY201','Physics Laboratory'],['23EVS201','Environmental Science'],['23CSE201','Data Structures with C'],['23DBM201','Database Management Systems'],['23EDC201','Basic Electronics']]
};
var BRANCH_SUBS = {
  CG:[['23CG301','Design Thinking & Innovation'],['23CG302','OOP with Java'],['23CG303','Digital Logic Design'],['23CG304','Computer Graphics Fundamentals'],['23CG401','Analysis of Algorithms'],['23CG402','UI/UX Design Principles'],['23CG403','Operating Systems'],['23CG404','Web Technologies & Frameworks'],['23CG501','Software Engineering'],['23CG502','Computer Networks'],['23CG503','Advanced Database Systems'],['23CG504','Design Patterns & UX Research'],['23CG601','ML for Designers'],['23CG602','Cloud Computing & DevOps'],['23CG603','Information Security'],['23CG604','Project Work Phase I']],
  CS:[['23CS301','OOP with Java'],['23CS302','Digital Logic Design'],['23CS303','Discrete Mathematics'],['23CS304','Computer Organization & Arch'],['23CS401','Analysis of Algorithms'],['23CS402','Operating Systems'],['23CS403','Microprocessors & Interfacing'],['23CS404','Theory of Computation'],['23CS501','Software Engineering'],['23CS502','Computer Networks'],['23CS503','Compiler Design'],['23CS504','Database Applications'],['23CS601','Machine Learning'],['23CS602','Cloud Computing'],['23CS603','Information Security'],['23CS604','Project Work Phase I']],
  CD:[['23CD301','OOP with Java'],['23CD302','Digital Logic Design'],['23CD303','Network Fundamentals'],['23CD304','Linux System Administration'],['23CD401','Cryptography Basics'],['23CD402','Operating Systems'],['23CD403','Web Application Security'],['23CD404','Database Systems'],['23CD501','Ethical Hacking & Pen Testing'],['23CD502','Network Security'],['23CD503','Malware Analysis'],['23CD504','Security Auditing & Compliance'],['23CD601','Advanced Cryptography'],['23CD602','Cloud Security'],['23CD603','Digital Forensics'],['23CD604','Project Work Phase I']],
  IS:[['23IS301','OOP with Java'],['23IS302','Digital Logic Design'],['23IS303','Discrete Structures'],['23IS304','Data Communication'],['23IS401','Analysis of Algorithms'],['23IS402','Operating Systems'],['23IS403','Database Management Systems'],['23IS404','Computer Networks'],['23IS501','Software Engineering'],['23IS502','Web Technologies'],['23IS503','Data Mining & Warehousing'],['23IS504','Information Retrieval Systems'],['23IS601','Big Data Analytics'],['23IS602','Machine Learning'],['23IS603','Cloud Computing'],['23IS604','Project Work Phase I']],
  CV:[['23CV301','Strength of Materials'],['23CV302','Engineering Geology'],['23CV303','Surveying - I'],['23CV304','Fluid Mechanics'],['23CV401','Structural Analysis - I'],['23CV402','Concrete Technology'],['23CV403','Hydraulics & Water Resources'],['23CV404','Transportation Engineering'],['23CV501','Design of RC Structures'],['23CV502','Geotechnical Engineering'],['23CV503','Environmental Engineering'],['23CV504','Estimation & Costing'],['23CV601','Advanced Structural Design'],['23CV602','Construction Management'],['23CV603','GIS & Remote Sensing'],['23CV604','Project Work Phase I']],
  ME:[['23ME301','Engineering Thermodynamics'],['23ME302','Manufacturing Technology - I'],['23ME303','Kinematics of Machinery'],['23ME304','Material Science & Metallurgy'],['23ME401','Fluid Mechanics'],['23ME402','Strength of Materials'],['23ME403','Metrology & Quality Control'],['23ME404','CAD/CAM'],['23ME501','Heat Transfer'],['23ME502','Design of Machine Elements'],['23ME503','Dynamics of Machinery'],['23ME504','Industrial Engineering & Mgmt'],['23ME601','Advanced Manufacturing'],['23ME602','Mechatronics'],['23ME603','Automobile Engineering'],['23ME604','Project Work Phase I']],
  AI:[['23AI301','OOP with Python'],['23AI302','Linear Algebra for AI'],['23AI303','Probability & Statistics'],['23AI304','Data Structures in Python'],['23AI401','Machine Learning Foundations'],['23AI402','Deep Learning with TensorFlow'],['23AI403','Natural Language Processing'],['23AI404','Computer Vision Basics'],['23AI501','Reinforcement Learning'],['23AI502','MLOps & Deployment'],['23AI503','AI Ethics & Governance'],['23AI504','Big Data for AI Systems'],['23AI601','Advanced Deep Learning'],['23AI602','Generative AI Techniques'],['23AI603','Edge AI & IoT'],['23AI604','Project Work Phase I']]
};

function getSubjects(sem, branch) {
  if (sem <= 2) {
    return COMMON_SUBS[sem].map(function(item) { return {code: item[0], name: item[1]}; });
  }
  var pool = BRANCH_SUBS[branch];
  if (!pool) return [];
  var start = (sem - 3) * 4;
  return pool.slice(start, start + 4).map(function(item) { return {code: item[0], name: item[1]}; });
}

function getStudents(sem, branch, section) {
  var si = section === 'A' ? 0 : 1;
  var start = si * 5;
  var result = [];
  for (var i = 0; i < 5; i++) {
    result.push({
      usn: '1AT23' + branch + String(start + i + 1).padStart(3, '0'),
      name: STUDENT_NAMES[(start + i) % STUDENT_NAMES.length],
      semester: sem,
      branch: branch,
      section: section
    });
  }
  return result;
}

function scKey(usn, code) {
  return usn + '-' + code;
}

var S = {
  page: {background:'#0B0D13', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", color:'#EAECF0', padding:28},
  heading: {fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, marginBottom:4},
  sub: {fontSize:13, color:'#7C8298', marginBottom:20},
  filterRow: {display:'flex', gap:16, flexWrap:'wrap', marginBottom:20, padding:18, background:'#13161F', border:'1px solid #262B3A', borderRadius:12},
  filterGrp: {flex:'1 1 160px', minWidth:140},
  lbl: {display:'block', fontSize:10, fontWeight:600, color:'#7C8298', textTransform:'uppercase', letterSpacing:0.5, marginBottom:5},
  sel: {background:'#0B0D13', border:'1px solid #262B3A', color:'#EAECF0', padding:'8px 12px', borderRadius:7, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', width:'100%', cursor:'pointer'},
  scSel: {width:150, background:'#13161F', border:'1px solid #262B3A', color:'#EAECF0', padding:'7px 10px', borderRadius:7, fontSize:12, fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer'},
  btnReset: {padding:'8px 14px', borderRadius:7, fontSize:12, fontWeight:600, border:'1px solid #262B3A', background:'transparent', color:'#7C8298', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", alignSelf:'flex-end'},
  statsGrid: {display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:20},
  statCard: {background:'#13161F', border:'1px solid #262B3A', borderRadius:12, padding:'16px 18px', display:'flex', alignItems:'center', gap:14},
  statIcon: {width:42, height:42, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0},
  statLbl: {fontSize:10, color:'#7C8298', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5},
  statVal: {fontSize:22, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, marginTop:1},
  tableWrap: {background:'#13161F', border:'1px solid #262B3A', borderRadius:12, overflow:'hidden'},
  table: {width:'100%', borderCollapse:'separate', borderSpacing:0},
  th: {background:'#13161F', color:'#7C8298', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, padding:'11px 14px', textAlign:'left', borderBottom:'1px solid #262B3A'},
  td: {padding:'11px 14px', borderBottom:'1px solid #1A1E2B', fontSize:13},
  code: {fontSize:11, background:'#1A1E2B', padding:'2px 7px', borderRadius:4, fontFamily:'monospace', color:'#E8653A'},
  badge: {display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:600},
  badgeGreen: {background:'rgba(34,197,94,0.12)', color:'#22C55E'},
  badgeRed: {background:'rgba(239,68,68,0.12)', color:'#EF4444'},
  badgeYellow: {background:'rgba(245,158,11,0.12)', color:'#F59E0B'},
  overlay: {position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'},
  modal: {background:'#1A1E2B', border:'1px solid #262B3A', borderRadius:16, width:580, maxWidth:'90vw', maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column'},
  modalHead: {padding:'20px 24px', borderBottom:'1px solid #262B3A', display:'flex', alignItems:'center', justifyContent:'space-between'},
  modalBody: {padding:24, overflowY:'auto', flex:1},
  modalFoot: {padding:'16px 24px', borderTop:'1px solid #262B3A', display:'flex', justifyContent:'flex-end', gap:10},
  modalTitle: {fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16},
  closeBtn: {background:'none', border:'none', color:'#7C8298', fontSize:18, cursor:'pointer', padding:4},
  studentBanner: {display:'flex', alignItems:'center', gap:12, marginBottom:20, background:'#1A1E2B', borderRadius:8, padding:12},
  avatar: {width:36, height:36, borderRadius:'50%', background:'rgba(232,101,58,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#E8653A', flexShrink:0},
  scRow: {display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #262B3A'},
  btnGhost: {display:'inline-flex', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:7, fontSize:12, fontWeight:600, border:'1px solid #262B3A', background:'transparent', color:'#7C8298', cursor:'pointer', fontFamily:"'DM Sans',sans-serif"},
  btnAccent: {display:'inline-flex', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:7, fontSize:12, fontWeight:600, border:'none', background:'#E8653A', color:'#fff', cursor:'pointer', fontFamily:"'DM Sans',sans-serif"},
  toastWrap: {position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:8},
  toast: {padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:500, color:'#fff', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 24px rgba(0,0,0,0.3)', background:'linear-gradient(135deg,#16a34a,#15803d)'}
};

function mergeStyles() {
  var result = {};
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i]) {
      var keys = Object.keys(arguments[i]);
      for (var j = 0; j < keys.length; j++) {
        result[keys[j]] = arguments[i][keys[j]];
      }
    }
  }
  return result;
}

var inj = false;
function injS() {
  if (inj) return;
  inj = true;
  var t = document.createElement('style');
  t.textContent = 'select option{background:#13161F;color:#EAECF0}@keyframes tIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}@keyframes tOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(40px)}}';
  document.head.appendChild(t);
}

export default function SubjectClearance() {
  var semState = useState(3);
  var sem = semState[0];
  var setSem = semState[1];

  var brState = useState('CS');
  var br = brState[0];
  var setBr = brState[1];

  var secState = useState('A');
  var sec = secState[0];
  var setSec = secState[1];

  var clrState = useState({});
  var clearance = clrState[0];
  var setClearance = clrState[1];

  var modalState = useState(false);
  var modalOpen = modalState[0];
  var setModalOpen = modalState[1];

  var musnState = useState(null);
  var modalUsn = musnState[0];
  var setModalUsn = musnState[1];

  var mdataState = useState({});
  var modalData = mdataState[0];
  var setModalData = mdataState[1];

  var toastState = useState([]);
  var toasts = toastState[0];
  var setToasts = toastState[1];

  React.useEffect(function() { injS(); }, []);

  var subjects = useMemo(function() { return getSubjects(sem, br); }, [sem, br]);
  var students = useMemo(function() { return getStudents(sem, br, sec); }, [sem, br, sec]);

  function getClearance(usn) {
    var cleared = 0, notCleared = 0, reExam = 0;
    for (var i = 0; i < subjects.length; i++) {
      var v = clearance[scKey(usn, subjects[i].code)];
      if (v === 'cleared') cleared++;
      else if (v === 're_exam') reExam++;
      else notCleared++;
    }
    return {cleared: cleared, notCleared: notCleared, reExam: reExam, total: subjects.length};
  }

  var counts = useMemo(function() {
    var full = 0, partial = 0, none = 0;
    for (var i = 0; i < students.length; i++) {
      var c = getClearance(students[i].usn);
      if (c.cleared === c.total) full++;
      else if (c.cleared > 0 || c.reExam > 0) partial++;
      else none++;
    }
    return {full: full, partial: partial, none: none};
  }, [students, clearance, subjects]);

  function addToast(msg) {
    var id = Date.now() + Math.random();
    setToasts(function(prev) { var n = prev.slice(); n.push({id: id, msg: msg}); return n; });
    setTimeout(function() { setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); }); }, 3200);
  }

  function openModal(usn) {
    var data = {};
    for (var i = 0; i < subjects.length; i++) {
      data[subjects[i].code] = clearance[scKey(usn, subjects[i].code)] || 'not_cleared';
    }
    setModalUsn(usn);
    setModalData(data);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalUsn(null);
    setModalData({});
  }

  function handleModalChange(code, val) {
    var next = {};
    var k = Object.keys(modalData);
    for (var i = 0; i < k.length; i++) next[k[i]] = modalData[k[i]];
    next[code] = val;
    setModalData(next);
  }

  function saveClearance() {
    if (!modalUsn) return;
    var updated = {};
    var ck = Object.keys(clearance);
    for (var i = 0; i < ck.length; i++) updated[ck[i]] = clearance[ck[i]];
    for (var j = 0; j < subjects.length; j++) {
      updated[scKey(modalUsn, subjects[j].code)] = modalData[subjects[j].code] || 'not_cleared';
    }
    setClearance(updated);
    closeModal();
    addToast('Subject clearance updated successfully');
  }

  var studentName = '';
  if (modalUsn) {
    for (var sni = 0; sni < students.length; sni++) {
      if (students[sni].usn === modalUsn) { studentName = students[sni].name; break; }
    }
  }
  var avatarInitials = '';
  if (studentName) {
    var parts = studentName.split(' ');
    for (var pi = 0; pi < parts.length; pi++) { if (parts[pi].length > 0) avatarInitials += parts[pi][0]; }
  }

  function overallBadge(usn) {
    var c = getClearance(usn);
    if (c.cleared === c.total) return {style: S.badgeGreen, text: 'Cleared'};
    if (c.cleared > 0 || c.reExam > 0) return {style: S.badgeYellow, text: 'Partial'};
    return {style: S.badgeRed, text: 'Not Cleared'};
  }

  function resetFilters() { setSem(3); setBr('CS'); setSec('A'); }
  function handleFocus(e) { e.target.style.borderColor = '#E8653A'; }
  function handleBlur(e) { e.target.style.borderColor = '#262B3A'; }
  function rowEnter(e) { e.currentTarget.style.background = 'rgba(232,101,58,0.04)'; }
  function rowLeave(e) { e.currentTarget.style.background = 'transparent'; }

  function clearAllStudents() {
    if (students.length === 0) {
      addToast('No students found for selected filters');
      return;
    }
    if (!window.confirm('Mark all ' + students.length + ' students as cleared for all subjects?')) {
      return;
    }
    var updated = {};
    var ck = Object.keys(clearance);
    for (var i = 0; i < ck.length; i++) updated[ck[i]] = clearance[ck[i]];
    for (var si = 0; si < students.length; si++) {
      for (var sj = 0; sj < subjects.length; sj++) {
        updated[scKey(students[si].usn, subjects[sj].code)] = 'cleared';
      }
    }
    setClearance(updated);
    addToast('All ' + students.length + ' students marked as cleared!');
  }

  var semOpts = [];
  for (var si = 0; si < SEMESTERS.length; si++) semOpts.push(<option key={SEMESTERS[si]} value={SEMESTERS[si]}>Semester {SEMESTERS[si]}</option>);
  var brOpts = [];
  for (var bi = 0; bi < BRANCHES.length; bi++) brOpts.push(<option key={BRANCHES[bi]} value={BRANCHES[bi]}>{BRANCHES[bi]} - {BRANCH_NAMES[BRANCHES[bi]]}</option>);
  var secOpts = [];
  for (var sci = 0; sci < SECTIONS.length; sci++) secOpts.push(<option key={SECTIONS[sci]} value={SECTIONS[sci]}>Section {SECTIONS[sci]}</option>);

  var tableRows = [];
  for (var ri = 0; ri < students.length; ri++) {
    var st = students[ri];
    var c = getClearance(st.usn);
    var ob = overallBadge(st.usn);
    var reExamBadge = null;
    if (c.reExam > 0) {
      reExamBadge = <span style={mergeStyles(S.badge, S.badgeYellow, {marginLeft: 8})}>{c.reExam} Re-Exam</span>;
    }
    tableRows.push(
      <tr key={st.usn} onMouseEnter={rowEnter} onMouseLeave={rowLeave}>
        <td style={S.td}><code style={S.code}>{st.usn}</code></td>
        <td style={mergeStyles(S.td, {fontWeight: 500})}>{st.name}</td>
        <td style={S.td}>
          <span style={{fontSize: 14}}>{c.cleared}<span style={{color: '#7C8298'}}> / {c.total}</span></span>
          {reExamBadge}
        </td>
        <td style={S.td}><span style={mergeStyles(S.badge, ob.style)}>{ob.text}</span></td>
        <td style={S.td}>
          <button style={S.btnAccent} onClick={function() { openModal(st.usn); }}>\u270E Update</button>
        </td>
      </tr>
    );
  }

  var modalScRows = [];
  for (var mi = 0; mi < subjects.length; mi++) {
    var sub = subjects[mi];
    var isLast = mi === subjects.length - 1;
    var clOpts = [];
    for (var ci = 0; ci < CLEARANCE_OPTIONS.length; ci++) {
      clOpts.push(<option key={CLEARANCE_OPTIONS[ci].value} value={CLEARANCE_OPTIONS[ci].value}>{CLEARANCE_OPTIONS[ci].label}</option>);
    }
    modalScRows.push(
      <div key={sub.code} style={mergeStyles(S.scRow, isLast ? {borderBottom: 'none'} : {})}>
        <div>
          <code style={S.code}>{sub.code}</code>
          <span style={{fontSize: 13, marginLeft: 12}}>{sub.name}</span>
        </div>
        <select style={S.scSel} value={modalData[sub.code] || 'not_cleared'} onChange={function(e) { handleModalChange(sub.code, e.target.value); }} onFocus={handleFocus} onBlur={handleBlur}>
          {clOpts}
        </select>
      </div>
    );
  }

  var toastEls = [];
  for (var ti = 0; ti < toasts.length; ti++) {
    toastEls.push(
      <div key={toasts[ti].id} style={mergeStyles(S.toast, {animation: 'tIn 0.3s ease, tOut 0.3s ease 2.7s forwards'})}>
        \u2705 {toasts[ti].msg}
      </div>
    );
  }

  var modalEl = null;
  if (modalOpen) {
    modalEl = (
      <div style={S.overlay} onClick={function(e) { if (e.target === e.currentTarget) closeModal(); }}>
        <div style={S.modal}>
          <div style={S.modalHead}>
            <span style={S.modalTitle}>Update Subject Clearance</span>
            <button style={S.closeBtn} onClick={closeModal}>\u2715</button>
          </div>
          <div style={S.modalBody}>
            <div style={S.studentBanner}>
              <div style={S.avatar}>{avatarInitials}</div>
              <div>
                <p style={{fontSize: 14, fontWeight: 600}}>{studentName}</p>
                <p style={{fontSize: 12, color: '#7C8298', fontFamily: 'monospace'}}>{modalUsn}</p>
              </div>
            </div>
            {modalScRows}
          </div>
          <div style={S.modalFoot}>
            <button style={S.btnGhost} onClick={closeModal}>Cancel</button>
            <button style={S.btnAccent} onClick={saveClearance}>\uD83D\uDCBE Save Changes</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <h2 style={S.heading}>Subject Clearance</h2>
          <p style={S.sub}>Update and track subject-wise clearance status for students.</p>
        </div>
        <button style={mergeStyles(S.btnAccent, {padding: '10px 20px', fontSize: 13, fontWeight: 700, height: 'fit-content'})} onClick={clearAllStudents}>✓ ALL CLEAR</button>
      </div>

      <div style={S.filterRow}>
        <div style={S.filterGrp}>
          <label style={S.lbl}>Semester</label>
          <select style={S.sel} value={sem} onChange={function(e) { setSem(Number(e.target.value)); }} onFocus={handleFocus} onBlur={handleBlur}>{semOpts}</select>
        </div>
        <div style={S.filterGrp}>
          <label style={S.lbl}>Branch</label>
          <select style={S.sel} value={br} onChange={function(e) { setBr(e.target.value); }} onFocus={handleFocus} onBlur={handleBlur}>{brOpts}</select>
        </div>
        <div style={S.filterGrp}>
          <label style={S.lbl}>Section</label>
          <select style={S.sel} value={sec} onChange={function(e) { setSec(e.target.value); }} onFocus={handleFocus} onBlur={handleBlur}>{secOpts}</select>
        </div>
        <div style={mergeStyles(S.filterGrp, {display: 'flex', gap: 10, alignSelf: 'flex-end'})}>
          <button style={S.btnReset} onClick={resetFilters}>{'\u21BB'} Reset</button>
          <button style={mergeStyles(S.btnAccent, {padding: '8px 16px', fontSize: 12, fontWeight: 600})} onClick={clearAllStudents}>✓ Clear All Students</button>
        </div>
      </div>

      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <div style={mergeStyles(S.statIcon, {background:'rgba(56,189,248,0.12)', color:'#38BDF8'})}>{'\uD83D\uDC64'}</div>
          <div><p style={S.statLbl}>Total Students</p><p style={S.statVal}>{students.length}</p></div>
        </div>
        <div style={S.statCard}>
          <div style={mergeStyles(S.statIcon, {background:'rgba(34,197,94,0.12)', color:'#22C55E'})}>{'\u2705'}</div>
          <div><p style={S.statLbl}>Fully Cleared</p><p style={S.statVal}>{counts.full}</p></div>
        </div>
        <div style={S.statCard}>
          <div style={mergeStyles(S.statIcon, {background:'rgba(245,158,11,0.12)', color:'#F59E0B'})}>{'\u25D0'}</div>
          <div><p style={S.statLbl}>Partially Cleared</p><p style={S.statVal}>{counts.partial}</p></div>
        </div>
        <div style={S.statCard}>
          <div style={mergeStyles(S.statIcon, {background:'rgba(239,68,68,0.12)', color:'#EF4444'})}>{'\u2715'}</div>
          <div><p style={S.statLbl}>Not Cleared</p><p style={S.statVal}>{counts.none}</p></div>
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>USN</th>
            <th style={S.th}>Student Name</th>
            <th style={S.th}>Cleared / Total</th>
            <th style={S.th}>Overall Status</th>
            <th style={mergeStyles(S.th, {width: 120})}>Actions</th>
          </tr></thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>

      {modalEl}

      <div style={S.toastWrap}>{toastEls}</div>
    </div>
  );
}