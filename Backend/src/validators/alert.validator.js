import {
  createValidator,
  optionalBooleanQuery,
  optionalEnum,
  optionalNumberRange,
  requireObjectId,
} from './validate.js'

const ALERT_TYPES = ['LOW_STOCK', 'NEAR_EXPIRY', 'EXPIRED']
const ALERT_SEVERITIES = ['CRITICAL', 'WARNING', 'INFO']

export const validateAlertIdParam = createValidator((req) => {
  const errors = []
  requireObjectId(errors, 'id', req.params?.id)
  return errors
})

export const validateAlertQuery = createValidator((req) => {
  const errors = []
  const query = req.query || {}

  optionalEnum(errors, 'type', query.type, ALERT_TYPES)
  optionalEnum(errors, 'severity', query.severity, ALERT_SEVERITIES)
  optionalBooleanQuery(errors, 'includeAcknowledged', query.includeAcknowledged)
  optionalNumberRange(errors, 'page', query.page, 1, 1000000)
  optionalNumberRange(errors, 'limit', query.limit, 1, 100)

  return errors
})
