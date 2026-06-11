import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Vendor } from '../models/Vendor.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { AuthRequest, requireSuperAdmin, requireVendor, authMiddleware } from '../middleware/auth.js'

const router = Router()

// Vendor registration (super-admin creates vendors)
router.post(
  '/vendors',
  requireSuperAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { email, password, name, phone, address, description } = req.body

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const existingVendor = await Vendor.findOne({ email })
      if (existingVendor) {
        return res.status(409).json({ error: 'Email already in use' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const vendor = new Vendor({
        email,
        name,
        phone,
        address,
        description,
        createdBy: req.userId,
      })
      await vendor.save()

      const user = new User({
        email,
        password: hashedPassword,
        firstName: name,
        lastName: '',
        role: 'vendor',
        vendorId: vendor._id,
      })
      await user.save()

      res.status(201).json({
        vendor,
        user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Get all vendors (super-admin only)
router.get(
  '/vendors',
  requireSuperAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const vendors = await Vendor.find().sort({ createdAt: -1 })
      res.json(vendors)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Get vendor by ID
router.get(
  '/vendors/:id',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await Vendor.findById(req.params.id)
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' })
      }
      res.json(vendor)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Update vendor (super-admin or own vendor)
router.put(
  '/vendors/:id',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await Vendor.findById(req.params.id)
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' })
      }

      if (req.role !== 'super-admin' && vendor._id.toString() !== req.vendorId) {
        return res.status(403).json({ error: 'Unauthorized to update this vendor' })
      }

      const updateData = { ...req.body }
      delete updateData.email
      delete updateData.createdBy

      const updatedVendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true })
      res.json(updatedVendor)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Get all products (with filtering for vendors)
router.get(
  '/products',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const filter: Record<string, any> = {}
      
      if (req.role === 'vendor') {
        filter.vendorId = req.vendorId
      }

      const products = await Product.find(filter).sort({ createdAt: -1 })
      res.json(products)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Create product (vendor or super-admin)
router.post(
  '/products',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const productData = {
        ...req.body,
        vendorId: req.vendorId,
        isApproved: req.role === 'super-admin' ? true : false,
      }

      const product = new Product(productData)
      await product.save()
      res.status(201).json(product)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(400).json({ error: message })
    }
  }
)

// Update product
router.put(
  '/products/:id',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      if (req.role !== 'super-admin' && product.vendorId?.toString() !== req.vendorId) {
        return res.status(403).json({ error: 'Unauthorized to update this product' })
      }

      const updateData = req.body
      if (req.role !== 'super-admin') {
        delete updateData.isApproved
      }

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
      res.json(updatedProduct)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Delete product
router.delete(
  '/products/:id',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      if (req.role !== 'super-admin' && product.vendorId?.toString() !== req.vendorId) {
        return res.status(403).json({ error: 'Unauthorized to delete this product' })
      }

      await Product.findByIdAndDelete(req.params.id)
      res.json({ message: 'Product deleted' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Approve product (super-admin only)
router.put(
  '/products/:id/approve',
  requireSuperAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { isApproved } = req.body
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isApproved },
        { new: true }
      )
      res.json(product)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Get all orders (filtered by role)
router.get(
  '/orders',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const filter: Record<string, any> = {}
      
      if (req.role === 'vendor') {
        filter['items.vendorId'] = req.vendorId
      }

      const orders = await Order.find(filter)
        .populate('items.productId')
        .sort({ createdAt: -1 })

      res.json(orders)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Update order status
router.put(
  '/orders/:id/status',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body

      const order = await Order.findById(req.params.id)
      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      if (req.role !== 'super-admin') {
        const hasVendorItem = order.items.some(
          (item) => item.vendorId?.toString() === req.vendorId
        )
        if (!hasVendorItem) {
          return res.status(403).json({ error: 'Unauthorized to update this order' })
        }
      }

      order.status = status
      await order.save()
      await order.populate('items.productId')
      res.json(order)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

// Get dashboard stats
router.get(
  '/dashboard/stats',
  requireVendor,
  async (req: AuthRequest, res: Response) => {
    try {
      const stats: Record<string, any> = {}

      if (req.role === 'super-admin') {
        const [totalProducts, totalOrders, totalVendors, totalUsers] = await Promise.all([
          Product.countDocuments(),
          Order.countDocuments(),
          Vendor.countDocuments(),
          User.countDocuments({ role: 'customer' }),
        ])

        const revenue = await Order.aggregate([
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ])

        stats.totalProducts = totalProducts
        stats.totalOrders = totalOrders
        stats.totalVendors = totalVendors
        stats.totalUsers = totalUsers
        stats.totalRevenue = revenue[0]?.total || 0
      } else {
        const vendorId = req.vendorId
        const [vendorProducts, vendorOrders] = await Promise.all([
          Product.countDocuments({ vendorId }),
          Order.countDocuments({ 'items.vendorId': vendorId }),
        ])

        const vendorRevenue = await Order.aggregate([
          { $match: { 'items.vendorId': vendorId } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ])

        stats.myProducts = vendorProducts
        stats.myOrders = vendorOrders
        stats.totalRevenue = vendorRevenue[0]?.total || 0
      }

      res.json(stats)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

export default router