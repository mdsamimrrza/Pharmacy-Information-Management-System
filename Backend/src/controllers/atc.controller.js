import { getAtcByCode, getAtcTree, searchAtc } from '../services/atc.service.js'
import { sendError, sendSuccess } from '../utils/responseHandler.js'

export const getTree = async (_req, res) => {
  try {
    const tree = await getAtcTree()
    return sendSuccess(res, { tree }, 'ATC tree loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load ATC tree', error.statusCode || 500)
  }
}

export const getByCode = async (req, res) => {
  try {
    const node = await getAtcByCode(req.params.code)
    return sendSuccess(res, { node }, 'ATC node loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load ATC node', error.statusCode || 500)
  }
}

export const search = async (req, res) => {
  try {
    const results = await searchAtc(req.query.q)
    return sendSuccess(res, { results }, 'ATC search results')
  } catch (error) {
    return sendError(res, error.message || 'ATC search failed', error.statusCode || 500)
  }
}
