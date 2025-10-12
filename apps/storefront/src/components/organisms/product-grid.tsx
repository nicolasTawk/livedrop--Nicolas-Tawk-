import React from 'react'
import ProductCard from '../molecules/product-card'

type Item = { id:string; title:string; price:number; image:string }
export default function ProductGrid({ products }: {products: Item[]}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p=> <ProductCard key={p.id} {...p} />)}
    </div>
  )
}
