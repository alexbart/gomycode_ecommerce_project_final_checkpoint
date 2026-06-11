import apiClient from './client'

export interface Product {
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
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  role?: 'customer' | 'vendor' | 'super-admin'
  vendorId?: string
}

export interface CartItem {
  _id?: string
  productId: string
  quantity: number
  size?: string
  color?: string
  price: number
  vendorId?: string
}

export interface Cart {
  _id: string
  userId: string
  items: CartItem[]
  totalPrice: number
}

export interface Order {
  _id: string
  userId: string
  items: CartItem[]
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

export interface Wishlist {
  _id: string
  userId: string
  products: string[]
  createdAt: string
  updatedAt: string
}

// Auth endpoints
export const authAPI = {
  register: (email: string, password: string, firstName: string, lastName: string) =>
    apiClient.post('/auth/register', { email, password, firstName, lastName }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data: Partial<User>) =>
    apiClient.put('/auth/me', data),
}

// Products endpoints
export const productsAPI = {
  getAll: (page?: number, limit?: number, category?: string, sortBy?: string, order?: string) =>
    apiClient.get('/products', { params: { page, limit, category, sortBy, order } }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  search: (query: string) => apiClient.get(`/products/search/${query}`),
}

// Cart endpoints
export const cartAPI = {
  get: () => apiClient.get('/cart'),
  add: (productId: string, quantity: number, size?: string, color?: string) =>
    apiClient.post('/cart/add', { productId, quantity, size, color }),
  remove: (itemId: string) => apiClient.post('/cart/remove', { itemId }),
  update: (itemId: string, quantity: number) =>
    apiClient.put('/cart/update', { itemId, quantity }),
  clear: () => apiClient.delete('/cart'),
}

// Wishlist endpoints
export const wishlistAPI = {
  get: () => apiClient.get('/wishlist'),
  add: (productId: string) =>
    apiClient.post('/wishlist/add', { productId }),
  remove: (productId: string) =>
    apiClient.post('/wishlist/remove', { productId }),
  check: (productId: string) =>
    apiClient.get(`/wishlist/check/${productId}`),
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Orders endpoints
export const ordersAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  create: (shippingAddress: ShippingAddress) =>
    apiClient.post('/orders', { shippingAddress }),
  cancel: (id: string) => apiClient.put(`/orders/${id}/cancel`, {}),
}
