import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'account', 'cc', 'faculty', 'student'],
    required: true
  },
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, lowercase: true },
  email: { type: String, unique: true, sparse: true },
  usn: { type: String, unique: true, sparse: true, uppercase: true },
  passwordHash: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', userSchema)
