// ============================================================
// Constants
// ============================================================
export const BRANCHES = [
  { code: 'CG', name: 'Computer Science & Engineering', short: 'CSE', spec: null },
  { code: 'CS', name: 'CSE (Data Science)', short: 'CSE-DS', spec: 'Data Science' },
  { code: 'CD', name: 'CSE (Design)', short: 'CSE-CD', spec: 'Computer Science & Design' },
  { code: 'IS', name: 'Information Science & Engineering', short: 'ISE', spec: null },
  { code: 'EC', name: 'Electronics & Communication Engineering', short: 'ECE', spec: null },
  { code: 'AI', name: 'Artificial Intelligence & Machine Learning', short: 'AI&ML', spec: null },
  { code: 'ME', name: 'Mechanical Engineering', short: 'ME', spec: null },
  { code: 'CV', name: 'Civil Engineering', short: 'CE', spec: null }
]

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
export const SECTIONS = ['A', 'B', 'C']

export const FACULTY_POOL = [
  'Dr. Priya Kumar', 'Prof. Suresh M.', 'Dr. Lakshmi N.', 'Prof. Ramesh K.', 'Dr. Anitha R.',
  'Prof. Venkatesh S.', 'Dr. Meera Krishnan', 'Prof. Mohan Das', 'Dr. Savitha B.', 'Prof. Arun G.',
  'Dr. Kavitha S.', 'Prof. Deepak Rao', 'Dr. Shobha M.', 'Prof. Nagaraj B.', 'Dr. Radhika P.',
  'Prof. Girish H.', 'Dr. Bharathi N.', 'Prof. Manjunath T.', 'Dr. Uma Devi', 'Prof. Kiran J.'
]

export const REMARKS_OPTIONS = [
  'Attendance below 75%', 'Assignments not submitted', 'Internal marks below threshold',
  'Discipline issue reported', 'Lab records incomplete', 'Miniproject not submitted',
  'Backlog in prerequisite subject', 'Irregular attendance', 'Shortage of attendance'
]

export const PLACEMENT_OPTIONS = ['Placed', 'Unplaced', 'Higher Studies', 'Entrepreneurship', 'Not Eligible', null]

// ============================================================
// Subject Definitions
// ============================================================
const T = 'theory', L = 'lab', P = 'project', S = 'seminar', I = 'internship'
const sub = (code, name, type) => ({ code, name, type })

const COMMON_SEM1 = [
  sub('MA11','Engineering Mathematics - I',T), sub('PH11','Engineering Physics',T),
  sub('CH11','Engineering Chemistry',T), sub('EE11','Basic Electrical Engineering',T),
  sub('CS11','Programming in C',T), sub('EG11','Engineering Graphics',T),
  sub('PH1L','Physics Lab',L), sub('CH1L','Chemistry Lab',L), sub('CS1L','C Programming Lab',L)
]
const COMMON_SEM2 = [
  sub('MA21','Engineering Mathematics - II',T), sub('PH21','Engineering Physics - II',T),
  sub('ME21','Basic Mechanical Engineering',T), sub('EC21','Basic Electronics',T),
  sub('CS21','Data Structures with C',T), sub('EV21','Environmental Studies',T),
  sub('ME2L','Mechanical Workshop',L), sub('EC2L','Electronics Lab',L), sub('CS2L','Data Structures Lab',L)
]
const COMMON_SEM8 = [
  sub('PR80','Project Work Phase - II',P), sub('IN80','Technical Seminar',S), sub('IN81','Internship Report',I)
]

