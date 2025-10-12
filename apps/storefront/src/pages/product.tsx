import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, listProducts } from '../lib/api'
import { useCart } from '../lib/store'
import { fmtCurrency } from '../lib/format'

export default function ProductPage() {
  const { id } = useParams()
  const p = id ? getProduct(id) : undefined
  const add = useCart(s=>s.add)

  if (!p) return <div className="p-6">Not found.</div>

  const related = listProducts().filter(x=> x.id!==p.id && x.tags.some(t=> p.tags.includes(t))).slice(0,3)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
      <img className="w-full rounded-2xl border object-cover" src={p.image} alt={p.title} loading="lazy" />
      <div>
        <h2 className="text-2xl font-semibold">{p.title}</h2>
        <div className="text-lg mt-2">{fmtCurrency(p.price)}</div>
        <div className="mt-2 text-sm text-gray-600">{p.description || 'A fantastic product carefully crafted.'}</div>
        <div className="mt-2 text-sm">{p.stockQty>0? <span className="text-emerald-600">In stock</span>: <span className="text-rose-600">Out of stock</span>}</div>
        <div className="mt-4">
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-white" onClick={()=>add({id:p.id,title:p.title,price:p.price,image:p.image},1)}>Add to Cart</button>
        </div>
      </div>

      <div className="md:col-span-2 mt-8">
        <h3 className="font-medium mb-3">Related</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {related.map(r=> (
            <Link key={r.id} to={`/p/${r.id}`} className="block border rounded-xl p-3 hover:shadow">
              <img className="w-full aspect-video object-cover rounded-lg" src={r.image} alt={r.title} loading="lazy" />
              <div className="mt-2 text-sm">{r.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
