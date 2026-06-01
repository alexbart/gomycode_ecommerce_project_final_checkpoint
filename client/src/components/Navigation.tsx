import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
    const { isAuthenticated, user, logout } = useAuth()

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-gray-900">
                        EcoMart
                    </Link>

                    {/* Center - Search */}
                    <div className="hidden md:flex flex-1 mx-8">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    {/* Right side - Links */}
                    <div className="flex items-center gap-6">
                        <Link to="/wishlist" className="text-gray-600 hover:text-gray-900">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </Link>

                        <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/account" className="text-gray-600 hover:text-gray-900">
                                    {user?.firstName}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
