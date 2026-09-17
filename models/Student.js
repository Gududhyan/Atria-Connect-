import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  faculty: { type: String, default: null },
  clearance: { type: String, enum: ['yes', 'no', 'not_cleared'], default: 'not_cleared' },
  remarks: { type: String, default: '' }
}, { _id: false })

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: '' }
})

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
  subjects: { type: [subjectSchema], default: [] },
  documents: { type: [documentSchema], default: [] }
}, { timestamps: true })

// Dashboards always filter on these three together.
studentSchema.index({ semester: 1, branchCode: 1, section: 1 })

export default mongoose.models.Student || mongoose.model('Student', studentSchema)
