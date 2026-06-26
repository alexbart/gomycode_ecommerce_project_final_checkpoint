import cors from 'cors'
import express from 'express'
import { config } from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbConnect } from './db/db-connect.js'
import { swaggerSpec } from './swagger.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import paystackRoutes from './routes/paystack.js'
import { authMiddleware } from './middleware/auth.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientPath = path.resolve(__dirname, '../../client/dist')

config()

const app = express()
const port = Number(process.env.PORT ?? 5000)

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5176',
      process.env.CLIENT_APP_URL,
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

// Swagger documentation
app.use('/api/docs', swaggerUi.serve)
app.get('/api/docs', swaggerUi.setup(swaggerSpec, { 
  swaggerOptions: {
    url: '/api/swagger-spec.json'
  }
}))
app.get('/api/swagger-spec.json', (req, res) => {
  res.json(swaggerSpec)
})

app.get('/', (req, res) => {
  res.json({
    message: 'Ecommerce API is running',
    docs: 'Visit /api/docs for API documentation',
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port,
  })
})

// Only serve the SPA if the client build exists.
// This prevents server-only Vercel deployments from crashing while trying to serve /client/dist.
const indexHtmlPath = path.join(clientPath, 'index.html')

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs') as typeof import('fs')
  if (fs.existsSync(indexHtmlPath)) {
    app.use(express.static(clientPath))

    // SPA fallback (must be registered after API routes)
    // Use an explicit regex route to avoid path-to-regexp errors with '*' on newer Express versions.
    app.get(/.*/, (req, res) => {
      res.sendFile(indexHtmlPath)
    })
  }
} catch {
  // If filesystem checks fail (e.g., different runtime), don't break API routes.
}



// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/paystack', paystackRoutes)
app.use('/api/admin', authMiddleware, adminRoutes)


async function bootstrap() {
  await dbConnect()

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to start server: ${message}`)
  process.exit(1)
})