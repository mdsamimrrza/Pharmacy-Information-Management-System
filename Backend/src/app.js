import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import router from './routes/index.js'
import { errorHandler, notFound } from './middlewares/error.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// API routes
app.use('/api', router)

// Serve static frontend files from dist
const frontendDistPath = join(__dirname, '../../Frontend/dist')
app.use(express.static(frontendDistPath))

// SPA fallback: redirect all non-API routes to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application')
    }
  })
})

app.use(notFound)
app.use(errorHandler)

export default app
