import React from 'react'
import { useParams } from 'react-router-dom'
import { getOrderStatus } from '../lib/api'

export default function OrderStatusPage() {
  const { id } = useParams()
  if (!id) return <div className="p-6">Missing order id.</div>
  const status = getOrderStatus(id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-3">Order Status</h2>
      <div className="border rounded-xl p-4">
        <div><span className="font-medium">Order:</span> •••{id.slice(-4)}</div>
        <div><span className="font-medium">Status:</span> {status.status}</div>
        {status.carrier && <div><span className="font-medium">Carrier:</span> {status.carrier}</div>}
        {status.eta && <div><span className="font-medium">ETA:</span> {status.eta}</div>}
      </div>
    </div>
  )
}