const SEM3 = {
  CG:[sub('CS301','Data Structures & Applications',T),sub('MA301','Discrete Mathematical Structures',T),sub('CS302','Object Oriented Programming with Java',T),sub('CS303','Digital Logic Design',T),sub('CS304','Computer Organization',T),sub('CS3L1','Data Structures Lab',L),sub('CS3L2','Java Programming Lab',L)],
  CS:[sub('CS301','Data Structures & Applications',T),sub('MA301','Discrete Mathematical Structures',T),sub('CS302','Object Oriented Programming with Java',T),sub('DS301','Introduction to Data Science',T),sub('CS304','Computer Organization',T),sub('CS3L1','Data Structures Lab',L),sub('DS3L1','Data Science Lab',L)],
  CD:[sub('CS301','Data Structures & Applications',T),sub('MA301','Discrete Mathematical Structures',T),sub('CS302','Object Oriented Programming with Java',T),sub('CD301','Design Thinking & Innovation',T),sub('CS304','Computer Organization',T),sub('CS3L1','Data Structures Lab',L),sub('CD3L1','Design Fundamentals Lab',L)],
  IS:[sub('IS301','Data Structures & Applications',T),sub('MA301','Discrete Mathematical Structures',T),sub('IS302','Object Oriented Programming with Java',T),sub('IS303','Database Management Systems',T),sub('IS304','Web Technologies',T),sub('IS3L1','Data Structures Lab',L),sub('IS3L2','Web Technologies Lab',L)],
  EC:[sub('EC301','Analog Electronics',T),sub('EC302','Network Analysis',T),sub('EC303','Signals & Systems',T),sub('EC304','Digital Electronics',T),sub('EC305','Electromagnetic Theory',T),sub('EC3L1','Analog Electronics Lab',L),sub('EC3L2','Digital Electronics Lab',L)],
  AI:[sub('AI301','Data Structures & Applications',T),sub('MA301','Discrete Mathematical Structures',T),sub('MA302','Linear Algebra & Probability',T),sub('AI302','Python Programming',T),sub('AI303','Object Oriented Programming with Python',T),sub('AI3L1','Data Structures Lab',L),sub('AI3L2','Python Programming Lab',L)],
  ME:[sub('ME301','Engineering Thermodynamics',T),sub('ME302','Kinematics of Machinery',T),sub('ME303','Strength of Materials',T),sub('ME304','Fluid Mechanics',T),sub('ME305','Manufacturing Technology',T),sub('ME3L1','Thermodynamics Lab',L),sub('ME3L2','SOM Lab',L)],
  CV:[sub('CV301','Strength of Materials',T),sub('CV302','Surveying',T),sub('CV303','Fluid Mechanics',T),sub('CV304','Building Materials & Construction',T),sub('CV305','Engineering Geology',T),sub('CV3L1','SOM Lab',L),sub('CV3L2','Surveying Lab',L)]
}
const SEM4 = {
  CG:[sub('CS401','Mathematical Foundations of CS',T),sub('CS402','Operating Systems',T),sub('CS403','Microprocessors & Microcontrollers',T),sub('CS404','Analysis & Design of Algorithms',T),sub('CS405','Software Engineering',T),sub('CS4L1','OS Lab',L),sub('CS4L2','Microcontroller Lab',L)],
  CS:[sub('CS401','Mathematical Foundations of CS',T),sub('CS402','Operating Systems',T),sub('DS401','Statistical Methods for Data Science',T),sub('CS404','Analysis & Design of Algorithms',T),sub('DS402','Data Visualization',T),sub('CS4L1','OS Lab',L),sub('DS4L1','Data Visualization Lab',L)],
  CD:[sub('CS401','Mathematical Foundations of CS',T),sub('CS402','Operating Systems',T),sub('CD401','Human Computer Interaction',T),sub('CS404','Analysis & Design of Algorithms',T),sub('CD402','Visual Communication Design',T),sub('CS4L1','OS Lab',L),sub('CD4L1','UI/UX Design Lab',L)],
  IS:[sub('IS401','Mathematical Foundations of IS',T),sub('IS402','Operating Systems',T),sub('IS403','Computer Networks',T),sub('IS404','Analysis & Design of Algorithms',T),sub('IS405','Software Engineering',T),sub('IS4L1','OS Lab',L),sub('IS4L2','Networks Lab',L)],
  EC:[sub('EC401','Linear Integrated Circuits',T),sub('EC402','Control Systems',T),sub('EC403','Digital Signal Processing',T),sub('EC404','Communication Engineering',T),sub('EC405','Microprocessors & Microcontrollers',T),sub('EC4L1','LIC Lab',L),sub('EC4L2','DSP Lab',L)],
  AI:[sub('AI401','Mathematical Foundations for AI',T),sub('AI402','Operating Systems',T),sub('AI403','Probability & Statistics',T),sub('AI404','Analysis & Design of Algorithms',T),sub('AI405','Database Management Systems',T),sub('AI4L1','OS Lab',L),sub('AI4L2','DBMS Lab',L)],
  ME:[sub('ME401','Kinematics of Machinery - II',T),sub('ME402','Fluid Mechanics - II',T),sub('ME403','Material Science',T),sub('ME404','Applied Thermodynamics',T),sub('ME405','Metrology & Quality Control',T),sub('ME4L1','Fluid Mechanics Lab',L),sub('ME4L2','Metrology Lab',L)],
  CV:[sub('CV401','Structural Analysis',T),sub('CV402','Hydraulics',T),sub('CV403','Geotechnical Engineering',T),sub('CV404','Concrete Technology',T),sub('CV405','Transportation Engineering',T),sub('CV4L1','Hydraulics Lab',L),sub('CV4L2','Geotechnical Lab',L)]
}
const SEM5 = {
  CG:[sub('CS501','Computer Networks',T),sub('CS502','Database Management Systems',T),sub('CS503','Software Engineering',T),sub('CS504','Operating Systems',T),sub('CS505','Theory of Computation',T),sub('CS5L1','Networks Lab',L),sub('CS5L2','DBMS Lab',L)],
  CS:[sub('CS501','Computer Networks',T),sub('DS501','Machine Learning Fundamentals',T),sub('CS503','Software Engineering',T),sub('DS502','Data Mining & Warehousing',T),sub('DS503','Statistical Inference',T),sub('DS5L1','Machine Learning Lab',L),sub('DS5L2','Data Mining Lab',L)],
  CD:[sub('CS501','Computer Networks',T),sub('CD501','Interaction Design',T),sub('CD502','Information Architecture',T),sub('CD503','Design Research Methods',T),sub('CD504','Front-End Development',T),sub('CD5L1','Interaction Design Lab',L),sub('CD5L2','Front-End Dev Lab',L)],
  IS:[sub('IS501','Information Retrieval',T),sub('IS502','Data Mining & Analytics',T),sub('IS503','Software Engineering',T),sub('IS504','Computer Networks',T),sub('IS505','Advanced Web Technologies',T),sub('IS5L1','Data Mining Lab',L),sub('IS5L2','Web Technologies Lab',L)],
  EC:[sub('EC501','VLSI Design',T),sub('EC502','Microcontrollers & Applications',T),sub('EC503','Digital Signal Processing',T),sub('EC504','Communication Engineering',T),sub('EC505','Antenna & Wave Propagation',T),sub('EC5L1','VLSI Lab',L),sub('EC5L2','DSP Lab',L)],
  AI:[sub('AI501','Machine Learning',T),sub('AI502','Deep Learning',T),sub('AI503','Natural Language Processing',T),sub('AI504','Computer Vision',T),sub('AI505','Data Analytics',T),sub('AI5L1','Machine Learning Lab',L),sub('AI5L2','Deep Learning Lab',L)],
  ME:[sub('ME501','Design of Machine Elements',T),sub('ME502','Heat Transfer',T),sub('ME503','Turbo Machinery',T),sub('ME504','CAD/CAM',T),sub('ME505','Industrial Engineering & Management',T),sub('ME5L1','Heat Transfer Lab',L),sub('ME5L2','CAD/CAM Lab',L)],
  CV:[sub('CV501','Structural Analysis - II',T),sub('CV502','Geotechnical Engineering',T),sub('CV503','Hydraulic Engineering',T),sub('CV504','Transportation Engineering',T),sub('CV505','Estimation & Costing',T),sub('CV5L1','Structural Analysis Lab',L),sub('CV5L2','Geotechnical Lab',L)]
}
const SEM6 = {
  CG:[sub('CS601','Compiler Design',T),sub('CS602','Artificial Intelligence',T),sub('CS603','Cloud Computing',T),sub('CS604','Information Security',T),sub('CS605','Big Data Analytics',T),sub('CS6L1','AI Lab',L),sub('CS6L2','Cloud Lab',L)],
  CS:[sub('DS601','Deep Learning & Neural Networks',T),sub('DS602','Big Data Analytics',T),sub('DS603','NLP Fundamentals',T),sub('CS603','Cloud Computing',T),sub('DS604','Time Series Analysis',T),sub('DS6L1','Deep Learning Lab',L),sub('DS6L2','Big Data Lab',L)],
  CD:[sub('CD601','Service Design',T),sub('CD602','Design for Emerging Tech',T),sub('CD603','Design Management',T),sub('CD604','Advanced Prototyping',T),sub('CD605','Design Ethics & Sustainability',T),sub('CD6L1','Service Design Lab',L),sub('CD6L2','Prototyping Lab',L)],
  IS:[sub('IS601','Software Architecture',T),sub('IS602','Data Warehousing & Mining',T),sub('IS603','Information Security',T),sub('IS604','Mobile Computing',T),sub('IS605','Internet of Things',T),sub('IS6L1','Mobile Computing Lab',L),sub('IS6L2','IoT Lab',L)],
  EC:[sub('EC601','Embedded Systems',T),sub('EC602','Image Processing',T),sub('EC603','Wireless Communication',T),sub('EC604','Optical Communication',T),sub('EC605','Robotics & Automation',T),sub('EC6L1','Embedded Systems Lab',L),sub('EC6L2','Image Processing Lab',L)],
  AI:[sub('AI601','Reinforcement Learning',T),sub('AI602','Generative AI Models',T),sub('AI603','MLOps & Model Deployment',T),sub('AI604','Edge AI & IoT',T),sub('AI605','Ethics in AI',T),sub('AI6L1','Reinforcement Learning Lab',L),sub('AI6L2','MLOps Lab',L)],
  ME:[sub('ME601','Robotics & Mechatronics',T),sub('ME602','Advanced Manufacturing',T),sub('ME603','Energy Engineering',T),sub('ME604','Project Management',T),sub('ME605','Automobile Engineering',T),sub('ME6L1','Mechatronics Lab',L),sub('ME6L2','Advanced Manufacturing Lab',L)],
  CV:[sub('CV601','Advanced Structural Design',T),sub('CV602','Environmental Engineering',T),sub('CV603','Prestressed Concrete',T),sub('CV604','Construction Management',T),sub('CV605','Earthquake Engineering',T),sub('CV6L1','Structural Design Lab',L),sub('CV6L2','Environmental Engg Lab',L)]
}
const SEM7 = {
  CG:[sub('CS701','Compiler Design',T),sub('CS702','Artificial Intelligence',T),sub('CS703','Cloud Computing & Virtualization',T),sub('CS704','Information & Cyber Security',T),sub('CS705','Blockchain Technology',T),sub('CS7L1','AI & ML Lab',L),sub('CS7L2','Cloud Computing Lab',L)],
  CS:[sub('DS701','Advanced Machine Learning',T),sub('DS702','MLOps & Deployment',T),sub('DS703','Computer Vision Applications',T),sub('DS704','NLP Advanced',T),sub('DS705','AI in Healthcare',T),sub('DS7L1','MLOps Lab',L),sub('DS7L2','Computer Vision Lab',L)],
  CD:[sub('CD701','Design Systems',T),sub('CD702','Creative Coding',T),sub('CD703','Product Management',T),sub('CD704','Emerging Tech & Design',T),sub('CD705','Capstone Design Project',T),sub('CD7L1','Design Systems Lab',L),sub('CD7L2','Creative Coding Lab',L)],
  IS:[sub('IS701','Distributed Systems',T),sub('IS702','DevOps & CI/CD',T),sub('IS703','Cyber Security',T),sub('IS704','Full Stack Development',T),sub('IS705','Emerging Technologies',T),sub('IS7L1','DevOps Lab',L),sub('IS7L2','Full Stack Lab',L)],
  EC:[sub('EC701','Advanced Embedded Systems',T),sub('EC702','Digital Image & Video Processing',T),sub('EC703','Advanced Wireless Comm.',T),sub('EC704','Satellite Communication',T),sub('EC705','IoT & Smart Systems',T),sub('EC7L1','Embedded Systems Lab',L),sub('EC7L2','IoT Lab',L)],
  AI:[sub('AI701','Advanced Deep Learning',T),sub('AI702','AI for Healthcare',T),sub('AI703','Autonomous Systems',T),sub('AI704','AI Ethics & Governance',T),sub('AI705','Capstone AI Project',T),sub('AI7L1','Advanced DL Lab',L),sub('AI7L2','Capstone Project Lab',L)],
  ME:[sub('ME701','Advanced Robotics',T),sub('ME702','Computational Fluid Dynamics',T),sub('ME703','Finite Element Analysis',T),sub('ME704','Renewable Energy Systems',T),sub('ME705','Industry 4.0',T),sub('ME7L1','CFD Lab',L),sub('ME7L2','FEA Lab',L)],
  CV:[sub('CV701','Advanced Concrete Technology',T),sub('CV702','Foundation Engineering',T),sub('CV703','Water Resources Engineering',T),sub('CV704','GIS & Remote Sensing',T),sub('CV705','Green Building Concepts',T),sub('CV7L1','Concrete Tech Lab',L),sub('CV7L2','GIS Lab',L)]
}

