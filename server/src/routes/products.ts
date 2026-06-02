import { Router, Response } from 'express'
import { Product } from '../models/Product.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieve all products with optional filtering, sorting, and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, electronics, jewelry, mens, womens]
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, newest]
 *         description: Sort by field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 12
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pages:
 *                   type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /products/categories:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all product categories
 *     description: Retrieve all available product categories with product counts
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          description: {
            $cond: {
              if: { $eq: ['$_id', 'electronics'] },
              then: 'Electronic devices and gadgets',
              else: {
                $cond: {
                  if: { $eq: ['$_id', 'jewelry'] },
                  then: 'Jewelry and accessories',
                  else: {
                    $cond: {
                      if: { $eq: ['$_id', 'mens'] },
                      then: "Men's clothing",
                      else: {
                        $cond: {
                          if: { $eq: ['$_id', 'womens'] },
                          then: "Women's clothing",
                          else: 'Other products',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ])

    res.json(categories)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by ID
 *     description: Retrieve a specific product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Successfully retrieved product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /products/search/{query}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Search products
 *     description: Search for products by name, description, or category
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Successfully retrieved search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     description: Create a new product (currently open, admin authentication coming soon)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
