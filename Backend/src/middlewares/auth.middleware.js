import User from '../models/User.model.js'
import { sendError } from '../utils/responseHandler.js'
import { verifyToken as verifySignedToken } from '../utils/jwt.js'
import BlacklistedToken from '../models/BlacklistedToken.model.js'

export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
      return sendError(res, 'Unauthorised', 401)
    }

    const isBlacklisted = await BlacklistedToken.exists({ token })
    if (isBlacklisted) {
      return sendError(res, 'Token expired', 401)
    }

    const payload = verifySignedToken(token)
    const userId = payload.sub || payload.id

    if (!userId) {
      return sendError(res, 'Unauthorised', 401)
    }

    const user = await User.findById(userId)

    if (!user || !user.isActive) {
      return sendError(res, 'Unauthorised', 401)
    }

    if (user.passwordChangedAt && payload.iat && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
      return sendError(res, 'Token expired', 401)
    }

    req.user = user.toSafeObject()
    req.auth = payload

    return next()
  } catch (error) {
    return sendError(res, error.message || 'Unauthorised', 401)
  }
}
