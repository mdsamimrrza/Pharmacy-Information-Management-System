import {
  createValidator,
  optionalEnum,
  optionalNonNegativeNumber,
  optionalObjectId,
  optionalString,
  requireAtLeastOneOf,
  requireNonEmptyString,
  requireObjectId,
} from './validate.js'

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Injection', 'Syrup', 'Cream', 'Inhaler']

export const validateMedicineIdParam = createValidator((req) => {
  const errors = []
  requireObjectId(errors, 'id', req.params?.id)
  return errors
})

export const validateMedicineQuery = createValidator((req) => {
  const errors = []
  const query = req.query || {}
  optionalString(errors, 'q', query.q)
  optionalString(errors, 'atcCode', query.atcCode)
  optionalObjectId(errors, 'medicineId', query.medicineId)
  optionalNonNegativeNumber(errors, 'page', query.page)
  optionalNonNegativeNumber(errors, 'limit', query.limit)
  return errors
})

export const validateCreateMedicine = createValidator((req) => {
  const errors = []
  const body = req.body || {}

  requireNonEmptyString(errors, 'name', body.name)
  requireNonEmptyString(errors, 'genericName', body.genericName)
  requireNonEmptyString(errors, 'atcCode', body.atcCode)
  optionalString(errors, 'brand', body.brand)
  optionalString(errors, 'strength', body.strength)
  optionalString(errors, 'manufacturer', body.manufacturer)
  optionalEnum(errors, 'dosageForm', body.dosageForm, DOSAGE_FORMS)
  optionalNonNegativeNumber(errors, 'mrp', body.mrp)

  return errors
})

export const validateUpdateMedicine = createValidator((req) => {
  const errors = []
  const body = req.body || {}

  requireObjectId(errors, 'id', req.params?.id)
  requireAtLeastOneOf(errors, body, [
    'name',
    'genericName',
    'atcCode',
    'brand',
    'strength',
    'manufacturer',
    'dosageForm',
    'mrp',
  ])
  optionalString(errors, 'name', body.name)
  optionalString(errors, 'genericName', body.genericName)
  optionalString(errors, 'atcCode', body.atcCode)
  optionalString(errors, 'brand', body.brand)
  optionalString(errors, 'strength', body.strength)
  optionalString(errors, 'manufacturer', body.manufacturer)
  optionalEnum(errors, 'dosageForm', body.dosageForm, DOSAGE_FORMS)
  optionalNonNegativeNumber(errors, 'mrp', body.mrp)

  return errors
})
