import { adminApiClient } from './client'

export interface Vendor {
  _id: string
  name: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  logo?: string
  banner?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminProduct {
  _id: string
  name: string
  description: string
  price: number
  images: string[]
  sizes: string[]
  colors: Array<{ name: string; hex: string }>
  stock: number
  category: string
  rating: number
  reviews: number
  sustainable: boolean
  vendorId?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminOrder {
  _id: string
  userId: string
  items: Array<{
    productId: string
    quantity: number
    size?: string
    color?: string
    price: number
    vendorId?: string
  }>
  totalPrice: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
}

export const adminAPI = {
  getVendors: () => adminApiClient.get<Vendor[]>('/admin/vendors'),
  createVendor: (data: Partial<Vendor> & { password: string }) =>
    adminApiClient.post('/admin/vendors', data),
  updateVendor: (id: string, data: Partial<Vendor>) =>
    adminApiClient.put(`/admin/vendors/${id}`, data),
  getVendor: (id: string) => adminApiClient.get<Vendor>(`/admin/vendors/${id}`),

  getProducts: () => adminApiClient.get<AdminProduct[]>('/admin/products'),
  createProduct: (data: Omit<AdminProduct, '_id' | 'createdAt' | 'updatedAt' | 'vendorId' | 'isApproved' | 'rating' | 'reviews'>) =>
    adminApiClient.post('/admin/products', data),
  updateProduct: (id: string, data: Partial<AdminProduct>) =>
    adminApiClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => adminApiClient.delete(`/admin/products/${id}`),
  approveProduct: (id: string, isApproved: boolean) =>
    adminApiClient.put(`/admin/products/${id}/approve`, { isApproved }),

  getOrders: () => adminApiClient.get<AdminOrder[]>('/admin/orders'),
  updateOrderStatus: (id: string, status: string) =>
    adminApiClient.put(`/admin/orders/${id}/status`, { status }),

  getStats: () => adminApiClient.get<{
    totalProducts?: number
    totalOrders?: number
    totalVendors?: number
    totalUsers?: number
    myProducts?: number
    myOrders?: number
    totalRevenue?: number
  }>('/admin/dashboard/stats'),
}