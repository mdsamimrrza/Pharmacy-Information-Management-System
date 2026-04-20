import { ROLES } from '../utils/constants.js'
import {
  createValidator,
  optionalBoolean,
  optionalEmail,
  optionalEnum,
  optionalObjectId,
  optionalString,
  requireAtLeastOneOf,
  requireEmail,
  requireNonEmptyString,
  requireObjectId,
  optionalNumberRange,
} from './validate.js'

export const validateUserQuery = createValidator((req) => {
  const errors = []
  const query = req.query || {}

  optionalEnum(errors, 'role', query.role, Object.values(ROLES))
  if (query.isActive !== undefined && query.isActive !== 'true' && query.isActive !== 'false') {
    errors.push({ field: 'isActive', message: 'isActive must be either "true" or "false"' })
  }
  optionalNumberRange(errors, 'page', query.page, 1, 1000000)
  optionalNumberRange(errors, 'limit', query.limit, 1, 100)

  return errors
})

export const validateUserIdParam = createValidator((req) => {
  const errors = []
  requireObjectId(errors, 'id', req.params?.id)
  return errors
})

export const validateCreateUser = createValidator((req) => {
  const errors = []
  const body = req.body || {}

  requireNonEmptyString(errors, 'firstName', body.firstName)
  requireNonEmptyString(errors, 'lastName', body.lastName)
  requireEmail(errors, 'email', body.email)
  requireNonEmptyString(errors, 'password', body.password)
  optionalBoolean(errors, 'isActive', body.isActive)
  optionalObjectId(errors, 'managerId', body.managerId)
  optionalString(errors, 'firstName', body.firstName)
  optionalString(errors, 'lastName', body.lastName)
  optionalEnum(errors, 'role', body.role, Object.values(ROLES))

  if (!body.role) {
    errors.push({ field: 'role', message: `role must be one of: ${Object.values(ROLES).join(', ')}` })
  }

  return errors
})

export const validateUpdateUser = createValidator((req) => {
  const errors = []
  const body = req.body || {}

  requireObjectId(errors, 'id', req.params?.id)
  requireAtLeastOneOf(errors, body, ['firstName', 'lastName', 'email', 'password', 'role', 'isActive'])
  optionalString(errors, 'firstName', body.firstName)
  optionalString(errors, 'lastName', body.lastName)
  optionalEmail(errors, 'email', body.email)
  optionalString(errors, 'password', body.password)
  optionalEnum(errors, 'role', body.role, Object.values(ROLES))
  optionalBoolean(errors, 'isActive', body.isActive)

  return errors
})
