import cors from 'cors'
import express from 'express'
import { config } from 'dotenv'
import { dbConnect } from './db/db-connect.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import orderRoutes from './routes/orders.js'

config()

const app = express()
const port = Number(process.env.PORT ?? 5000)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Ecommerce API is running',
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