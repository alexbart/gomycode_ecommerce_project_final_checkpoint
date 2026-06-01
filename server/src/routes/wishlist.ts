import { Router, Response } from 'express'
import { Wishlist } from '../models/Wishlist.js'
import { Product } from '../models/Product.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

// Get wishlist
router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const wishlist = await Wishlist.findOne({
        userId: req.userId,
      }).populate('products')

      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' })
      }

      res.json(wishlist)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Add to wishlist
router.post(
  '/add',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId } = req.body

      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' })
      }

      const product = await Product.findById(productId)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      let wishlist = await Wishlist.findOne({ userId: req.userId })
      if (!wishlist) {
        wishlist = new Wishlist({ userId: req.userId, products: [] })
      }

      if (!wishlist.products.includes(product._id)) {
        wishlist.products.push(product._id)
      }

      await wishlist.save()
      await wishlist.populate('products')

      res.json(wishlist)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Remove from wishlist
router.post(
  '/remove',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId } = req.body

      const wishlist = await Wishlist.findOne({ userId: req.userId })
      if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' })
      }

      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      )

      await wishlist.save()
      await wishlist.populate('products')

      res.json(wishlist)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Check if product in wishlist
router.get(
  '/check/:productId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const wishlist = await Wishlist.findOne({ userId: req.userId })

      if (!wishlist) {
        return res.json({ inWishlist: false })
      }

      const inWishlist = wishlist.products.some(
        (id) => id.toString() === req.params.productId
      )

      res.json({ inWishlist })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

export default router
