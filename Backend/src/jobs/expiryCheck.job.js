import Inventory from '../models/Inventory.model.js'
import { createAlert } from '../services/alert.service.js'
import { getInventoryRiskSummary, getInventoryStatus } from '../services/inventory.service.js'

const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000

const getIntervalMs = () => {
  const rawValue = Number(process.env.EXPIRY_JOB_INTERVAL_MS || DEFAULT_INTERVAL_MS)
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : DEFAULT_INTERVAL_MS
}

export const runExpiryCheck = async () => {
  const items = await Inventory.find().populate('medicineId', 'name genericName')
  let scanned = 0
  let updated = 0
  let alerted = 0

  for (const item of items) {
    scanned += 1

    const nextStatus = getInventoryStatus(item)
    const { isExpired, isNearExpiry } = getInventoryRiskSummary(item)

    if (item.status !== nextStatus) {
      item.status = nextStatus
      await item.save()
      updated += 1
    }

    const medicineName = item?.medicineId?.name || item?.medicineId?.genericName || item.atcCode

    if (isNearExpiry) {
      await createAlert({
        type: 'NEAR_EXPIRY',
        severity: 'WARNING',
        medicineId: item.medicineId?._id || item.medicineId,
        message: `${medicineName} batch ${item.batchId} is nearing expiry on ${new Date(
          item.expiryDate
        ).toLocaleDateString()}`,
      })
      alerted += 1
    }

    if (isExpired) {
      await createAlert({
        type: 'EXPIRED',
        severity: 'CRITICAL',
        medicineId: item.medicineId?._id || item.medicineId,
        message: `${medicineName} batch ${item.batchId} expired on ${new Date(
          item.expiryDate
        ).toLocaleDateString()}`,
      })
      alerted += 1
    }
  }

  console.log(`[Jobs] Expiry check completed: scanned=${scanned}, updated=${updated}, alerted=${alerted}`)
  return { scanned, updated, alerted }
}

export const startExpiryCheckJob = () => {
  if (process.env.ENABLE_BACKGROUND_JOBS === 'false') {
    return null
  }

  const intervalMs = getIntervalMs()
  runExpiryCheck().catch((error) => {
    console.error(`[Jobs] Expiry check failed: ${error.message}`)
  })

  return setInterval(() => {
    runExpiryCheck().catch((error) => {
      console.error(`[Jobs] Expiry check failed: ${error.message}`)
    })
  }, intervalMs)
}
