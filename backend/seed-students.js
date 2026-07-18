import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { seedStudents } from './utils/studentSeeder.js'

dotenv.config()

async function seed() {
  try {
    await connectDB()
    console.log('Seeding students...')
    await seedStudents()
    console.log('Students seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding:', error.message)
    process.exit(1)
  }
}

seed()
