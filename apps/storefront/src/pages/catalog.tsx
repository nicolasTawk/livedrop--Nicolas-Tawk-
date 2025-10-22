import React, { useMemo, useState, useEffect, useRef } from 'react'
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
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Reset the list whenever filters change so we fetch from page 1 again
  useEffect(() => {
    // reset when filters change
    setProducts([])
    setPage(1)
    setHasMore(true)
    loadProducts(1, true)
  }, [q, tag, sort])

  // Paged loader; when reset is true we replace the list, otherwise we append
  const loadProducts = async (nextPage = page, reset = false) => {
    try {
      setLoading(true)
      setError('')
      const result = await listProducts(q, tag, sort, nextPage, 12)
      setProducts(prev => reset ? result.products : [...prev, ...result.products])
      setHasMore(nextPage < result.pagination.pages)
      setPage(nextPage)
    } catch (err) {
      setError('Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Infinite scroll: when the sentinel comes into view, fetch the next page
  useEffect(() => {
    if (!hasMore || loading) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && hasMore && !loading) {
          loadProducts(page + 1)
        }
      }
    }, { rootMargin: '200px 0px' })

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

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

  if (loading && products.length === 0) {
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
      {/* Controls: maximize search width; make controls compact on mobile */}
      <div className="flex flex-col md:flex-row gap-3 md:items-end mb-4">
        <label className="text-sm md:flex-1">Search
          <input
            aria-label="Search"
            className="mt-1 w-full border rounded-lg px-3 py-3 md:py-2 text-base md:text-sm"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search products"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:w-auto">
          <label className="text-sm">
            Tag
            <select
              aria-label="Filter by tag"
              className="mt-1 border rounded-lg px-2 py-2 text-sm"
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              <option value="">All</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Sort
            <select
              aria-label="Sort by price"
              className="mt-1 border rounded-lg px-2 py-2 text-sm"
              value={sort}
              onChange={e => setSort(e.target.value as any)}
            >
              <option value="name">Name</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </label>
        </div>
      </div>
      <ProductGrid products={filtered.map(p => ({
        id: p._id,
        title: p.name,
        price: p.price,
        image: p.imageUrl || '/logo.svg'
      }))} />

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-10" aria-hidden="true" />
      {!hasMore && (
        <div className="text-center text-sm text-gray-500 mb-6">No more products</div>
      )}
    </div>
  )
}
