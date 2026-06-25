"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems, toggleDrawer } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById("hero-section");
      const heroHeight = heroElement ? heroElement.offsetHeight : window.innerHeight;
      
      // If we scroll past the hero height (minus navbar height), trigger the solid state
      if (window.scrollY > heroHeight - 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check immediately in case page loads already scrolled down
    handleScroll();

    // Check user's authentication status on mount
    const checkAuthStatus = () => {
      const hasToken = document.cookie.includes('access_token=') || document.cookie.includes('session_active=true');
      setIsLoggedIn(hasToken);
    };
    checkAuthStatus();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const endpoint = process.env.NEXT_PUBLIC_LOGOUT || "/api/v1/auth/logout";
      
      await fetch(`${baseUrl}${endpoint}`, { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear the authentication cookies
      document.cookie = "session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsLoggedIn(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 h-20 transition-all duration-300 ${isScrolled ? "bg-white shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="w-1/3 flex items-center">
          <Link href="/" className="text-3xl font-bold italic text-[color:var(--color-primary)] font-[family-name:var(--font-playfair)]">
            Lens.ke
          </Link>
        </div>

        {/* Center: Search Bar (Fades in) */}
        <div className="flex-1 flex justify-center">
          <form 
            className={`w-full max-w-md transition-all duration-300 ease-in-out ${
              isScrolled ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full leading-5 bg-white/90 placeholder-gray-400 focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)] sm:text-sm shadow-sm transition-shadow"
                placeholder="Search images..."
              />
            </div>
          </form>
        </div>

        {/* Right: Explore + Log In + Cart */}
        <div className="w-1/3 flex items-center justify-end space-x-6 md:space-x-8">
          
          {/* Explore Dropdown */}
          <div className="relative group">
            <button className="flex items-center text-[color:var(--color-text)] font-medium hover:text-[color:var(--color-primary)] transition-colors py-2">
              Explore
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 overflow-hidden flex flex-col py-2">
                <Link href="/search?category=wildlife" className="px-4 py-2 text-sm text-[color:var(--color-text)] hover:bg-gray-50 hover:text-[color:var(--color-primary)] transition-colors">Wildlife & Savannah</Link>
                <Link href="/search?category=coastal" className="px-4 py-2 text-sm text-[color:var(--color-text)] hover:bg-gray-50 hover:text-[color:var(--color-primary)] transition-colors">Coastal & Beaches</Link>
                <Link href="/search?category=city" className="px-4 py-2 text-sm text-[color:var(--color-text)] hover:bg-gray-50 hover:text-[color:var(--color-primary)] transition-colors">City & Urban</Link>
                <Link href="/search?category=culture" className="px-4 py-2 text-sm text-[color:var(--color-text)] hover:bg-gray-50 hover:text-[color:var(--color-primary)] transition-colors">Culture & Heritage</Link>
                <div className="h-px bg-gray-200/50 my-1"></div>
                <Link href="/search" className="px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] hover:bg-gray-50 transition-colors">View All Categories &rarr;</Link>
              </div>
            </div>
          </div>

          {isLoggedIn ? (
            <button onClick={handleLogout} className="text-[color:var(--color-text)] font-medium hover:text-[color:var(--color-primary)] transition-colors">
              Log Out
            </button>
          ) : (
            <Link href="/auth" className="text-[color:var(--color-text)] font-medium hover:text-[color:var(--color-primary)] transition-colors">
              Log In
            </Link>
          )}
          
          <button 
            onClick={toggleDrawer}
            className="relative p-2 text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors"
            aria-label="Cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            
            {/* Cart Badge */}
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[color:var(--color-primary)] rounded-full animate-pop">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}
