import Medicine from '../models/Medicine.model.js'

const notFoundError = () => {
  const error = new Error('Medicine not found')
  error.statusCode = 404
  return error
}

const duplicateError = () => {
  const error = new Error('Medicine already exists')
  error.statusCode = 409
  return error
}

const normalizeAtcCode = (value) => String(value || '').trim().toUpperCase()
const normalizeString = (value) => String(value || '').trim()

const getPagination = (filters = {}) => {
  const page = Math.max(1, Number(filters.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20))

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

const buildMedicineQuery = (filters = {}) => {
  const query = {}

  if (filters.atcCode) {
    query.atcCode = normalizeAtcCode(filters.atcCode)
  }

  if (filters.q) {
    const regex = new RegExp(String(filters.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ name: regex }, { genericName: regex }, { brand: regex }]
  }

  return query
}

const buildMedicineUniquenessQuery = (payload, excludeId = null) => {
  const query = {
    name: normalizeString(payload.name),
    genericName: normalizeString(payload.genericName),
    brand: normalizeString(payload.brand),
    atcCode: normalizeAtcCode(payload.atcCode),
    strength: normalizeString(payload.strength),
    dosageForm: payload.dosageForm || 'Tablet',
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  return query
}

export const listMedicines = async (filters = {}) => {
  const query = buildMedicineQuery(filters)
  const { page, limit, skip } = getPagination(filters)

  const [medicines, total] = await Promise.all([
    Medicine.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Medicine.countDocuments(query),
  ])

  return {
    medicines,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}

export const getMedicineById = async (id) => {
  const medicine = await Medicine.findById(id)

  if (!medicine) {
    throw notFoundError()
  }

  return medicine
}

export const createMedicine = async (payload) => {
  const duplicateMedicine = await Medicine.findOne(buildMedicineUniquenessQuery(payload))

  if (duplicateMedicine) {
    throw duplicateError()
  }

  const medicine = await Medicine.create({
    ...payload,
    atcCode: normalizeAtcCode(payload.atcCode),
  })

  return medicine
}

export const updateMedicine = async (id, payload) => {
  const updates = { ...payload }

  if (updates.atcCode) {
    updates.atcCode = normalizeAtcCode(updates.atcCode)
  }

  const currentMedicine = await Medicine.findById(id)

  if (!currentMedicine) {
    throw notFoundError()
  }

  const duplicateMedicine = await Medicine.findOne(
    buildMedicineUniquenessQuery(
      {
        name: updates.name ?? currentMedicine.name,
        genericName: updates.genericName ?? currentMedicine.genericName,
        brand: updates.brand ?? currentMedicine.brand,
        atcCode: updates.atcCode ?? currentMedicine.atcCode,
        strength: updates.strength ?? currentMedicine.strength,
        dosageForm: updates.dosageForm ?? currentMedicine.dosageForm,
      },
      id
    )
  )

  if (duplicateMedicine) {
    throw duplicateError()
  }

  const medicine = await Medicine.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })

  if (!medicine) {
    throw notFoundError()
  }

  return medicine
}

export const removeMedicine = async (id) => {
  const medicine = await Medicine.findByIdAndDelete(id)

  if (!medicine) {
    throw notFoundError()
  }

  return medicine
}
