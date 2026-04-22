import User from '../models/User.model.js'
import Patient from '../models/Patient.model.js'
import { sendPasswordChangedEmail, sendPasswordResetEmail } from './email.service.js'
import { hashPassword, hashToken, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'
import { generateToken } from '../utils/password.js'

const authError = (message, statusCode = 401) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const markPasswordChangedAt = () => new Date(Date.now() - 1000)

const ensureAdminSetupToken = (setupToken) => {
  const expectedToken = String(process.env.ADMIN_SETUP_TOKEN || '').trim()

  if (!expectedToken) {
    throw authError('Admin setup is not configured', 500)
  }

  if (String(setupToken || '').trim() !== expectedToken) {
    throw authError('Invalid setup token', 403)
  }
}

const toAuthPayload = (user) => ({
  user: user.toSafeObject(),
  token: signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  }),
})

export const authenticateUser = async ({ email, password, role }) => {
  const user = await User.findOne({ email: normalizeEmail(email) })

  if (!user || !user.isActive) {
    throw authError('Invalid email or password')
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw authError('Account temporarily locked due to too many failed login attempts. Please try again later.', 403)
  }

  const passwordMatches = verifyPassword(password, user.passwordHash)

  if (!passwordMatches) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
    }
    await user.save()
    throw authError('Invalid email or password')
  }

  if (role && role !== user.role) {
    throw authError('Role mismatch', 403)
  }

  user.failedLoginAttempts = 0
  user.lockUntil = null
  user.lastLogin = new Date()
  await user.save()

  return toAuthPayload(user)
}

export const getAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId)

  if (!user || !user.isActive) {
    throw authError('User not found', 401)
  }

  const safeUser = user.toSafeObject()

  if (safeUser.role === 'PATIENT') {
    const patient = await Patient.findOne({ userId: safeUser.id })
    if (patient) {
      safeUser.patient = patient
    }
  }

  return safeUser
}

export const setupFirstAdmin = async ({ firstName, lastName, email, password, setupToken }) => {
  ensureAdminSetupToken(setupToken)

  const adminCount = await User.countDocuments({ role: 'ADMIN' })

  if (adminCount > 0) {
    throw authError('Admin already exists', 409)
  }

  const normalizedEmail = normalizeEmail(email)
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    throw authError('Email already exists', 409)
  }

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: 'ADMIN',
    isActive: true,
    lastLogin: new Date(),
    passwordChangedAt: markPasswordChangedAt(),
  })

  return toAuthPayload(user)
}

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId)

  if (!user || !user.isActive) {
    throw authError('User not found', 401)
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw authError('Current password is incorrect', 400)
  }

  user.passwordHash = hashPassword(newPassword)
  user.passwordChangedAt = markPasswordChangedAt()
  user.passwordResetTokenHash = null
  user.passwordResetTokenExpiresAt = null
  await user.save()

  try {
    await sendPasswordChangedEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  } catch (error) {
    console.warn(`Failed to write password changed email for ${user.email}: ${error.message}`)
  }

  return toAuthPayload(user)
}

export const createPasswordResetRequest = async ({ email }) => {
  const user = await User.findOne({ email: normalizeEmail(email) })

  if (!user || !user.isActive) {
    return { accepted: true }
  }

  const resetToken = generateToken(24)
  user.passwordResetTokenHash = hashToken(resetToken)
  user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await user.save()

  const resetUrl = `${String(process.env.CLIENT_URL || '').replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(
    user.email
  )}&token=${encodeURIComponent(resetToken)}`

  await sendPasswordResetEmail({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    resetToken,
    resetUrl,
  })

  return { accepted: true }
}

export const resetPassword = async ({ email, token, newPassword }) => {
  const user = await User.findOne({ email: normalizeEmail(email) })

  if (!user || !user.isActive) {
    throw authError('Invalid reset link', 400)
  }

  if (!user.passwordResetTokenHash || !user.passwordResetTokenExpiresAt) {
    throw authError('Reset token expired', 400)
  }

  if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    throw authError('Reset token expired', 400)
  }

  if (hashToken(token) !== user.passwordResetTokenHash) {
    throw authError('Invalid reset token', 400)
  }

  user.passwordHash = hashPassword(newPassword)
  user.passwordChangedAt = markPasswordChangedAt()
  user.passwordResetTokenHash = null
  user.passwordResetTokenExpiresAt = null
  await user.save()

  try {
    await sendPasswordChangedEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  } catch (error) {
    console.warn(`Failed to write password changed email for ${user.email}: ${error.message}`)
  }

  return toAuthPayload(user)
}
