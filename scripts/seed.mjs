// Standalone seeder: `npm run seed`
// Imports the models directly (not lib/data/*, which is marked server-only and
// can only be loaded inside the Next.js server runtime).
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

dotenv.config({ path: '.env.local' })
dotenv.config()

const { connectDB } = await import('../lib/db.js')
const { generateAllStudents } = await import('../lib/seed-data.js')
const { default: Student } = await import('../models/Student.js')
const { default: User } = await import('../models/User.js')

const STAFF = [
  { role: 'admin', username: 'admin', name: 'Administrator', password: 'admin123' },
  { role: 'account', username: 'account', name: 'Accounts Officer', password: 'account123' },
  { role: 'cc', username: 'cc', name: 'Class Coordinator', password: 'cc123' },
  { role: 'faculty', username: 'faculty', name: 'Dr. Priya Kumar', password: 'faculty123' }
]

async function seedStaff() {
  for (const account of STAFF) {
    const passwordHash = await bcrypt.hash(account.password, 10)
    await User.findOneAndUpdate(
      { role: account.role },
      { role: account.role, username: account.username, name: account.name, passwordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
  console.log(`Seeded ${STAFF.length} staff accounts`)
}

async function seedStudents({ reset }) {
  const existing = await Student.countDocuments()

  if (existing > 0 && !reset) {
    console.log(`Students already present (${existing}) — skipping student generation.`)
    console.log('Run `npm run seed -- --reset` to wipe and regenerate them.')
    return
  }

  if (existing > 0 && reset) {
    console.log(`Removing ${existing} existing students and their logins…`)
    await Student.deleteMany({})
    await User.deleteMany({ role: 'student' })
  }

  const generated = generateAllStudents()
  const inserted = await Student.insertMany(
    generated.map(({ password, ...student }) => student),
    { ordered: false }
  )
  console.log(`Inserted ${inserted.length} students`)

  const idByUsn = new Map(inserted.map((s) => [s.usn, s._id]))
  const userOps = await Promise.all(generated.map(async (student) => ({
    updateOne: {
      filter: { usn: student.usn, role: 'student' },
      update: {
        $set: {
          role: 'student',
          name: student.name,
          usn: student.usn,
          student: idByUsn.get(student.usn),
          passwordHash: await bcrypt.hash(student.password, 10)
        }
      },
      upsert: true
    }
  })))

  await User.bulkWrite(userOps, { ordered: false })
  console.log(`Created ${userOps.length} student logins (password = USN)`)
}

async function main() {
  const reset = process.argv.includes('--reset')
  if (!(await connectDB())) throw new Error('Could not connect to MongoDB — check MONGODB_URI')
  await seedStaff()
  await seedStudents({ reset })
  console.log('\nDatabase seeded successfully')
  await mongoose.disconnect()
  process.exit(0)
}

main().catch(async (error) => {
  console.error('Seed failed:', error)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
