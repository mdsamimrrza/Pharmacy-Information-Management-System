import { sendError } from '../utils/responseHandler.js'

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden', 403)
    }

    return next()
  }
}
