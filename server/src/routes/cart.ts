import { Router, Response } from 'express'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

// Get cart
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId }).populate(
      'items.productId'
    )

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    res.json(cart)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Add item to cart
router.post('/add', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, size, color } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    let cart = await Cart.findOne({ userId: req.userId })
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [], totalPrice: 0 })
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        size,
        color,
        price: product.price,
      })
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )

    await cart.save()
    await cart.populate('items.productId')

    res.json(cart)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Remove item from cart
router.post(
  '/remove',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { itemId } = req.body

      const cart = await Cart.findOne({ userId: req.userId })
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' })
      }

      cart.items = cart.items.filter((item) => item._id?.toString() !== itemId)

      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )

      await cart.save()
      await cart.populate('items.productId')

      res.json(cart)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Update item quantity
router.put(
  '/update',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { itemId, quantity } = req.body

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid quantity' })
      }

      const cart = await Cart.findOne({ userId: req.userId })
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' })
      }

      const item = cart.items.find((i) => i._id?.toString() === itemId)
      if (!item) {
        return res.status(404).json({ error: 'Item not found' })
      }

      item.quantity = quantity

      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )

      await cart.save()
      await cart.populate('items.productId')

      res.json(cart)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Clear cart
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId })
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    cart.items = []
    cart.totalPrice = 0

    await cart.save()

    res.json(cart)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

export default router
