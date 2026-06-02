import mongoose from 'mongoose'
import { config } from 'dotenv'
import { Product } from './src/models/Product.js'
import { dbConnect } from './src/db/db-connect.js'

config()

interface FakeStoreProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating?: {
    rate: number
    count: number
  }
}

interface PlatziProduct {
  id: number
  title: string
  price: number
  description: string
  category: {
    id: number
    name: string
  }
  images: string[]
}

async function fetchFakeStoreProducts(): Promise<FakeStoreProduct[]> {
  try {
    console.log('Fetching FakeStore API products...')
    const response = await fetch('https://fakestoreapi.com/products')
    const data: FakeStoreProduct[] = await response.json()
    console.log(`✓ Fetched ${data.length} products from FakeStore API`)
    return data
  } catch (error) {
    console.error('Error fetching FakeStore products:', error)
    return []
  }
}

async function fetchPlatziProducts(): Promise<PlatziProduct[]> {
  try {
    console.log('Fetching Platzi API products...')
    const response = await fetch('https://api.escuelajs.co/api/v1/products')
    const data: PlatziProduct[] = await response.json()
    console.log(`✓ Fetched ${data.length} products from Platzi API`)
    return data
  } catch (error) {
    console.error('Error fetching Platzi products:', error)
    return []
  }
}

function mapFakeStoreToProduct(product: FakeStoreProduct): any {
  // Map FakeStore categories to our categories
  const categoryMap: Record<string, string> = {
    'electronics': 'electronics',
    'jewelery': 'jewelry',
    "men's clothing": 'mens',
    "women's clothing": 'womens',
  }

  const mappedCategory = categoryMap[product.category.toLowerCase()] || product.category

  return {
    name: product.title,
    description: product.description,
    price: product.price,
    images: [product.image],
    category: mappedCategory,
    rating: product.rating?.rate || 0,
    reviews: product.rating?.count || 0,
    stock: Math.floor(Math.random() * 100) + 10,
    sustainable: Math.random() > 0.5,
    sizes: mappedCategory === 'electronics' ? [] : ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
    ],
  }
}

function mapPlatziToProduct(product: PlatziProduct): any {
  // Map Platzi categories to our categories
  const categoryMap: Record<string, string> = {
    'clothes': 'womens',
    'electronics': 'electronics',
    'furniture': 'electronics',
    'shoes': 'womens',
  }

  const mappedCategory = categoryMap[product.category?.name?.toLowerCase()] || 'electronics'

  return {
    name: product.title,
    description: product.description,
    price: Math.round(product.price * 100) / 100,
    images: Array.isArray(product.images) ? product.images.filter((img) => img && typeof img === 'string') : [],
    category: mappedCategory,
    rating: Math.random() * 5,
    reviews: Math.floor(Math.random() * 100),
    stock: Math.floor(Math.random() * 100) + 10,
    sustainable: Math.random() > 0.5,
    sizes: mappedCategory === 'electronics' ? [] : ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Blue', hex: '#0000FF' },
    ],
  }
}

async function seedDatabase() {
  try {
    await dbConnect()
    console.log('Connected to MongoDB')

    // Ask user which API(s) to seed
    console.log('\n📦 Product Seeding Options:')
    console.log('1. Seed FakeStore API (electronics, jewelry, men\'s, women\'s)')
    console.log('2. Seed Platzi API')
    console.log('3. Seed Both APIs')
    console.log('')

    // For this script, we'll seed both by default
    const shouldSeedBoth = true

    if (shouldSeedBoth) {
      // Clear existing products
      console.log('\n🗑️  Clearing existing products...')
      await Product.deleteMany({})

      // Fetch and seed FakeStore products
      const fakeStoreProducts = await fetchFakeStoreProducts()
      const mappedFakeStore = fakeStoreProducts.map(mapFakeStoreToProduct)

      console.log(`\n💾 Inserting ${mappedFakeStore.length} FakeStore products...`)
      await Product.insertMany(mappedFakeStore)
      console.log(`✓ Inserted ${mappedFakeStore.length} FakeStore products`)

      // Fetch and seed Platzi products
      const platziProducts = await fetchPlatziProducts()
      const mappedPlatzi = platziProducts.slice(0, 50).map(mapPlatziToProduct) // Limit Platzi to 50 for variety

      console.log(`\n💾 Inserting ${mappedPlatzi.length} Platzi products...`)
      await Product.insertMany(mappedPlatzi)
      console.log(`✓ Inserted ${mappedPlatzi.length} Platzi products`)

      // Get category counts
      const categoryCounts = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])

      console.log('\n📊 Product Summary by Category:')
      categoryCounts.forEach((cat) => {
        console.log(`  ${cat._id}: ${cat.count} products`)
      })

      const totalCount = await Product.countDocuments()
      console.log(`\n✅ Seeding complete! Total products: ${totalCount}`)
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedDatabase()
