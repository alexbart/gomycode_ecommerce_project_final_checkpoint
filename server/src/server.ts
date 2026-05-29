import cors from 'cors'
import express from 'express'
import { config } from 'dotenv'
import { dbConnect } from './db/db-connect.js'


config()

const app = express()
const port = Number(process.env.PORT ?? 5000)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'MERN template API is running',
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port,
  })
})

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