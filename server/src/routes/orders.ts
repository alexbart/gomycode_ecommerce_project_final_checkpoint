import { Router, Response } from 'express'
import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

// Get user orders
router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const orders = await Order.find({ userId: req.userId })
        .populate('items.productId')
        .sort({ createdAt: -1 })

      res.json(orders)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Get order by ID
router.get(
  '/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.id).populate(
        'items.productId'
      )

      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      // Check if order belongs to user
      if (order.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      res.json(order)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Create order (checkout)
router.post(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { shippingAddress } = req.body

      if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address required' })
      }

      // Get cart items
      const cart = await Cart.findOne({ userId: req.userId })
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' })
      }

      // Create order from cart items
      const order = new Order({
        userId: req.userId,
        items: cart.items,
        totalPrice: cart.totalPrice,
        shippingAddress,
        status: 'pending',
      })

      await order.save()

      // Clear cart
      cart.items = []
      cart.totalPrice = 0
      await cart.save()

      await order.populate('items.productId')

      res.status(201).json(order)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Cancel order
router.put(
  '/:id/cancel',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const order = await Order.findById(req.params.id)

      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      if (order.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      if (order.status !== 'pending' && order.status !== 'processing') {
        return res.status(400).json({ error: 'Order cannot be cancelled' })
      }

      order.status = 'cancelled'
      await order.save()

      res.json(order)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

export default router
