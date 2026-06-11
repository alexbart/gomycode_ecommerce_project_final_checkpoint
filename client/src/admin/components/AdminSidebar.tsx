import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminSidebar() {
  const location = useLocation()
  const { isAdmin } = useAdminAuth()

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    ...(isAdmin ? [{ path: '/admin/vendors', label: 'Vendors', icon: '🏪' }] : []),
  ]

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">EcoMart Admin</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}