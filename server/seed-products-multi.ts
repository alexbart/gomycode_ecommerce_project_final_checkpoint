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

function mapFakeStoreToProduct(product: FakeStoreProduct): any {
  const categoryMap: Record<string, string> = {
    electronics: 'electronics',
    jewelery: 'jewelry',
    "men's clothing": 'mens',
    "women's clothing": 'womens',
  }

  const mappedCategory = categoryMap[product.category.toLowerCase()] || product.category

  return {
    name: product.title,
    description: product.description,
    price: Math.round(product.price * 10) / 10,
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
      { name: 'Blue', hex: '#0000FF' },
    ],
  }
}

async function seedDatabase() {
  try {
    await dbConnect()
    console.log('Connected to MongoDB')

    // Clear existing products
    console.log('\n🗑️  Clearing existing products...')
    await Product.deleteMany({})

    // Fetch and seed FakeStore products
    const fakeStoreProducts = await fetchFakeStoreProducts()
    const mappedFakeStore = fakeStoreProducts.map(mapFakeStoreToProduct)

    console.log(`\n💾 Inserting ${mappedFakeStore.length} FakeStore products...`)
    await Product.insertMany(mappedFakeStore)
    console.log(`✓ Inserted ${mappedFakeStore.length} products`)

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
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedDatabase()

