import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  role?: 'customer' | 'vendor' | 'super-admin'
  vendorId?: string
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'JWT_SECRET not configured on server' })
    }
    const secret = process.env.JWT_SECRET
    const decoded = jwt.verify(token, secret) as { userId: string; role?: string; vendorId?: string }
    req.userId = decoded.userId
    // Narrow role to the allowed union so TypeScript passes strict builds.
    req.role = (decoded.role as 'customer' | 'vendor' | 'super-admin' | undefined)
    req.vendorId = decoded.vendorId

    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles: ('customer' | 'vendor' | 'super-admin')[] ) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(401).json({ error: 'Unauthorized - No role' })
    }
    if (!roles.includes(req.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' })
    }
    next()
  }
}

export const requireVendor = requireRole('vendor', 'super-admin')
export const requireSuperAdmin = requireRole('super-admin')
