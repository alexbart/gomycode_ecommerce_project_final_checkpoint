import cors from 'cors'
import express from 'express'
import { config } from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import { dbConnect } from './db/db-connect.js'
import { swaggerSpec } from './swagger.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import orderRoutes from './routes/orders.js'

config()

const app = express()
const port = Number(process.env.PORT ?? 5000)

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.CLIENT_API_URL
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

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)

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