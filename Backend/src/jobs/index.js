import { startExpiryCheckJob } from './expiryCheck.job.js'
import { startLowStockCheckJob } from './lowStockCheck.job.js'

export const startBackgroundJobs = () => {
  if (process.env.ENABLE_BACKGROUND_JOBS === 'false') {
    console.log('[Jobs] Background jobs disabled by configuration.')
    return []
  }

  const handles = [startLowStockCheckJob(), startExpiryCheckJob()].filter(Boolean)
  console.log(`[Jobs] Background jobs started: ${handles.length}`)
  return handles
}