// ============================================================
// Helpers
// ============================================================
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return Math.abs(h)
}

const FIRST_NAMES = ['Aarav','Aditi','Akash','Ananya','Arjun','Bhavya','Chirag','Deepika','Divya','Eshwar','Gagan','Harsha','Ishaan','Jaya','Karthik','Lakshmi','Manoj','Neha','Nikhil','Pooja','Pranav','Priya','Rahul','Rakesh','Ravi','Roshni','Sahana','Sanjay','Shruti','Siddharth','Tanvi','Umesh','Varsha','Vikram','Vinay','Yashas','Zara','Amith','Bharath','Chetan','Dinesh','Eshwari','Geetha','Hemanth','Kavitha','Mahesh','Nandini','Pradeep','Rajesh','Sunita','Tejas','Uma']
const LAST_NAMES = ['Sharma','Kumar','Patel','Reddy','Gowda','Rao','Naik','Hegde','Shetty','Bhat','Kulkarni','Deshmukh','Joshi','Menon','Nair','Iyer','Pillai','Singh','Verma','Acharya','Banerjee','Chopra','Das','Gupta','Malhotra','Mishra','Panda','Saxena','Tiwari','Agarwal']

export function getSubjects(semester, branchCode) {
  if (semester === 1) return COMMON_SEM1
  if (semester === 2) return COMMON_SEM2
  if (semester === 8) return COMMON_SEM8
  const map = { 3: SEM3, 4: SEM4, 5: SEM5, 6: SEM6, 7: SEM7 }
  const semData = map[semester]
  if (!semData) return SEM6.CG
  return semData[branchCode] || semData.CG
}

