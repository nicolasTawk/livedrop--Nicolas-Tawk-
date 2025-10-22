import React, { useMemo, useState, useEffect } from 'react'
import { listProducts } from '../lib/api'
import ProductGrid from '../components/organisms/product-grid'

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

export default function CatalogPage() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState<'name' | 'price_asc' | 'price_desc'>('name')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [q, tag, sort])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await listProducts(q, tag, sort, 1, 50)
      setProducts(result.products)
    } catch (err) {
      setError('Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const allTags = useMemo(() => {
    const s = new Set<string>()
    products.forEach(p => p.tags.forEach(t => s.add(t)))
    return Array.from(s).sort()
  }, [products])

  const filtered = useMemo(() => {
    let out = products
    if (q) {
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
      out = out.filter(p => tokens.every(t => p.name.toLowerCase().includes(t) || p.tags.some(x => x.toLowerCase().includes(t))))
    }
    if (tag) out = out.filter(p => p.tags.includes(tag))
    return out
  }, [products, q, tag])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-8">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-2 items-end mb-4">
        <label className="flex-1 text-sm">Search
          <input aria-label="Search" className="mt-1 w-full border rounded-lg px-3 py-2" value={q} onChange={e => setQ(e.target.value)} placeholder="Search products" />
        </label>
        <label className="text-sm">Tag
          <select aria-label="Filter by tag" className="mt-1 border rounded-lg px-3 py-2" value={tag} onChange={e => setTag(e.target.value)}>
            <option value="">All</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-sm">Sort
          <select aria-label="Sort by price" className="mt-1 border rounded-lg px-3 py-2" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="name">Name</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </label>
      </div>
      <ProductGrid products={filtered.map(p => ({
        id: p._id,
        title: p.name,
        price: p.price,
        image: p.imageUrl || '/logo.svg'
      }))} />
    </div>
  )
}
