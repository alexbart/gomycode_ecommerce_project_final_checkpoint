import { Router, Response } from 'express'
import { Product } from '../models/Product.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

// Get all products with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { category, sortBy, order, page = 1, limit = 12 } = req.query

    const filter: Record<string, any> = {}

    if (category && category !== 'all') {
      filter.category = category
    }

    let query = Product.find(filter)

    // Sorting
    if (sortBy === 'price') {
      query = query.sort({
        price: order === 'desc' ? -1 : 1,
      })
    } else if (sortBy === 'rating') {
      query = query.sort({
        rating: order === 'desc' ? -1 : 1,
      })
    } else if (sortBy === 'newest') {
      query = query.sort({ createdAt: -1 })
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)
    query = query.skip(skip).limit(Number(limit))

    const products = await query.exec()
    const total = await Product.countDocuments(filter)

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).limit(20)

    res.json(products)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Create product (admin only - for now no auth check)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(400).json({ error: message })
  }
})

export default router
