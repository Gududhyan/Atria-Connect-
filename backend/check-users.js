import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import User from './models/User.js'

dotenv.config()

async function checkUsers() {
  await connectDB()
  const users = await User.find().lean()
  console.log('Users in database:')
  users.forEach(user => {
    console.log(`Role: ${user.role}, Name: ${user.name}, USN: ${user.usn}, Has PasswordHash: ${!!user.passwordHash}`)
  })
  process.exit(0)
}

checkUsers().catch(err => {
  console.error(err)
  process.exit(1)
})
