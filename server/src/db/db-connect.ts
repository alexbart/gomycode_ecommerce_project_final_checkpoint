import mongoose from 'mongoose'

export async function dbConnect() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set')
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Database connected successfully!')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Database connection error: ${message}`)
    throw error
  }
}