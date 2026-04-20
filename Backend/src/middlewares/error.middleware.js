import { sendError } from '../utils/responseHandler.js'

export const notFound = (_req, res) => {
  return sendError(res, 'Route not found', 404)
}

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  return sendError(res, message, statusCode)
}
