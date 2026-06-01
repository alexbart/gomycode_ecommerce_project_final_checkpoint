import mongoose, { Document, Schema } from 'mongoose'

export interface ICartItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  size?: string
  color?: string
  price: number
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId
  items: ICartItem[]
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: String,
    color: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

export const Cart = mongoose.model<ICart>('Cart', cartSchema)
