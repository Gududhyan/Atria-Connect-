import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import User from './models/User.js'

dotenv.config()

async function getStudents() {
  await connectDB()
  const students = await User.find({ role: 'student' }).lean().limit(10)
  console.log('Sample student accounts seeded:')
  students.forEach(student => {
    console.log(`USN: ${student.usn}, Password: ${student.usn} (same as USN)`)
  })
  
  const totalStudents = await User.countDocuments({ role: 'student' })
  console.log(`\nTotal student accounts created: ${totalStudents}`)
  process.exit(0)
}

getStudents().catch(err => {
  console.error(err)
  process.exit(1)
})
