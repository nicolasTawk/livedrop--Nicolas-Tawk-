import React, { useEffect, useRef } from 'react'
import { useCart, cartTotal } from '../../lib/store'
import { fmtCurrency } from '../../lib/format'
import { Link } from 'react-router-dom'

export default function CartDrawer({open, onClose}:{open:boolean; onClose:()=>void}){
  const items = useCart(s=>s.items)
  const setQty = useCart(s=>s.setQty)
  const remove = useCart(s=>s.remove)
  const total = cartTotal(items)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if (!open) return
    const trap = (e: KeyboardEvent)=> {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', trap)
    const first = ref.current?.querySelector('[tabindex]') as HTMLElement | null
    first?.focus()
    return ()=> document.removeEventListener('keydown', trap)
  }, [open, onClose])

  if (!open) return null
  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div ref={ref} className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-4 outline-none" tabIndex={0}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Cart</h3>
          <button onClick={onClose} aria-label="Close cart" className="px-2 py-1 border rounded">Close</button>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          {items.length===0? <div>Cart is empty.</div> : items.map(i=> (
            <div key={i.id} className="flex items-center gap-3 border rounded-xl p-3">
              <img src={i.image} alt={i.title} className="w-16 h-12 object-cover rounded-lg" loading="lazy" />
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
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-lg">Total: <span className="font-semibold">{fmtCurrency(total)}</span></div>
          <Link to="/checkout" className="px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={onClose}>Checkout</Link>
        </div>
      </div>
    </div>
  )
}
