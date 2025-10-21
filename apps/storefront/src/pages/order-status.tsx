import React from 'react'
import { useParams } from 'react-router-dom'
import OrderTracking from '../components/OrderTracking'

export default function OrderStatusPage() {
  const { id } = useParams()

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3">Order Status</h2>
          <p className="text-gray-600">Missing order ID.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-3">Order Status</h2>
      <div className="text-sm text-gray-600 mb-4">
        Order ID: •••{id.slice(-4)}
      </div>
      <OrderTracking orderId={id} />
    </div>
  )
}
