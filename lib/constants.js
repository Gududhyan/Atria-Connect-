// Canonical domain data — shared by server (seeding, API) and client (dropdowns, labels).
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

export const PLACEMENT_OPTIONS = ['Placed', 'Unplaced', 'Higher Studies', 'Entrepreneurship', 'Not Eligible']

export const LOGO_URL = '/logo.png'

const COMMON_SEM1 = [
  { code: 'MA11', name: 'Engineering Mathematics I', type: 'theory' },
  { code: 'PH11', name: 'Engineering Physics', type: 'theory' },
  { code: 'CH11', name: 'Engineering Chemistry', type: 'theory' },
  { code: 'EE11', name: 'Basic Electrical Engineering', type: 'theory' },
  { code: 'CS11', name: 'Programming in C', type: 'theory' },
  { code: 'EG11', name: 'Engineering Graphics', type: 'theory' },
  { code: 'PH1L', name: 'Physics Lab', type: 'lab' },
  { code: 'CH1L', name: 'Chemistry Lab', type: 'lab' },
  { code: 'CS1L', name: 'C Programming Lab', type: 'lab' }
]

const COMMON_SEM2 = [
  { code: 'MA21', name: 'Engineering Mathematics II', type: 'theory' },
  { code: 'PH21', name: 'Engineering Physics II', type: 'theory' },
  { code: 'ME21', name: 'Basic Mechanical Engineering', type: 'theory' },
  { code: 'EC21', name: 'Basic Electronics', type: 'theory' },
  { code: 'CS21', name: 'Data Structures with C', type: 'theory' },
  { code: 'EV21', name: 'Environmental Studies', type: 'theory' },
  { code: 'ME2L', name: 'Mechanical Workshop', type: 'lab' },
  { code: 'EC2L', name: 'Electronics Lab', type: 'lab' },
  { code: 'CS2L', name: 'Data Structures Lab', type: 'lab' }
]

const COMMON_SEM8 = [
  { code: 'PR80', name: 'Project Work Phase II', type: 'project' },
  { code: 'IN80', name: 'Technical Seminar', type: 'seminar' },
  { code: 'IN81', name: 'Internship Report', type: 'internship' }
]

const BRANCH_SUBJECT_SETS = {
  CG: ['Design Thinking', 'Algorithms', 'Digital Logic', 'Computer Organization', 'Software Engineering', 'Networks', 'Database Systems', 'Operating Systems', 'Human Computer Interaction', 'Cloud Computing', 'Information Security', 'Machine Learning', 'Artificial Intelligence', 'Compiler Design'],
  CS: ['Data Science Fundamentals', 'Algorithms', 'Object Oriented Programming', 'Computer Organization', 'Data Visualization', 'Database Systems', 'Operating Systems', 'Machine Learning', 'Artificial Intelligence', 'Cloud Computing', 'Information Security', 'Software Engineering', 'Big Data Analytics', 'Deep Learning'],
  CD: ['Design Thinking', 'Visual Communication', 'Digital Logic', 'Computer Organization', 'UX Design', 'Web Technologies', 'Operating Systems', 'Cyber Security', 'Database Systems', 'Ethical Hacking', 'Cloud Security', 'Project Work', 'System Design', 'Design Research'],
  IS: ['Information Retrieval', 'Database Management', 'Web Technologies', 'Computer Networks', 'Software Engineering', 'System Analysis', 'Operating Systems', 'Data Mining', 'Information Security', 'Cloud Computing', 'Big Data Analytics', 'Machine Learning', 'Data Warehousing', 'Mobile Computing'],
  EC: ['Analog Electronics', 'Network Analysis', 'Signals and Systems', 'Digital Electronics', 'Communication Engineering', 'Microprocessors', 'Control Systems', 'VLSI Design', 'DSP', 'Wireless Communication', 'Embedded Systems', 'Optical Communication', 'Robotics', 'IoT'],
  AI: ['Python Programming', 'Probability and Statistics', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'AI Ethics', 'Reinforcement Learning', 'MLOps', 'Generative AI', 'Edge AI', 'Data Analytics', 'AI Systems', 'Project Work'],
  ME: ['Thermodynamics', 'Kinematics of Machinery', 'Strength of Materials', 'Fluid Mechanics', 'Manufacturing Technology', 'Industrial Engineering', 'Heat Transfer', 'Design of Machine Elements', 'Automobile Engineering', 'Robotics', 'Advanced Manufacturing', 'Mechatronics', 'Project Work', 'Energy Systems'],
  CV: ['Strength of Materials', 'Surveying', 'Fluid Mechanics', 'Building Materials', 'Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering', 'Concrete Technology', 'Construction Management', 'Green Building Concepts', 'GIS', 'Project Work', 'Water Resources']
}

function buildBranchSubjects(branchCode, semester) {
  const pool = BRANCH_SUBJECT_SETS[branchCode] || BRANCH_SUBJECT_SETS.CG
  const start = Math.min((semester - 3) * 2, pool.length - 6)
  const subjectNames = pool.slice(start, start + 5)
  return subjectNames.map((name, index) => ({
    code: `${branchCode}${semester}0${index + 1}`,
    name,
    type: 'theory'
  })).concat([
    { code: `${branchCode}${semester}L1`, name: `${branchCode} Lab I`, type: 'lab' },
    { code: `${branchCode}${semester}L2`, name: `${branchCode} Lab II`, type: 'lab' }
  ])
}

export function getSubjects(semester, branchCode) {
  if (semester === 1) return COMMON_SEM1
  if (semester === 2) return COMMON_SEM2
  if (semester === 8) return COMMON_SEM8
  return buildBranchSubjects(branchCode, semester)
}

export function getBranchName(code) {
  return BRANCHES.find((b) => b.code === code)?.name || code
}
