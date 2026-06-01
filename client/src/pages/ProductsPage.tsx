import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Product, productsAPI } from '../api/endpoints'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()

    const category = searchParams.get('category') || 'all'
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = searchParams.get('page') || '1'

    useEffect(() => {
        setLoading(true)
        productsAPI
            .getAll(
                Number(page),
                12,
                category !== 'all' ? category : undefined,
                sortBy,
                'asc'
            )
            .then((res) => setProducts(res.data.products))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [category, sortBy, page])

    const handleCategoryChange = (newCategory: string) => {
        setSearchParams({ category: newCategory, sortBy, page: '1' })
    }

    const handleSortChange = (newSort: string) => {
        setSearchParams({ category, sortBy: newSort, page: '1' })
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Collection</h1>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-48">
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
                            <div className="space-y-2">
                                {['all', 'shoes', 'apparel', 'accessories'].map((cat) => (
                                    <label key={cat} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={category === cat}
                                            onChange={() => handleCategoryChange(cat)}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Sort By</h3>
                            <div className="space-y-2">
                                {[
                                    { value: 'newest', label: 'Newest' },
                                    { value: 'price', label: 'Price: Low to High' },
                                    { value: 'rating', label: 'Top Rated' },
                                ].map((sort) => (
                                    <label key={sort.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value={sort.value}
                                            checked={sortBy === sort.value}
                                            onChange={() => handleSortChange(sort.value)}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {sort.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading products...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No products found</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
