import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  images: string[]
  sizes: string[]
  colors: {
    name: string
    hex: string
  }[]
  stock: number
  category: string
  rating: number
  reviews: number
  sustainable: boolean
  vendorId?: mongoose.Types.ObjectId
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    sizes: [
      {
        type: String,
      },
    ],
    colors: [
      {
        name: String,
        hex: String,
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'jewelry', 'mens', 'womens'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    sustainable: {
      type: Boolean,
      default: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export const Product = mongoose.model<IProduct>('Product', productSchema)
