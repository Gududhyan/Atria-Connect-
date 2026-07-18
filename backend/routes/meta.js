import express from 'express'
import { getMeta } from '../controllers/metaController.js'

const router = express.Router()
router.get('/', getMeta)
export default router
