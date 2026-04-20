import { Router } from 'express'
import { getByCode, getTree, search } from '../controllers/atc.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import { validateAtcCodeParam, validateAtcSearchQuery } from '../validators/atc.validator.js'

const router = Router()

router.use(verifyToken)
router.use(requireRole('DOCTOR', 'ADMIN'))

router.get('/tree', getTree)
router.get('/search', validateAtcSearchQuery, search)
router.get('/:code', validateAtcCodeParam, getByCode)

export default router
