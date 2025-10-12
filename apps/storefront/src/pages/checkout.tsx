import React from 'react'
import { useCart, cartTotal } from '../lib/store'
import { fmtCurrency } from '../lib/format'
import { placeOrder } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function CheckoutPage() {
  const items = useCart(s=>s.items)
  const clear = useCart(s=>s.clear)
  const total = cartTotal(items)
  const nav = useNavigate()

  function handlePlace() {
    const minimal = items.map(i=> ({id: i.id, qty: i.qty}))
    const { orderId } = placeOrder(minimal)
    clear()
    nav(`/order/${orderId}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Checkout (stub)</h2>
      <div className="border rounded-xl p-4 space-y-2">
        {items.map(i=> (
          <div key={i.id} className="flex justify-between">
            <div>{i.title} × {i.qty}</div>
            <div>{fmtCurrency(i.price*i.qty)}</div>
          </div>
        ))}
        <hr/>
        <div className="flex justify-between font-medium">
          <div>Total</div><div>{fmtCurrency(total)}</div>
        </div>
      </div>
      <button className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={handlePlace}>Place order</button>
    </div>
  )
}
