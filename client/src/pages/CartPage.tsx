import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cart, cartAPI } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
    const navigate = useNavigate()
    const { isAuthenticated, refreshCart } = useAuth()
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        cartAPI
            .get()
            .then((res) => setCart(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [isAuthenticated, navigate])

    const handleRemove = async (itemId: string) => {
        try {
            const res = await cartAPI.remove(itemId)
            setCart(res.data)
            refreshCart()
        } catch (error) {
            console.error(error)
        }
    }

    const handleQuantityChange = async (itemId: string, quantity: number) => {
        if (quantity < 1) {
            handleRemove(itemId)
            return
        }

        try {
            const res = await cartAPI.update(itemId, quantity)
            setCart(res.data)
            refreshCart()
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Loading cart...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {!cart || cart.items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Your cart is empty</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                {cart.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-4"
                                    >
                                        {item.productId && typeof item.productId === 'object' && 'images' in item.productId && (
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={(item.productId as any).images[0]}
                                                    alt={(item.productId as any).name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {typeof item.productId === 'object' && 'name' in item.productId
                                                    ? (item.productId as any).name
                                                    : 'Product'}
                                            </h3>
                                            {item.size && (
                                                <p className="text-sm text-gray-500">Size: {item.size}</p>
                                            )}
                                            {item.color && (
                                                <p className="text-sm text-gray-500">Color: {item.color}</p>
                                            )}
                                            <p className="text-sm font-semibold text-gray-900 mt-2">
                                                KES {(item.price * 130).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => handleRemove(item._id!)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Remove
                                            </button>

                                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(item._id!, item.quantity - 1)
                                                    }
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                >
                                                    −
                                                </button>
                                                <span className="px-3">{item.quantity}</span>
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(item._id!, item.quantity + 1)
                                                    }
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 p-6 rounded-lg h-fit">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal:</span>
                                <span>KES {(cart.totalPrice * 130).toFixed(2)}</span>
                            </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping:</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between font-semibold text-gray-900">
                                        <span>Total:</span>
                                        <span>KES {(cart.totalPrice * 130).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full mt-3 bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
