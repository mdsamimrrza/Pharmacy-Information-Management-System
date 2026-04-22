import { Router } from 'express'
import {
  createNewMedicine,
  getAllMedicines,
  getMedicine,
  removeExistingMedicine,
  updateExistingMedicine,
  checkInteractions,
} from '../controllers/medicine.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import {
  validateCreateMedicine,
  validateMedicineIdParam,
  validateMedicineQuery,
  validateUpdateMedicine,
} from '../validators/medicine.validator.js'

const router = Router()

router.use(verifyToken)

router.get('/', validateMedicineQuery, getAllMedicines)
router.post('/interactions', requireRole('DOCTOR', 'PHARMACIST', 'ADMIN'), checkInteractions)
router.get('/:id', validateMedicineIdParam, getMedicine)
router.post('/', requireRole('ADMIN', 'PHARMACIST'), validateCreateMedicine, createNewMedicine)
router.put('/:id', requireRole('ADMIN'), validateUpdateMedicine, updateExistingMedicine)
router.delete('/:id', requireRole('ADMIN'), validateMedicineIdParam, removeExistingMedicine)

export default router
