import { Router, Response } from 'express'
import { Product } from '../models/Product.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import { ensureValidImages } from '../utils/imageUtils.js'

const router = Router()

// Middleware to normalize product images
const normalizeProductImages = (product: any) => {
  if (product && product.images) {
    product.images = ensureValidImages(product.images)
  }
  return product
}

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products with filtering and pagination
 *     description: Retrieve products with optional filtering by category, sorting, and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, electronics, jewelry, mens, womens]
 *         description: Filter products by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, newest]
 *         description: Sort products by field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Number of products per page (max 100)
 *     responses:
 *       200:
 *         description: Successfully retrieved products with pagination
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
 *                   type: integer
 *                   description: Total number of products matching the filter
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 pages:
 *                   type: integer
 *                   description: Total number of pages
 *                 limit:
 *                   type: integer
 *                   description: Number of products per page
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

    // Normalize images for all products
    const normalizedProducts = products.map((product: any) => {
      const obj = product.toObject ? product.toObject() : product
      return normalizeProductImages(obj)
    })

    res.json({
      products: normalizedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
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
<<<<<<< HEAD
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     enum: [electronics, jewelry, mens, womens]
 *                   count:
 *                     type: integer
 *                   description:
 *                     type: string
=======
 *                 $ref: '#/components/schemas/Category'
>>>>>>> main
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
<<<<<<< HEAD
// Get all categories with product counts
=======
// Get all categories
>>>>>>> main
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
<<<<<<< HEAD
                      then: "Men's clothing and apparel",
                      else: {
                        $cond: {
                          if: { $eq: ['$_id', 'womens'] },
                          then: "Women's clothing and apparel",
=======
                      then: "Men's clothing",
                      else: {
                        $cond: {
                          if: { $eq: ['$_id', 'womens'] },
                          then: "Women's clothing",
>>>>>>> main
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
<<<<<<< HEAD
 *     description: Retrieve a specific product with all details including images
=======
 *     description: Retrieve a specific product by its ID
>>>>>>> main
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

    const normalized = normalizeProductImages(product.toObject ? product.toObject() : product)
    res.json(normalized)
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
<<<<<<< HEAD
 *     description: Search for products by name, description, or category (case-insensitive)
=======
 *     description: Search for products by name, description, or category
>>>>>>> main
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
<<<<<<< HEAD
 *         description: Search query string (e.g., "laptop", "shirt", "electronics")
 *     responses:
 *       200:
 *         description: Successfully retrieved search results (max 20 products)
=======
 *         description: Search query string
 *     responses:
 *       200:
 *         description: Successfully retrieved search results
>>>>>>> main
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
<<<<<<< HEAD
 *     description: Create a new product entry. Admin authentication will be required in future versions.
=======
 *     description: Create a new product (currently open, admin authentication coming soon)
>>>>>>> main
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
<<<<<<< HEAD
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - images
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *                 enum: [electronics, jewelry, mens, womens]
 *               stock:
 *                 type: number
 *                 minimum: 0
 *               rating:
 *                 type: number
 *                 default: 0
 *               reviews:
 *                 type: number
 *                 default: 0
 *               sustainable:
 *                 type: boolean
 *                 default: true
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: string
 *               colors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     hex:
 *                       type: string
=======
 *             $ref: '#/components/schemas/Product'
>>>>>>> main
 *     responses:
 *       201:
 *         description: Product successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
<<<<<<< HEAD
 *         description: Invalid product data or missing required fields
=======
 *         description: Invalid product data
>>>>>>> main
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
