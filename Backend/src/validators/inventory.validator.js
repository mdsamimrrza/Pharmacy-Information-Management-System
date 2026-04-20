import {
  createValidator,
  optionalDate,
  optionalEnum,
  optionalNonNegativeNumber,
  optionalNumberRange,
  optionalObjectId,
  optionalString,
  requireAtLeastOneOf,
  requireDate,
  requireNonEmptyString,
  requireObjectId,
  requireNonNegativeNumber,
} from './validate.js'

const INVENTORY_STATUSES = ['STABLE', 'LOW STOCK', 'NEAR EXPIRY', 'EXPIRED']

export const validateInventoryIdParam = createValidator((req) => {
  const errors = []
  requireObjectId(errors, 'id', req.params?.id)
  return errors
})

export const validateInventoryQuery = createValidator((req) => {
  const errors = []
  const query = req.query || {}

  optionalEnum(errors, 'status', query.status, INVENTORY_STATUSES)
  optionalObjectId(errors, 'medicineId', query.medicineId)
  optionalString(errors, 'atcCode', query.atcCode)
  optionalString(errors, 'q', query.q)
  optionalNumberRange(errors, 'page', query.page, 1, 1000000)
  optionalNumberRange(errors, 'limit', query.limit, 1, 250)

  return errors
})

export const validateCreateInventoryItem = createValidator((req) => {
  const errors = []
  const body = req.body || {}

  requireObjectId(errors, 'medicineId', body.medicineId)
  requireNonEmptyString(errors, 'batchId', body.batchId)
  requireNonNegativeNumber(errors, 'currentStock', body.currentStock)
  requireNonNegativeNumber(errors, 'threshold', body.threshold)
  requireDate(errors, 'expiryDate', body.expiryDate)
  optionalString(errors, 'storage', body.storage)
  optionalString(errors, 'atcCode', body.atcCode)

  return errors
})

export const validateUpdateInventoryItem = createValidator((req) => {
  const errors = []
  const body = req.body || {}

  requireObjectId(errors, 'id', req.params?.id)
  requireAtLeastOneOf(errors, body, [
    'medicineId',
    'batchId',
    'currentStock',
    'threshold',
    'expiryDate',
    'storage',
    'atcCode',
  ])
  optionalObjectId(errors, 'medicineId', body.medicineId)
  optionalString(errors, 'batchId', body.batchId)
  optionalNonNegativeNumber(errors, 'currentStock', body.currentStock)
  optionalNonNegativeNumber(errors, 'threshold', body.threshold)
  optionalDate(errors, 'expiryDate', body.expiryDate)
  optionalString(errors, 'storage', body.storage)
  optionalString(errors, 'atcCode', body.atcCode)

  return errors
})
