import { createMedicine, getMedicineById, listMedicines, updateMedicine } from '../services/medicine.service.js'
import { removeMedicine } from '../services/medicine.service.js'
import { sendError, sendSuccess } from '../utils/responseHandler.js'

export const getAllMedicines = async (_req, res) => {
  try {
    const { medicines, pagination } = await listMedicines(_req.query || {})
    return sendSuccess(res, { medicines, pagination }, 'Medicines loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load medicines', error.statusCode || 500)
  }
}

export const getMedicine = async (req, res) => {
  try {
    const medicine = await getMedicineById(req.params.id)
    return sendSuccess(res, { medicine }, 'Medicine loaded')
  } catch (error) {
    return sendError(res, error.message || 'Failed to load medicine', error.statusCode || 500)
  }
}

export const createNewMedicine = async (req, res) => {
  try {
    const { name, genericName, atcCode } = req.body || {}

    if (!name || !genericName || !atcCode) {
      return sendError(res, 'name, genericName, and atcCode are required', 400)
    }

    const medicine = await createMedicine(req.body || {})
    return sendSuccess(res, { medicine }, 'Medicine created', 201)
  } catch (error) {
    return sendError(res, error.message || 'Failed to create medicine', error.statusCode || 500)
  }
}

export const updateExistingMedicine = async (req, res) => {
  try {
    const medicine = await updateMedicine(req.params.id, req.body || {})
    return sendSuccess(res, { medicine }, 'Medicine updated')
  } catch (error) {
    return sendError(res, error.message || 'Failed to update medicine', error.statusCode || 500)
  }
}

export const removeExistingMedicine = async (req, res) => {
  try {
    const medicine = await removeMedicine(req.params.id)
    return sendSuccess(res, { medicine }, 'Medicine deleted')
  } catch (error) {
    return sendError(res, error.message || 'Failed to delete medicine', error.statusCode || 500)
  }
}
