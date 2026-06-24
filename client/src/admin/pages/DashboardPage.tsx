import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/admin'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Stats {
  totalProducts?: number
  totalOrders?: number
  totalVendors?: number
  totalUsers?: number
  myProducts?: number
  myOrders?: number
  totalRevenue?: number
}

function formatKES(amount: number) {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `KES ${amount}`
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAdminAuth()

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-gray-600">Loading stats...</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isAdmin ? 'Super Admin Dashboard' : 'Vendor Dashboard'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatsCard title="Total Products" value={stats?.totalProducts || 0} />
            <StatsCard title="Total Orders" value={stats?.totalOrders || 0} />
            <StatsCard title="Total Vendors" value={stats?.totalVendors || 0} />
            <StatsCard title="Total Users" value={stats?.totalUsers || 0} />
            <StatsCard
              title="Total Revenue"
              value={formatKES(stats?.totalRevenue || 0)}
              className="md:col-span-4"
            />
          </>
        ) : (
          <>
            <StatsCard title="My Products" value={stats?.myProducts || 0} />
            <StatsCard title="My Orders" value={stats?.myOrders || 0} />
            <StatsCard
              title="Revenue"
              value={formatKES(stats?.totalRevenue || 0)}
              className="md:col-span-2"
            />
          </>
        )}
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  className = '',
}: {
  title: string
  value: string | number
  className?: string
}) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}