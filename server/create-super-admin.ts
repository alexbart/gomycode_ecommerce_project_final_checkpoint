import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from './src/models/User.js'
import { Vendor } from './src/models/Vendor.js'
import { dbConnect } from './src/db/db-connect.js'

async function createSuperAdmin() {
  await dbConnect()

  const existing = await User.findOne({ role: 'super-admin' })
  if (existing) {
    console.log('Super admin already exists')
    process.exit(0)
  }

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const vendor = await Vendor.create({
    name: 'Admin',
    email: 'admin@ecomart.com',
    isActive: true,
  })

  await User.create({
    email: 'admin@ecomart.com',
    password: hashedPassword,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super-admin',
    vendorId: vendor._id,
  })

  console.log('Super admin created: admin@ecomart.com / admin123')
  process.exit(0)
}

createSuperAdmin().catch((err) => {
  console.error(err)
  process.exit(1)
})