import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { wishlistAPI, Wishlist } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

export default function WishlistPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [wishlist, setWishlist] = useState<Wishlist | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        wishlistAPI
            .get()
            .then((res) => setWishlist(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [isAuthenticated, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Loading wishlist...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

                {!wishlist || wishlist.products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlist.products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
