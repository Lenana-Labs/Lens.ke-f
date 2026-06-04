"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, removeFromCart, totalPrice } = useCart();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] max-w-[100vw] bg-white z-50 shadow-[-4px_0_24px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[color:var(--color-text)]">Your Cart</h2>
          <button 
            onClick={closeDrawer}
            className="p-2 text-gray-400 hover:text-[color:var(--color-text)] transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Start browsing our collection to add images.</p>
              </div>
              <button 
                onClick={closeDrawer}
                className="mt-4 px-6 py-2 bg-gray-100 text-[color:var(--color-text)] rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                Browse Images
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 group">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm text-[color:var(--color-text)] truncate pr-2" title={item.alt}>{item.alt}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <select className="text-xs bg-gray-50 border border-gray-200 rounded p-1 text-[color:var(--color-text)] focus:outline-none focus:border-[color:var(--color-primary)] cursor-pointer">
                          <option value="personal">Personal License</option>
                          <option value="commercial" defaultValue="commercial">Commercial License</option>
                        </select>
                      </div>
                    </div>
                    <div className="font-bold text-[color:var(--color-text)]">
                      ${item.price}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-[color:var(--color-text)]">Subtotal</span>
              <span className="text-xl font-bold text-[color:var(--color-text)]">${totalPrice}</span>
            </div>
            <button className="w-full py-4 bg-[color:var(--color-primary)] text-white rounded-xl font-bold hover:bg-[#1c5d3f] transition-colors shadow-lg shadow-green-900/20">
              Checkout & Download
            </button>
          </div>
        )}
      </div>
    </>
  );
}
