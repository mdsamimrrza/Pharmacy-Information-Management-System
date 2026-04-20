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

const router = Router()

router.post('/setup-admin', validateSetupAdmin, setupAdmin)
router.post('/login', validateLogin, login)
router.post('/forgot-password', validateForgotPassword, forgotPassword)
router.post('/reset-password', validateResetPassword, resetPasswordFlow)
router.put('/change-password', verifyToken, validateChangePassword, changePasswordFlow)
router.post('/logout', verifyToken, logout)
router.get('/me', verifyToken, getMe)

export default router
