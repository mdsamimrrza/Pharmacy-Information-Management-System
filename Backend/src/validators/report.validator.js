import { createValidator, optionalDate, optionalNumberRange } from './validate.js'

export const validateReportQuery = createValidator((req) => {
  const errors = []
  const query = req.query || {}

  optionalDate(errors, 'from', query.from)
  optionalDate(errors, 'to', query.to)
  optionalDate(errors, 'dateFrom', query.dateFrom)
  optionalDate(errors, 'dateTo', query.dateTo)
  optionalNumberRange(errors, 'limit', query.limit, 1, 50)

  return errors
})
