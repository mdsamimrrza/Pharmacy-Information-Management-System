import { Router } from 'express'
import {
	changePasswordFlow,
	forgotPassword,
	getMe,
	login,
	logout,
	resetPasswordFlow,
	setupAdmin,
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import {
	validateChangePassword,
	validateForgotPassword,
	validateLogin,
	validateResetPassword,
	validateSetupAdmin,
} from '../validators/auth.validator.js'

import { authLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

router.post('/setup-admin', authLimiter, validateSetupAdmin, setupAdmin)
router.post('/login', authLimiter, validateLogin, login)
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword)
router.post('/reset-password', authLimiter, validateResetPassword, resetPasswordFlow)
router.put('/change-password', verifyToken, validateChangePassword, changePasswordFlow)
router.post('/logout', verifyToken, logout)
router.get('/me', verifyToken, getMe)

export default router
