import React, { useEffect, useState } from 'react'
import { useCart } from '../../lib/store'

interface AnimatedCartButtonProps {
    onClick: () => void
    className?: string
}

export default function AnimatedCartButton({ onClick, className = '' }: AnimatedCartButtonProps) {
    const [isBouncing, setIsBouncing] = useState(false)
    const cartItems = useCart(s => s.items)
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)

    useEffect(() => {
        if (cartCount > 0) {
            setIsBouncing(true)
            const timer = setTimeout(() => setIsBouncing(false), 300)
            return () => clearTimeout(timer)
        }
    }, [cartCount])

    return (
        <button
            onClick={onClick}
            className={`relative ${className} ${isBouncing ? 'animate-bounce' : ''} transition-all duration-200`}
            aria-label="Shopping Cart"
        >
            {/* Shopping Cart Icon */}
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
            </svg>

            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                </span>
            )}
        </button>
    )
}
