import { Router } from 'express'
import { getAtcUsage, getFulfillment, getPatientSummary, getSummary } from '../controllers/report.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import { validateReportQuery } from '../validators/report.validator.js'

const router = Router()

router.use(verifyToken)

router.get('/summary', requireRole('ADMIN'), validateReportQuery, getSummary)
router.get('/atcUsage', requireRole('ADMIN'), validateReportQuery, getAtcUsage)
router.get('/fulfillment', requireRole('ADMIN'), validateReportQuery, getFulfillment)
router.get('/patient-summary', requireRole('PATIENT'), validateReportQuery, getPatientSummary)

export default router
