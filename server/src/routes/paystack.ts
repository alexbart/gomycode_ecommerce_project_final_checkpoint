import { Router, Response } from 'express'
import crypto from 'crypto'
import axios from 'axios'
import { Cart } from '../models/Cart.js'
import { Order } from '../models/Order.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'

const router = Router()

function getPaystackSecret() {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY not configured')
  }
  return process.env.PAYSTACK_SECRET_KEY
}

function getPaystackWebhookSecret() {
  // Some setups use the same secret for webhook verification.
  return process.env.PAYSTACK_WEBHOOK_SECRET ?? process.env.PAYSTACK_SECRET_KEY
}

function verifyPaystackSignature(req: AuthRequest) {
  // Paystack commonly sends:
  // - x-paystack-signature (SHA512 base64)
  // - x-paystack-request-id (optional)
  const signatureHeader = req.headers['x-paystack-signature']
  const signature = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader

  if (!signature) return false

  // Need the raw body for exact signature verification.
  // Express.json() parsing loses raw body, but in our case we do not have raw-body configured.
  // For now we do a best-effort verification by recomputing using JSON string of parsed body.
  // This will work if Paystack accepts this computed form; for strict verification,
  // we would need raw-body middleware.
  const webhookSecret = getPaystackWebhookSecret() ?? ''
  const payload = JSON.stringify(req.body)
  const hmac = crypto
    .createHmac('sha512', webhookSecret)
    .update(payload)
    .digest('hex')

  // Paystack signature format can be hex or base64 depending on their docs.
  // We compare both hex digest and base64 digest to be resilient.
  const hmacBase64 = Buffer.from(hmac, 'hex').toString('base64')

  return signature === hmac || signature === hmacBase64
}

router.post(
  '/initialize',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { shippingAddress } = req.body

      if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address required' })
      }

      const cart = await Cart.findOne({ userId: req.userId })
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' })
      }

      const secretKey = getPaystackSecret()

      // Paystack expects amount in the smallest currency unit.
      // EcoMart displays KES (cart.totalPrice * 130). We'll use that as the amount.
      // If you already store values in KES, adjust accordingly.
      const amountKES = Math.round(cart.totalPrice * 130)
      if (!amountKES || amountKES <= 0) {
        return res.status(400).json({ error: 'Invalid cart total' })
      }

      // Create order as pending but do NOT clear cart until webhook success.
      // Create a deterministic reference we can find later.
      const reference = `ecomart_${Date.now()}_${Math.random().toString(16).slice(2)}`

      const order = new Order({
        userId: req.userId,
        items: cart.items,
        totalPrice: cart.totalPrice,
        paymentReference: reference,
        shippingAddress,
        status: 'pending',
      })

      await order.save()

      const payload = {
        email: req.body.email, // optional; front-end could provide user email. If missing, Paystack may still accept.
        amount: amountKES,
        reference,
        // 'callback_url' can be used but we rely on webhook. Still set to keep user flow.
        callback_url: process.env.PAYSTACK_CALLBACK_URL ?? undefined,
        currency: 'KES',
        metadata: {
          orderId: order._id.toString(),
          userId: req.userId,
        },
      }

      const { data } = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        payload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!data?.data?.authorization_url || !data?.data?.reference) {
        return res.status(502).json({ error: 'Paystack initialize failed' })
      }

      // Fallback option: if Paystack behaves abnormally and you need immediate order placement,
      // you can clear the cart here (commented out by default).
      //
      // cart.items = []
      // cart.totalPrice = 0
      // await cart.save()

      return res.status(201).json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
        orderId: order._id,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.status(500).json({ error: message })
    }
  }
)

router.post(
  '/webhook',
  async (req, res: Response) => {
    try {
    // Basic signature check. For strict signature verification, configure raw body.
    const ok = verifyPaystackSignature(req)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid Paystack signature' })
    }

    const event = req.body?.event
    const eventType = typeof event === 'string' ? event : ''

    // We'll handle only successful charge events.
    // Common Paystack events: charge.success
    if (eventType !== 'charge.success' && eventType !== 'transfer.success') {
      return res.status(200).json({ received: true })
    }

    const reference = req.body?.data?.reference
    if (!reference) {
      return res.status(400).json({ error: 'Missing reference in webhook' })
    }

    const order = await Order.findOne({ paymentReference: reference })
    if (!order) {
      return res.status(404).json({ error: 'Order not found for reference' })
    }

    // Update order status
    order.status = 'processing'
    await order.save()

    // Clear cart now (primary behavior)
    const cart = await Cart.findOne({ userId: order.userId })
    if (cart) {
      cart.items = []
      cart.totalPrice = 0
      await cart.save()
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: message })
  }
})

export default router

