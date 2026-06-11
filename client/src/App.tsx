import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import Navigation from './components/Navigation'
import AdminLayout from './admin/components/AdminLayout'
import {
  ProductsPage,
  ProductDetailPage,
  CartPage,
  WishlistPage,
  LoginPage,
  RegisterPage,
  CheckoutPage,
  AccountPage,
  OrdersPage,
} from './pages'
import {
  AdminLoginPage,
  DashboardPage,
  AdminProductsPage,
  AdminOrdersPage,
  AdminVendorsPage,
} from './admin/pages'


function AppContent() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders" element={<OrdersPage />} />

        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <AdminLayout>
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="vendors" element={<AdminVendorsPage />} />
        </Routes>
      </AdminLayout>
    </AdminAuthProvider>
  )
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}
