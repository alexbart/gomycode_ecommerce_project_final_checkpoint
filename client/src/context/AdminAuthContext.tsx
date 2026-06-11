import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { adminApiClient } from '../api/client'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'vendor' | 'super-admin'
  vendorId?: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'))
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(() => {
    if (token) {
      adminApiClient
        .get('/auth/me')
        .then((res) => {
          const userData = res.data as AdminUser
          if (userData.role === 'vendor' || userData.role === 'super-admin') {
            setUser(userData)
          } else {
            localStorage.removeItem('adminToken')
            setToken(null)
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string) => {
    const res = await adminApiClient.post('/auth/login', { email, password })
    const userData = res.data.user as AdminUser
    if (userData.role === 'vendor' || userData.role === 'super-admin') {
      setToken(res.data.token)
      setUser(userData)
      localStorage.setItem('adminToken', res.data.token)
      // Update the adminApiClient default header
      adminApiClient.defaults.headers.common.Authorization = `Bearer ${res.data.token}`
    } else {
      throw new Error('Access denied - Admin privileges required')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('adminToken')
    delete adminApiClient.defaults.headers.common.Authorization
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'super-admin',
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}