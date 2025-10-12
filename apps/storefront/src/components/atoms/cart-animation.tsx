import React, { useEffect, useState } from 'react'

interface CartAnimationProps {
    trigger: boolean
    productImage: string
    onComplete: () => void
}

export default function CartAnimation({ trigger, productImage, onComplete }: CartAnimationProps) {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (trigger) {
            setIsAnimating(true)
            const timer = setTimeout(() => {
                setIsAnimating(false)
                onComplete()
            }, 800) // Animation duration
            return () => clearTimeout(timer)
        }
    }, [trigger, onComplete])

    if (!isAnimating) return null

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-50">
                <div
                    className="absolute w-16 h-16 rounded-xl shadow-2xl border-4 border-white"
                    style={{
                        backgroundImage: `url(${productImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        animation: 'flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
                    }}
                />
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
          @keyframes flyToCart {
            0% {
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
              opacity: 1;
            }
            30% {
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
              opacity: 1;
            }
            70% {
              left: calc(100% - 100px);
              top: 30px;
              transform: translate(0, 0) scale(0.6) rotate(-5deg);
              opacity: 0.8;
            }
            100% {
              left: calc(100% - 80px);
              top: 20px;
              transform: translate(0, 0) scale(0.2) rotate(0deg);
              opacity: 0;
            }
          }
        `
            }} />
        </>
    )
}
