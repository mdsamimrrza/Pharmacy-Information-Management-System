import { Router } from 'express'
import {
  createNewPatient,
  createPatientPortalUser,
  getAllPatients,
  getMyPatientRecord,
  getSinglePatient,
} from '../controllers/patient.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import {
  validateCreatePatient,
  validateCreatePatientPortalAccount,
  validatePatientIdParam,
  validatePatientQuery,
} from '../validators/patient.validator.js'

const router = Router()

router.use(verifyToken)

router.get('/me', requireRole('PATIENT'), getMyPatientRecord)

router.get('/', requireRole('DOCTOR', 'ADMIN'), validatePatientQuery, getAllPatients)
router.post('/', requireRole('DOCTOR'), validateCreatePatient, createNewPatient)
router.post(
  '/:id/portal-account',
  requireRole('ADMIN'),
  validatePatientIdParam,
  validateCreatePatientPortalAccount,
  createPatientPortalUser
)
router.get('/:id', requireRole('DOCTOR', 'ADMIN'), validatePatientIdParam, getSinglePatient)

export default router
