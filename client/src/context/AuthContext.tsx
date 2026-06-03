import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Cart } from '../api/endpoints'
import { authAPI, cartAPI } from '../api/endpoints'

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    cartCount: number
    refreshCart: () => Promise<void>
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)
    const [cartCount, setCartCount] = useState(0)

    const refreshCart = async () => {
        if (!token) return
        try {
            const res = await cartAPI.get()
            const cart = res.data as Cart
            setCartCount(cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0))
        } catch {
            setCartCount(0)
        }
    }

    useEffect(() => {
        if (token) {
            authAPI
                .getMe()
                .then(() => refreshCart())
                .catch(() => {
                    localStorage.removeItem('token')
                    setToken(null)
                })
                .finally(() => setLoading(false))
        } else {
            setCartCount(0)
            setLoading(false)
        }
    }, [token])

    const login = async (email: string, password: string) => {
        const res = await authAPI.login(email, password)
        setToken(res.data.token)
        setUser(res.data.user)
        localStorage.setItem('token', res.data.token)
    }

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        const res = await authAPI.register(email, password, firstName, lastName)
        setToken(res.data.token)
        setUser(res.data.user)
        localStorage.setItem('token', res.data.token)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        setCartCount(0)
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                cartCount,
                refreshCart,
                login,
                register,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
