import mongoose from 'mongoose'
import { config } from 'dotenv'
import { Product } from './src/models/Product.js'

config()

// Map Fake Store categories to our categories
const categoryMap: Record<string, string> = {
  electronics: 'electronics',
  jewelery: 'jewelry',
  "men's clothing": 'mens',
  "women's clothing": 'womens',
}

// Default sizes and colors for different categories
const defaultSizes: Record<string, string[]> = {
  shoes: ['5', '6', '7', '8', '9', '10', '11', '12', '13'],
  apparel: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  accessories: ['One Size'],
}

const defaultColors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Blue', hex: '#0000FF' },
]

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('MONGODB_URI not set in .env')
      process.exit(1)
    }

    await mongoose.connect(mongoUri)
    console.log('✓ Connected to MongoDB')

    // Fetch products from Fake Store API
    console.log('Fetching products from Fake Store API...')
    const response = await fetch('https://fakestoreapi.com/products')
    const fakeProducts = await response.json()

    console.log(`✓ Fetched ${fakeProducts.length} products`)

    // Transform and insert products
    const productsToInsert = fakeProducts.map((product: any) => ({
      name: product.title,
      description: product.description,
      price: Math.round(product.price * 10) / 10, // Round to 1 decimal
      images: [product.image],
      sizes: defaultSizes['accessories'], // Default to accessories sizes
      colors: defaultColors,
      stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
      category: categoryMap[product.category] || 'electronics',
      rating: product.rating.rate,
      reviews: product.rating.count,
      sustainable: true,
    }))

    // Clear existing products
    await Product.deleteMany({})
    console.log('✓ Cleared existing products')

    // Insert new products
    const inserted = await Product.insertMany(productsToInsert)
    console.log(`✓ Inserted ${inserted.length} products`)

    // Show sample products
    console.log('\n📦 Sample Products:')
    const samples = await Product.find().limit(3)
    samples.forEach((p) => {
      console.log(`  • ${p.name} - $${p.price} (${p.reviews} reviews)`)
    })

    await mongoose.connection.close()
    console.log('\n✓ Seeding complete!')
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

seedProducts()
