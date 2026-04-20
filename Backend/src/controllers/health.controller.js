import { sendSuccess } from '../utils/responseHandler.js'

export const getHealth = (_req, res) => {
  return sendSuccess(res, { status: 'ok' }, 'Backend is running')
}
