import { Link, useNavigate } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./ui/navigation-menu";
import { useAuth } from "@/context/authContext";
import { useCart } from "@/context/cartContext";

interface HeaderProps {
    page: "login" | "signup" | "home" | "shop" | "products" | "product-details" | "search" | "vendor-home" | "contact" | "about" | "profile" | "cart" | "checkout" | "wishlist" | "upload-product" | "vendor-products";
    role?: "customer" | "vendor" | "admin";
}

export default function Header({ page }: HeaderProps) {
    const isAuthPage = page === "login" || page === "signup";
    const { user, logout } = useAuth();
    const { getCartItemCount } = useCart();
    const navigate = useNavigate();

    const currentUserRole = user?.role || "customer";

    const cartItemCount = getCartItemCount();

    const getPageDisplayName = (currentPage: string) => {
        const pageNames: { [key: string]: string } = {
            "login": "Login",
            "signup": "Sign Up",
            "home": "Home",
            "shop": "Shop",
            "products": "Products",
            "product-details": "Product Details",
            "search": "Search",
            "vendor-home": "Vendor Dashboard",
            "vendor-products": "Your Store",
            "contact": "Contact",
            "about": "About",
            "profile": "Profile",
            "cart": "Shopping Cart",
            "checkout": "Checkout",
            "wishlist": "Wishlist",
            "upload-product": "Upload Product"
        };
        return pageNames[currentPage] || currentPage;
    };

    return (
        <div className="w-full fixed top-0 bg-white shadow-sm z-50">
            <header className="w-full py-4 text-gray-800 flex items-center justify-between px-6 md:px-12">
                {/* Left side - Logo */}
                <div className="flex items-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link to="/" className="flex items-center">
                                    <span className="inline-flex items-center gap-2 text-2xl font-bold text-gray-800 hover:text-gray-900">
                                        {/*Shopping Cart Icon*/}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-9 md:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Cart Cloud
                                    </span>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Center - Navigation Links (Conditional based on role) */}
                {!isAuthPage && (
                    <>
                        {/* Navigation for Customer Role */}
                        {currentUserRole === "customer" && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                                <NavigationMenu>
                                    <NavigationMenuList className="flex space-x-8">
                                        <NavigationMenuItem>
                                            <Link
                                                to="/home"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "home"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                Home
                                            </Link>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <Link
                                                to="/products"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "products" || page === "shop"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                Shop
                                            </Link>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <Link
                                                to="/about"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "about"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                About
                                            </Link>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <Link
                                                to="/contact"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "contact"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                Contact
                                            </Link>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </div>
                        )}

                        {/* Navigation for Vendor Role */}
                        {currentUserRole === "vendor" && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                                <NavigationMenu>
                                    <NavigationMenuList className="flex space-x-8">
                                        <NavigationMenuItem>
                                            <Link
                                                to="/vendor-home"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "vendor-home"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                Dashboard
                                            </Link>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <Link
                                                to="/vendor-products"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "vendor-products"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                Your Store
                                            </Link>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <Link
                                                to="/about"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "about"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                About
                                            </Link>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <Link
                                                to="/contact"
                                                className={`text-gray-700 hover:text-gray-900 font-medium transition-colors pb-2 border-b-2 ${
                                                    page === "contact"
                                                        ? "text-gray-900 font-semibold border-gray-800"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                Contact
                                            </Link>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </div>
                        )}
                    </>
                )}

                {/* Right side - User actions (Conditional based on role and auth status) */}
                {!isAuthPage && (
                    <div className="flex items-center space-x-4">
                        {/* Icons for Customer Role */}
                        {currentUserRole === "customer" && (
                            <>
                                {/* Search Icon */}
                                <Link to="/search" aria-label="Search" className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </Link>

                                {/* Wishlist */}
                                <Link to="/wishlist" aria-label="Wishlist" className="p-1">
                                    {page === "wishlist" ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 hover:text-gray-900 cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21.8 4.5c-1.4-2.3-4.2-3.1-6.5-1.9L12 5.3 8.7 2.6c-2.3-1.2-5.1-.4-6.5 1.9-1.7 2.8-.5 6.4 2.7 8l7.1 5.5 7.1-5.5c3.2-1.6 4.4-5.2 2.7-8z"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                </Link>

                                {/* Cart */}
                                <Link to="/cart" aria-label="Cart" className="relative p-1">
                                    {page === "cart" || page === "checkout" ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 hover:text-gray-900 cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    )}
                                    {/* Cart item count badge */}
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {/* Icons for Vendor Role */}
                        {currentUserRole === "vendor" && (
                            <>
                                {/* Search Icon (can be common for both roles) */}
                                <Link to="/search" aria-label="Search" className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </Link>
                                {/* Upload Icon */}
                                <Link to="/upload-product" aria-label="Upload Product" className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0l-4 4m4-4v11" />
                                    </svg>
                                </Link>
                            </>
                        )}

                        {/* Profile and Logout (Common for logged-in users, regardless of role) */}
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/profile" aria-label="Profile" className="p-1">
                                    {page === "profile" ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 hover:text-gray-900 cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </Link>

                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                                    aria-label="Logout"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>

        </div>
    );
}
