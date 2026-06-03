import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Product, productsAPI } from '../api/endpoints'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const [filtersOpen, setFiltersOpen] = useState(false)

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
        setFiltersOpen(false)
    }

    const handleSortChange = (newSort: string) => {
        setSearchParams({ category, sortBy: newSort, page: '1' })
        setFiltersOpen(false)
    }

    const hasActiveFilters = category !== 'all' || sortBy !== 'newest'

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Collection</h1>
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-gray-900 rounded-full" />
                        )}
                    </button>
                </div>

                <div className="flex gap-6 lg:gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block lg:w-48 flex-shrink-0`}>
                        <div className="bg-gray-50 rounded-lg p-4 lg:bg-transparent lg:p-0">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
                            <div className="space-y-2">
                                {['all', 'electronics', 'jewelry', 'mens', 'womens'].map((cat) => (
                                    <label key={cat} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={category === cat}
                                            onChange={() => handleCategoryChange(cat)}
                                            className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-4">Sort By</h3>
                            <div className="space-y-2">
                                {[
                                    { value: 'newest', label: 'Newest' },
                                    { value: 'price', label: 'Price: Low to High' },
                                    { value: 'rating', label: 'Top Rated' },
                                ].map((sort) => (
                                    <label key={sort.value} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value={sort.value}
                                            checked={sortBy === sort.value}
                                            onChange={() => handleSortChange(sort.value)}
                                            className="w-4 h-4 text-gray-900 focus:ring-gray-900"
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
                    <main className="flex-1 min-w-0">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading products...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
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
