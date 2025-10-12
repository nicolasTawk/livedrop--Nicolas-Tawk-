import React from 'react'
import { useCart, cartTotal } from '../lib/store'
import { fmtCurrency } from '../lib/format'
import { Link } from 'react-router-dom'

export default function CartPage() {
  const items = useCart(s=>s.items)
  const setQty = useCart(s=>s.setQty)
  const remove = useCart(s=>s.remove)
  const total = cartTotal(items)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      {items.length===0? <div>Cart is empty.</div> : (
        <div className="space-y-3">
          {items.map(i=> (
            <div key={i.id} className="flex items-center gap-3 border rounded-xl p-3">
              <img src={i.image} alt={i.title} className="w-20 h-14 object-cover rounded-lg" loading="lazy" />
              <div className="flex-1">
                <div className="font-medium">{i.title}</div>
                <div className="text-sm text-gray-600">{fmtCurrency(i.price)}</div>
              </div>
              <div className="flex items-center gap-2" role="group" aria-label="Quantity">
                <button aria-label="Decrease quantity" className="px-2 py-1 border rounded" onClick={()=>setQty(i.id, i.qty-1)}>-</button>
                <div aria-live="polite" className="px-2">{i.qty}</div>
                <button aria-label="Increase quantity" className="px-2 py-1 border rounded" onClick={()=>setQty(i.id, i.qty+1)}>+</button>
              </div>
              <button aria-label={`Remove ${i.title}`} className="px-2 py-1 border rounded" onClick={()=>remove(i.id)}>Remove</button>
            </div>
          ))}
          <div className="flex justify-end items-center gap-4 text-lg">
            <div>Total: <span className="font-semibold">{fmtCurrency(total)}</span></div>
            <Link to="/checkout" className="px-4 py-2 rounded-lg bg-gray-900 text-white">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  )
}
