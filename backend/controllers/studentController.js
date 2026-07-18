import Student from '../models/Student.js'

export async function getStudents(req, res, next) {
  try {
    const filter = {}
    if (req.query.branchCode) filter.branchCode = req.query.branchCode.toUpperCase()
    if (req.query.semester) filter.semester = Number(req.query.semester)
    if (req.user.role === 'student') {
      filter.usn = req.user.usn
    }
    const students = await Student.find(filter).sort({ usn: 1 })
    res.json(students)
  } catch (error) {
    next(error)
  }
}

export async function getStudent(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    if (req.user.role === 'student' && req.user.usn !== student.usn) {
      return res.status(403).json({ message: 'Access denied' })
    }
    res.json(student)
  } catch (error) {
    next(error)
  }
}

export async function createBulkStudents(req, res, next) {
  try {
    const { students } = req.body
    if (!Array.isArray(students)) {
      return res.status(400).json({ message: 'Students array is required' })
    }

    const results = []
    for (const item of students) {
      const usn = String(item.usn || item.USN || '').toUpperCase()
      if (!usn) continue
      const payload = {
        usn,
        name: item.name || item.Name || 'Unknown Student',
        semester: Number(item.semester || item.Semester || 1),
        branchCode: (item.branchCode || item.BranchCode || 'CS').toUpperCase(),
        section: item.section || item.Section || 'A',
        placement: item.placement || item.Placement || null,
        hostelDue: item.hostelDue === '' || item.HostelDue === '' ? null : Number(item.hostelDue || item.HostelDue || 0),
        libraryDue: item.libraryDue === '' || item.LibraryDue === '' ? null : Number(item.libraryDue || item.LibraryDue || 0),
        feesDue: item.feesDue === '' || item.FeesDue === '' ? null : Number(item.feesDue || item.FeesDue || 0),
        ccApproval: item.ccApproval || item.CCApproval || 'pending',
        adminApproval: item.adminApproval || item.AdminApproval || 'pending',
        hallTicketIssued: item.hallTicketIssued || item.HallTicketIssued || false,
        subjects: Array.isArray(item.subjects) ? item.subjects : []
      }
      const student = await Student.findOneAndUpdate({ usn }, payload, { upsert: true, new: true, setDefaultsOnInsert: true })
      results.push(student)
    }

    res.status(201).json({ count: results.length, students: results })
  } catch (error) {
    next(error)
  }
}

export async function bulkFacultyMapping(req, res, next) {
  try {
    const { mappings } = req.body
    if (!Array.isArray(mappings)) {
      return res.status(400).json({ message: 'Mappings array is required' })
    }

    const updates = []
    for (const mapping of mappings) {
      const usn = String(mapping.USN || mapping.usn || '').toUpperCase()
      const subjectCode = mapping.SubjectCode || mapping.subjectCode
      const faculty = mapping.Faculty || mapping.faculty
      if (!usn || !subjectCode || !faculty) continue
      const student = await Student.findOne({ usn })
      if (!student) continue
      const subject = student.subjects.find(item => item.code === subjectCode)
      if (!subject) continue
      subject.faculty = faculty
      await student.save()
      updates.push(student)
    }

    res.json({ count: updates.length, students: updates })
  } catch (error) {
    next(error)
  }
}

export async function bulkDuesUpdate(req, res, next) {
  try {
    const { dues } = req.body
    if (!Array.isArray(dues)) {
      return res.status(400).json({ message: 'Dues array is required' })
    }

    const updates = []
    for (const item of dues) {
      const usn = String(item.USN || item.usn || '').toUpperCase()
      if (!usn) continue
      const student = await Student.findOne({ usn })
      if (!student) continue
      student.hostelDue = item.HostelDue === '' || item.hostelDue === '' ? null : Number(item.HostelDue || item.hostelDue || 0)
      student.libraryDue = item.LibraryDue === '' || item.libraryDue === '' ? null : Number(item.LibraryDue || item.libraryDue || 0)
      student.feesDue = item.FeesDue === '' || item.feesDue === '' ? null : Number(item.FeesDue || item.feesDue || 0)
      await student.save()
      updates.push(student)
    }

    res.json({ count: updates.length, students: updates })
  } catch (error) {
    next(error)
  }
}

export async function updatePlacement(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const { placement } = req.body
    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    student.placement = placement || null
    await student.save()
    res.json(student)
  } catch (error) {
    next(error)
  }
}

export async function updateDues(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const { hostelDue, libraryDue, feesDue } = req.body
    if (hostelDue !== undefined) student.hostelDue = hostelDue === '' ? null : Number(hostelDue)
    if (libraryDue !== undefined) student.libraryDue = libraryDue === '' ? null : Number(libraryDue)
    if (feesDue !== undefined) student.feesDue = feesDue === '' ? null : Number(feesDue)

    await student.save()
    res.json(student)
  } catch (error) {
    next(error)
  }
}

export async function updateClearance(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const { subjects } = req.body
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects array is required' })
    }

    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    subjects.forEach((subjectUpdate) => {
      const subject = student.subjects.find((item) => item.code === subjectUpdate.code)
      if (subject) {
        if (subjectUpdate.clearance) subject.clearance = subjectUpdate.clearance
        if (subjectUpdate.remarks !== undefined) subject.remarks = subjectUpdate.remarks
      }
    })

    await student.save()
    res.json(student)
  } catch (error) {
    next(error)
  }
}

export async function updateCCApproval(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const { approval } = req.body
    if (!['approved', 'rejected'].includes(approval)) {
      return res.status(400).json({ message: 'Approval must be approved or rejected' })
    }

    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    student.ccApproval = approval
    if (approval === 'approved' && student.adminApproval === 'approved') {
      student.hallTicketIssued = true
    }

    await student.save()
    res.json(student)
  } catch (error) {
    next(error)
  }
}

export async function updateAdminApproval(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const { approval } = req.body
    if (!['approved', 'rejected'].includes(approval)) {
      return res.status(400).json({ message: 'Approval must be approved or rejected' })
    }

    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    student.adminApproval = approval
    if (approval === 'approved' && student.ccApproval === 'approved') {
      student.hallTicketIssued = true
    }

    await student.save()
    res.json(student)
  } catch (error) {
    next(error)
  }
}

export async function updateFaculty(req, res, next) {
  try {
    const usn = req.params.usn.toUpperCase()
    const { subjectCode, faculty } = req.body
    if (!subjectCode || !faculty) {
      return res.status(400).json({ message: 'Subject code and faculty are required' })
    }

    const student = await Student.findOne({ usn })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const subject = student.subjects.find((item) => item.code === subjectCode)
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found for this student' })
    }

    subject.faculty = faculty
    await student.save()
    res.json(student)
  } catch (error) {
    next(error)
  }
}
