import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import metaRoutes from './routes/meta.js'
import uploadRoutes from './routes/upload.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectDB()

app.use(cors({ origin: true }))
app.use(express.json())

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/meta', metaRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
