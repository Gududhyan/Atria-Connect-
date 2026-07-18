import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Student from '../models/Student.js'
import { generateAllStudents } from '../data/constants.js'

export async function seedStudents() {
  let students = await Student.find().lean()

  if (students.length === 0) {
    const generated = generateAllStudents()
    const createdStudents = await Student.insertMany(generated)
    students = createdStudents
  }

  const studentUsers = students.map(student => ({
    role: 'student',
    name: student.name,
    usn: student.usn,
    passwordHash: bcrypt.hashSync(student.usn, 10),
    student: student._id
  }))

  const bulkOps = studentUsers.map(user => ({
    updateOne: {
      filter: { usn: user.usn },
      update: { $set: user },
      upsert: true
    }
  }))

  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps)
  }
}
