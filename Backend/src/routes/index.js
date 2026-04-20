import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import atcRoutes from './atc.routes.js'
import medicineRoutes from './medicine.routes.js'
import patientRoutes from './patient.routes.js'
import prescriptionRoutes from './prescription.routes.js'
import inventoryRoutes from './inventory.routes.js'
import alertRoutes from './alert.routes.js'
import reportRoutes from './report.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/atc', atcRoutes)
router.use('/medicines', medicineRoutes)
router.use('/patients', patientRoutes)
router.use('/prescriptions', prescriptionRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/alerts', alertRoutes)
router.use('/reports', reportRoutes)

export default router
