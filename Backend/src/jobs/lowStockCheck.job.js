import Inventory from '../models/Inventory.model.js'
import { createAlert } from '../services/alert.service.js'
import { getInventoryRiskSummary, getInventoryStatus } from '../services/inventory.service.js'

const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000

const getIntervalMs = () => {
  const rawValue = Number(process.env.LOW_STOCK_JOB_INTERVAL_MS || DEFAULT_INTERVAL_MS)
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : DEFAULT_INTERVAL_MS
}

export const runLowStockCheck = async () => {
  const items = await Inventory.find().populate('medicineId', 'name genericName')
  let scanned = 0
  let updated = 0
  let alerted = 0

  for (const item of items) {
    scanned += 1

    const nextStatus = getInventoryStatus(item)
    const { isLowStock } = getInventoryRiskSummary(item)

    if (item.status !== nextStatus) {
      item.status = nextStatus
      await item.save()
      updated += 1
    }

    if (isLowStock) {
      const medicineName = item?.medicineId?.name || item?.medicineId?.genericName || item.atcCode

      await createAlert({
        type: 'LOW_STOCK',
        severity: 'CRITICAL',
        medicineId: item.medicineId?._id || item.medicineId,
        message: `${medicineName} stock (${item.currentStock}) is below threshold (${item.threshold})`,
      })

      alerted += 1
    }
  }

  console.log(`[Jobs] Low stock check completed: scanned=${scanned}, updated=${updated}, alerted=${alerted}`)
  return { scanned, updated, alerted }
}

export const startLowStockCheckJob = () => {
  if (process.env.ENABLE_BACKGROUND_JOBS === 'false') {
    return null
  }

  const intervalMs = getIntervalMs()
  runLowStockCheck().catch((error) => {
    console.error(`[Jobs] Low stock check failed: ${error.message}`)
  })

  return setInterval(() => {
    runLowStockCheck().catch((error) => {
      console.error(`[Jobs] Low stock check failed: ${error.message}`)
    })
  }, intervalMs)
}
