import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import app from './app.js'
import { validateEnv } from './config/env.js'
import { connectDatabase } from './config/db.js'
import { startBackgroundJobs } from './jobs/index.js'
import { bootstrapDefaultUsersIfEmpty } from './services/auth.service.js'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)
const envPath = resolve(currentDir, '../.env')

dotenv.config({ path: envPath })

const start = async () => {
  validateEnv()
  await connectDatabase()

  const bootstrapResult = await bootstrapDefaultUsersIfEmpty()
  if (bootstrapResult?.seeded) {
    console.log(`Synchronized ${bootstrapResult.count} default demo auth users`)
  }

  const port = Number(process.env.PORT || 5000)
  const server = app.listen(port, () => {
    console.log(`PIMS backend running on port ${port}`)
    startBackgroundJobs()
  })

  server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other backend process or change PORT in Backend/.env.`)
    } else {
      console.error('Backend server failed to start', error)
    }

    process.exit(1)
  })
}

start().catch((error) => {
  console.error('Failed to start backend', error)
  process.exit(1)
})
