import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, listProducts } from '../lib/api'
import { useCart } from '../lib/store'
import { fmtCurrency } from '../lib/format'

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  tags: string[];
  stock: number;
  description?: string;
  category?: string;
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const add = useCart(s => s.add)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError('')
      const p = await getProduct(id!)
      setProduct(p)

      // Load related products
      const relatedResult = await listProducts('', '', 'name', 1, 20)
      const relatedProducts = relatedResult.products
        .filter(x => x._id !== p._id && x.tags.some(t => p.tags.includes(t)))
        .slice(0, 3)
      setRelated(relatedProducts)
    } catch (err) {
      setError('Product not found')
      console.error('Error loading product:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error || !product) {
    return <div className="p-6">Product not found.</div>
  }

  const p = product

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
      <img className="w-full rounded-2xl border object-cover" src={p.imageUrl || '/logo.svg'} alt={p.name} loading="lazy" />
      <div>
        <h2 className="text-2xl font-semibold">{p.name}</h2>
        <div className="text-lg mt-2">{fmtCurrency(p.price)}</div>
        <div className="mt-2 text-sm text-gray-600">{p.description || 'A fantastic product carefully crafted.'}</div>
        <div className="mt-2 text-sm">{p.stock > 0 ? <span className="text-emerald-600">In stock</span> : <span className="text-rose-600">Out of stock</span>}</div>
        <div className="mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50"
            onClick={() => add({ id: p._id, title: p.name, price: p.price, image: p.imageUrl || '/logo.svg' }, 1)}
            disabled={p.stock === 0}
          >
            {p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <div className="md:col-span-2 mt-8">
        <h3 className="font-medium mb-3">Related</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {related.map(r => (
            <Link key={r._id} to={`/p/${r._id}`} className="block border rounded-xl p-3 hover:shadow">
              <img className="w-full aspect-video object-cover rounded-lg" src={r.imageUrl || '/logo.svg'} alt={r.name} loading="lazy" />
              <div className="mt-2 text-sm">{r.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
