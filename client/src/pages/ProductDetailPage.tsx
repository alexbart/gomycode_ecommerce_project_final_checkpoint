import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Product, productsAPI, cartAPI } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [product, setProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (id) {
            productsAPI
                .getById(id)
                .then((res) => setProduct(res.data))
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [id])

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        setAdding(true)
        try {
            await cartAPI.add(id!, quantity, selectedSize, selectedColor)
            alert('Added to cart!')
            setQuantity(1)
            setSelectedSize('')
            setSelectedColor('')
        } catch (error) {
            console.error(error)
            alert('Failed to add to cart')
        } finally {
            setAdding(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Loading product...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Product not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-900 mb-8"
                >
                    ← Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Images */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((image, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-gray-900"
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h1>
                        <p className="text-gray-500 text-sm mb-4 capitalize">
                            {product.category}
                        </p>

                        {product.rating > 0 && (
                            <div className="flex items-center mb-6">
                                <span className="text-lg text-yellow-500">★ {product.rating}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                    ({product.reviews} reviews)
                                </span>
                            </div>
                        )}

                        <p className="text-3xl font-bold text-gray-900 mb-6">
                            ${product.price}
                        </p>

                        <p className="text-gray-600 mb-6">
                            {product.description}
                        </p>

                        {product.sustainable && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-green-800">
                                    ♻️ Made from sustainable materials
                                </p>
                            </div>
                        )}

                        {/* Sizes */}
                        {product.sizes.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Size</h3>
                                <div className="flex gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium ${selectedSize === size
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-300 text-gray-900 hover:border-gray-900'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {product.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
                                <div className="flex gap-3">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-10 h-10 rounded-full border-2 ${selectedColor === color.name
                                                ? 'border-gray-900'
                                                : 'border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Quantity
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    −
                                </button>
                                <span className="px-4 py-2 w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() =>
                                        setQuantity(Math.min(product.stock, quantity + 1))
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={adding || product.stock === 0}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                        >
                            {adding ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
