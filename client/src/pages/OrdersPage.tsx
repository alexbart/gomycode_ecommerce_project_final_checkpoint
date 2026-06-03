import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Order, ordersAPI } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function OrdersPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        ordersAPI
            .getAll()
            .then((res) => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [isAuthenticated, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Loading orders...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No orders yet</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-semibold text-gray-900">
                                            {order._id.slice(-8).toUpperCase()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="font-semibold text-gray-900">
                                            KES {(order.totalPrice * 130).toFixed(2)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-800'
                                                    : order.status === 'shipped'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="mt-4 text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    View Details →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
