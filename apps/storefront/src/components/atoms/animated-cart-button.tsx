import React, { useEffect, useState } from 'react'
import { useCart } from '../../lib/store'

interface AnimatedCartButtonProps {
    onClick: () => void
    className?: string
    children: React.ReactNode
}

export default function AnimatedCartButton({ onClick, className = '', children }: AnimatedCartButtonProps) {
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
        >
            {children}
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                </span>
            )}
        </button>
    )
}
