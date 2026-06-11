import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log({API_BASE_URL})

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to every request (for customer auth)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient

export const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to every request (for admin auth)
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
