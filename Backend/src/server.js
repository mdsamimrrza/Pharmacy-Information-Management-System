import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import app from './app.js'
import { validateEnv } from './config/env.js'
import { connectDatabase } from './config/db.js'
import { startBackgroundJobs } from './jobs/index.js'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)
const envPath = resolve(currentDir, '../.env')

dotenv.config({ path: envPath })

const start = async () => {
  validateEnv()
  await connectDatabase()
  startBackgroundJobs()

  const port = Number(process.env.PORT || 5000)

  app.listen(port, () => {
    console.log(`PIMS backend running on port ${port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start backend', error)
  process.exit(1)
})
