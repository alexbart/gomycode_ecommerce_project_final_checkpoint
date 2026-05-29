import mongoose from 'mongoose'

export async function dbConnect() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.warn('MONGODB_URI is not set; database connection skipped.')
    return
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('Database connected successfully!')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Database connection error: ${message}`)
  }
}