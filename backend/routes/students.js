import express from 'express'
import { protect, restrictTo } from '../middleware/auth.js'
import {
  getStudents,
  getStudent,
  createBulkStudents,
  bulkFacultyMapping,
  bulkDuesUpdate,
  updateDues,
  updateClearance,
  updateCCApproval,
  updateAdminApproval,
  updateFaculty
} from '../controllers/studentController.js'

const router = express.Router()

router.use(protect)
router.get('/', getStudents)
router.get('/:usn', getStudent)
router.post('/bulk', restrictTo('admin', 'account'), createBulkStudents)
router.post('/bulk-faculty', restrictTo('admin'), bulkFacultyMapping)
router.post('/bulk-dues', restrictTo('admin', 'account'), bulkDuesUpdate)
router.put('/:usn/dues', restrictTo('admin', 'account'), updateDues)
router.put('/:usn/clearance', restrictTo('faculty', 'admin'), updateClearance)
router.put('/:usn/approve/cc', restrictTo('cc', 'admin'), updateCCApproval)
router.put('/:usn/approve/admin', restrictTo('admin'), updateAdminApproval)
router.put('/:usn/faculty', restrictTo('admin'), updateFaculty)

export default router
