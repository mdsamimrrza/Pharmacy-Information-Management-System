import {
  getAtcUsageReport,
  getFulfillmentReport,
  getPatientSummaryReport,
  getSummaryReport,
} from '../services/report.service.js'
import { sendError, sendSuccess } from '../utils/responseHandler.js'

export const getSummary = async (req, res) => {
  try {
    const summary = await getSummaryReport(req.query || {})
    return sendSuccess(res, summary, 'Summary report loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load summary report', error.statusCode || 500)
  }
}

export const getAtcUsage = async (req, res) => {
  try {
    const report = await getAtcUsageReport(req.query || {})
    return sendSuccess(res, report, 'ATC usage report loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load ATC usage report', error.statusCode || 500)
  }
}

export const getFulfillment = async (req, res) => {
  try {
    const report = await getFulfillmentReport(req.query || {})
    return sendSuccess(res, report, 'Fulfillment report loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load fulfillment report', error.statusCode || 500)
  }
}

export const getPatientSummary = async (req, res) => {
  try {
    const report = await getPatientSummaryReport(req.user, req.query || {})
    return sendSuccess(res, report, 'Patient summary report loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load patient summary report', error.statusCode || 500)
  }
}
