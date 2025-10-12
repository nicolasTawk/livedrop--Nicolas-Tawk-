import React, { useMemo, useState } from 'react'
import { listProducts } from '../lib/api'
import ProductGrid from '../components/organisms/product-grid'

export default function CatalogPage() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState<'asc'|'desc'|''>('')
  const products = listProducts()

  const allTags = useMemo(()=> {
    const s = new Set<string>()
    products.forEach(p=> p.tags.forEach(t=> s.add(t)))
    return Array.from(s).sort()
  }, [products])

  const filtered = useMemo(()=>{
    let out = products
    if (q) {
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
      out = out.filter(p=> tokens.every(t=> p.title.toLowerCase().includes(t) || p.tags.some(x=>x.toLowerCase().includes(t))))
    }
    if (tag) out = out.filter(p=> p.tags.includes(tag))
    if (sort==='asc') out = out.slice().sort((a,b)=> a.price-b.price)
    if (sort==='desc') out = out.slice().sort((a,b)=> b.price-a.price)
    return out
  }, [products,q,tag,sort])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-2 items-end mb-4">
        <label className="flex-1 text-sm">Search
          <input aria-label="Search" className="mt-1 w-full border rounded-lg px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products" />
        </label>
        <label className="text-sm">Tag
          <select aria-label="Filter by tag" className="mt-1 border rounded-lg px-3 py-2" value={tag} onChange={e=>setTag(e.target.value)}>
            <option value="">All</option>
            {allTags.map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-sm">Sort
          <select aria-label="Sort by price" className="mt-1 border rounded-lg px-3 py-2" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option value="">None</option>
            <option value="asc">Price ↑</option>
            <option value="desc">Price ↓</option>
          </select>
        </label>
      </div>
      <ProductGrid products={filtered} />
    </div>
  )
}