// ============================================================
// Student Generation — now includes password & placement
// ============================================================
function generateStudent(sem, branchCode, section, rollNum) {
  const roll = String(rollNum).padStart(3, '0')
  const usn = `1AT23${branchCode}${roll}`
  const h = hash(usn)
  const name = `${FIRST_NAMES[h % FIRST_NAMES.length]} ${LAST_NAMES[(h >> 4) % LAST_NAMES.length]}`

  const subjects = getSubjects(sem, branchCode).map((s, si) => {
    const facIdx = (h + si * 7) % FACULTY_POOL.length
    const ch = hash(usn + s.code)
    const isCleared = ch % 10 > 2
    const remarksPool = ['Attendance below 75%','Assignments not submitted','Internal marks below threshold','Discipline issue reported','Lab records incomplete','Miniproject not submitted','','']
    return {
      code: s.code, name: s.name, type: s.type,
      faculty: FACULTY_POOL[facIdx],
      clearance: isCleared ? 'yes' : 'no',
      remarks: isCleared ? '' : remarksPool[ch % remarksPool.length]
    }
  })

  const hostelHash = hash(usn + 'hostel')
  const libraryHash = hash(usn + 'library')
  const feesHash = hash(usn + 'fees')

  return {
    usn, name, semester: sem, branchCode, section, subjects,
    // Default password = USN itself
    password: usn,
    // Placement: null = not set yet
    placement: null,
    // Dues: null = not set, 0 = cleared, number = pending amount
    hostelDue: hostelHash % 10 > 6 ? [1500, 2500, 3500, 5000, 8000][hostelHash % 5] : null,
    libraryDue: libraryHash % 10 > 7 ? [200, 500, 800, 1000][libraryHash % 4] : null,
    feesDue: feesHash % 10 > 5 ? [15000, 25000, 35000, 50000, 75000, 100000][feesHash % 6] : null,
    ccApproval: null,
    adminApproval: null,
    hallTicketIssued: false,
    documents: []
  }
}

function generateAllStudents() {
  const students = []
  for (const sem of SEMESTERS) {
    for (const b of BRANCHES) {
      for (let si = 0; si < SECTIONS.length; si++) {
        const section = SECTIONS[si]
        const offset = si * 5
        for (let r = 1; r <= 5; r++) {
          students.push(generateStudent(sem, b.code, section, offset + r))
        }
      }
    }
  }
  return students
}

export const INITIAL_STUDENTS = generateAllStudents()

// ============================================================
// CSV Parser — used by bulk upload
// ============================================================
export function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const values = []
    let current = '', inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
      current += ch
    }
    values.push(current.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    return obj
  })
  return { headers, rows }
}