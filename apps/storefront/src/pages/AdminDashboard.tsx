import React, { useEffect, useState } from 'react'
import { API_BASE } from '../lib/api'

export default function AdminDashboard() {
    const [business, setBusiness] = useState<any>(null)
    const [performance, setPerformance] = useState<any>(null)
    const [assistant, setAssistant] = useState<any>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                setError('')
                const [b, p, a] = await Promise.all([
                    fetch(`${API_BASE}/api/dashboard/business-metrics`).then(r => r.json()),
                    fetch(`${API_BASE}/api/dashboard/performance`).then(r => r.json()),
                    fetch(`${API_BASE}/api/dashboard/assistant-stats`).then(r => r.json())
                ])
                setBusiness(b); setPerformance(p); setAssistant(a)
            } catch (e) {
                setError('Failed to load dashboard')
            }
        }
        load()
        const t = setInterval(load, 10000)
        return () => clearInterval(t)
    }, [])

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <section className="border rounded-xl p-4">
                    <h2 className="font-medium mb-2">Business Metrics</h2>
                    {business ? (
                        <ul className="text-sm space-y-1">
                            <li>Total Revenue: ${'{'}business.totalRevenue?.toFixed?.(2) || business.totalRevenue{'}'}</li>
                            <li>Total Orders: {business.totalOrders}</li>
                            <li>Avg Order Value: ${'{'}business.averageOrderValue?.toFixed?.(2) || business.averageOrderValue{'}'}</li>
                        </ul>
                    ) : <div className="text-sm text-gray-500">Loading…</div>}
                </section>
                <section className="border rounded-xl p-4">
                    <h2 className="font-medium mb-2">Performance</h2>
                    {performance ? (
                        <ul className="text-sm space-y-1">
                            <li>SSE Connections: {performance.sseConnections}</li>
                            <li>Uptime (s): {Math.round(performance.uptime)}</li>
                            <li>Last Update: {performance.lastUpdate}</li>
                        </ul>
                    ) : <div className="text-sm text-gray-500">Loading…</div>}
                </section>
                <section className="border rounded-xl p-4">
                    <h2 className="font-medium mb-2">Assistant Analytics</h2>
                    {assistant ? (
                        <ul className="text-sm space-y-1">
                            <li>Total Queries: {assistant.totalQueries}</li>
                            <li>Avg Response Time: {assistant.averageResponseTime} ms</li>
                        </ul>
                    ) : <div className="text-sm text-gray-500">Loading…</div>}
                </section>
            </div>
        </div>
    )
}


