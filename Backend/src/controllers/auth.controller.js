import {
  authenticateUser,
  changePassword,
  createPasswordResetRequest,
  getAuthenticatedUser,
  resetPassword,
  setupFirstAdmin,
} from '../services/auth.service.js'
import { sendError, sendSuccess } from '../utils/responseHandler.js'

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body || {}

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400)
    }

    const { user, token } = await authenticateUser({ email, password, role })

    return sendSuccess(res, { user, token }, 'Login successful')
  } catch (error) {
    return sendError(res, error.message || 'Login failed', error.statusCode || 500)
  }
}

export const setupAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, setupToken } = req.body || {}

    if (!firstName || !lastName || !email || !password || !setupToken) {
      return sendError(res, 'firstName, lastName, email, password, and setupToken are required', 400)
    }

    const { user, token } = await setupFirstAdmin({ firstName, lastName, email, password, setupToken })

    return sendSuccess(res, { user, token }, 'Admin setup successful', 201)
  } catch (error) {
    return sendError(res, error.message || 'Admin setup failed', error.statusCode || 500)
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {}

    if (!email) {
      return sendError(res, 'Email is required', 400)
    }

    await createPasswordResetRequest({ email })

    return sendSuccess(res, { accepted: true }, 'If the account exists, a reset email has been sent')
  } catch (error) {
    return sendError(res, error.message || 'Password reset request failed', error.statusCode || 500)
  }
}

export const resetPasswordFlow = async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body || {}

    if (!email || !token || !newPassword || !confirmPassword) {
      return sendError(res, 'email, token, newPassword, and confirmPassword are required', 400)
    }

    const result = await resetPassword({ email, token, newPassword })
    return sendSuccess(res, result, 'Password reset successful')
  } catch (error) {
    return sendError(res, error.message || 'Password reset failed', error.statusCode || 500)
  }
}

export const changePasswordFlow = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {}

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 'currentPassword, newPassword, and confirmPassword are required', 400)
    }

    const result = await changePassword({
      userId: req.user.id || req.user._id,
      currentPassword,
      newPassword,
    })

    return sendSuccess(res, result, 'Password changed successfully')
  } catch (error) {
    return sendError(res, error.message || 'Password change failed', error.statusCode || 500)
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req.user.id || req.user._id)
    return sendSuccess(res, { user }, 'Current user')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load current user', error.statusCode || 500)
  }
}

export const logout = (_req, res) => {
  return sendSuccess(res, { loggedOut: true }, 'Logged out')
}
