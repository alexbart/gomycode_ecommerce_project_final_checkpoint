import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cart, cartAPI, paystackAPI } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [cart, setCart] = useState<Cart | null>(null)
    const [cartLoading, setCartLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        cartAPI
            .get()
            .then((res) => setCart(res.data))
            .catch(console.error)
            .finally(() => setCartLoading(false))
    }, [isAuthenticated, navigate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Start Paystack payment flow
            const initRes = await paystackAPI.initialize(formData)
            window.location.href = initRes.data.authorization_url
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Checkout failed'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Shipping Form */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Shipping Address
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        County
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="e.g. Nairobi"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        P.O. Box / Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="e.g. 00100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 mt-6"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg h-fit">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Order Summary
                        </h2>

                        {cartLoading ? (
                            <p className="text-gray-500 text-sm">Loading order summary...</p>
                        ) : cart && cart.items.length > 0 ? (
                            <>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal ({cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} items):</span>
                                        <span>KES {(cart.totalPrice * 130).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping:</span>
                                        <span className="text-green-600 font-semibold">Free</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between font-semibold text-gray-900 text-lg">
                                            <span>Total:</span>
                                            <span>KES {(cart.totalPrice * 130).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 text-sm">No items in cart</p>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                ✓ Free shipping on all orders
                            </p>
                            <p className="text-sm text-blue-800 mt-2">
                                ✓ Secure checkout with SSL encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
