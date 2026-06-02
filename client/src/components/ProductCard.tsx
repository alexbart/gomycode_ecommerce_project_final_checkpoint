import { Link } from 'react-router-dom'
import { Product } from '../api/endpoints'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link to={`/product/${product._id}`} className="group">
            <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg mb-4">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
                {product.category}
            </p>
            <div className="flex items-center justify-between mt-2">
                <p className="text-lg font-semibold text-gray-900">KES {(product.price * 130).toFixed(2)}</p>
                {product.sustainable && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Sustainable
                    </span>
                )}
            </div>
            {product.rating > 0 && (
                <div className="flex items-center mt-2">
                    <span className="text-sm text-yellow-500">★ {product.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>
            )}
        </Link>
    )
}
