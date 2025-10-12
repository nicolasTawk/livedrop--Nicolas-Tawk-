import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Catalog from './pages/catalog'
import Product from './pages/product'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import OrderStatus from './pages/order-status'
import CartDrawer from './components/organisms/cart-drawer'
import SupportPanel from './components/organisms/support-panel'
import AnimatedCartButton from './components/atoms/animated-cart-button'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" width={28} height={28} />
          <h1 className="font-semibold">Storefront</h1>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Open Support" onClick={() => setSupportOpen(true)} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black">Ask Support</button>
            <AnimatedCartButton
              aria-label="Open Cart"
              onClick={() => setCartOpen(true)}
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors duration-200"
            >
              Cart
            </AnimatedCartButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/p/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderStatus />} />
        </Routes>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SupportPanel open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  )
}
