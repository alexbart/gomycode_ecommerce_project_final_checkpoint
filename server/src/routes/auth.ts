import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { Cart } from '../models/Cart.js'
import { Wishlist } from '../models/Wishlist.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    })

    await user.save()

    // Create cart and wishlist for new user
    const cart = new Cart({ userId: user._id, items: [], totalPrice: 0 })
    const wishlist = new Wishlist({ userId: user._id, products: [] })

    await cart.save()
    await wishlist.save()

    // Generate token
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      expiresIn: '30d',
    })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      expiresIn: '30d',
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

// Update user profile
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, address } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone, address },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

export default router
