import { Router } from 'express'
import {
  acknowledgeExistingAlert,
  dismissExistingAlert,
  getAllAlerts,
} from '../controllers/alert.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import { validateAlertIdParam, validateAlertQuery } from '../validators/alert.validator.js'

const router = Router()

router.use(verifyToken)
router.use(requireRole('PHARMACIST'))

router.get('/', validateAlertQuery, getAllAlerts)
router.put('/:id/acknowledge', validateAlertIdParam, acknowledgeExistingAlert)
router.put('/:id/dismiss', validateAlertIdParam, dismissExistingAlert)

export default router
