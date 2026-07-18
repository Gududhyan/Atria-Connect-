import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  faculty: { type: String, default: null },
  clearance: { type: String, enum: ['yes', 'no', 'not_cleared'], default: 'not_cleared' },
  remarks: { type: String, default: '' }
}, { _id: false })

const studentSchema = new mongoose.Schema({
  usn: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  semester: { type: Number, required: true },
  branchCode: { type: String, required: true },
  section: { type: String, required: true },
  passwordHash: { type: String },
  placement: { type: String, default: null },
  hostelDue: { type: Number, default: 0 },
  libraryDue: { type: Number, default: 0 },
  feesDue: { type: Number, default: 0 },
  ccApproval: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
  adminApproval: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
  hallTicketIssued: { type: Boolean, default: false },
  subjects: { type: [subjectSchema], default: [] }
}, { timestamps: true })

const Student = mongoose.model('Student', studentSchema)
export default Student
