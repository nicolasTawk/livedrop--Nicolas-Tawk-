import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtCurrency } from '../../lib/format'
import { useCart } from '../../lib/store'
import CartAnimation from '../atoms/cart-animation'

type P = { id: string; title: string; price: number; image: string }
export default function ProductCard({ id, title, price, image }: P) {
  const add = useCart(s => s.add)
  const [animateTrigger, setAnimateTrigger] = useState(0)

  const handleAddToCart = () => {
    add({ id, title, price, image })
    setAnimateTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="border rounded-2xl p-3 flex flex-col">
        <Link to={`/p/${id}`} className="block">
          <img className="w-full aspect-video object-cover rounded-xl" src={image} alt={title} loading="lazy" />
          <div className="mt-2 font-medium">{title}</div>
          <div className="text-sm text-gray-600">{fmtCurrency(price)}</div>
        </Link>
        <button
          onClick={handleAddToCart}
          className="mt-3 px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors duration-200"
        >
          Add to Cart
        </button>
      </div>
      <CartAnimation
        trigger={animateTrigger > 0}
        productImage={image}
        onComplete={() => setAnimateTrigger(0)}
      />
    </>
  )
}
