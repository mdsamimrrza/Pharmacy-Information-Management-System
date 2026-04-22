import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import router from './routes/index.js'
import { errorHandler, notFound } from './middlewares/error.middleware.js'
import { apiLimiter } from './middlewares/rateLimiter.middleware.js'

const app = express()

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(url => url.trim())
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// Apply rate limiting to all requests
app.use(apiLimiter)

// API routes
app.use('/api', router)

app.use(notFound)
app.use(errorHandler)

export default app
