import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import { seedStudents } from './utils/studentSeeder.js'

dotenv.config()

async function runSeed() {
  await connectDB()

  const accounts = [
    { role: 'admin', username: 'admin', name: 'Administrator', password: 'admin123' },
    { role: 'account', username: 'account', name: 'Accounts Officer', password: 'account123' },
    { role: 'cc', username: 'cc', name: 'Class Coordinator', password: 'cc123' },
    { role: 'faculty', username: 'faculty', name: 'Dr. Priya Kumar', password: 'faculty123' }
  ]

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10)
    await User.findOneAndUpdate(
      { role: account.role },
      { role: account.role, username: account.username, name: account.name, passwordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  await seedStudents()

  console.log('Database seeded successfully')
  process.exit(0)
}

runSeed().catch((error) => {
  console.error(error)
  process.exit(1)
})
