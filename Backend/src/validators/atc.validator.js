import { createValidator, optionalString, requireNonEmptyString } from './validate.js'

export const validateAtcCodeParam = createValidator((req) => {
  const errors = []
  requireNonEmptyString(errors, 'code', req.params?.code)
  return errors
})

export const validateAtcSearchQuery = createValidator((req) => {
  const errors = []
  const query = req.query || {}

  if (query.q === undefined) {
    errors.push({ field: 'q', message: 'q is required' })
  } else {
    requireNonEmptyString(errors, 'q', query.q)
    optionalString(errors, 'q', query.q)
  }

  return errors
})
