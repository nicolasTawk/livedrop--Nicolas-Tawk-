import React, { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/api'

type AnalyticsMetrics = {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    recentOrders: number
    ordersByStatus: Record<string, number>
}

type DailyPoint = { date: string; revenue: number; orderCount: number }

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
    const [daily, setDaily] = useState<DailyPoint[]>([])
    const [performance, setPerformance] = useState<any>(null)
    const [assistant, setAssistant] = useState<any>(null)
    const [error, setError] = useState('')

    const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0)

    const { fromStr, toStr } = useMemo(() => {
        const to = new Date()
        const from = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
        const iso = (d: Date) => d.toISOString().slice(0, 10)
        return { fromStr: iso(from), toStr: iso(to) }
    }, [])

    useEffect(() => {
        const load = async () => {
            try {
                setError('')
                const [m, p, a, d] = await Promise.all([
                    fetch(`${API_BASE}/api/analytics/dashboard-metrics`).then(r => r.json()),
                    fetch(`${API_BASE}/api/dashboard/performance`).then(r => r.json()),
                    fetch(`${API_BASE}/api/dashboard/assistant-stats`).then(r => r.json()),
                    fetch(`${API_BASE}/api/analytics/daily-revenue?from=${fromStr}&to=${toStr}`).then(r => r.json())
                ])
                setMetrics(m); setPerformance(p); setAssistant(a); setDaily(d)
            } catch (e) {
                setError('Failed to load dashboard')
            }
        }
        load()
        const t = setInterval(load, 10000)
        return () => clearInterval(t)
    }, [fromStr, toStr])

    const RevenueChart = ({ data }: { data: DailyPoint[] }) => {
        const w = 520, h = 140, pad = 20
        const vals = data.map(d => d.revenue)
        const max = Math.max(1, ...vals)
        const pts = data.map((d, i) => {
            const x = pad + (i * (w - 2 * pad)) / Math.max(1, data.length - 1)
            const y = h - pad - (d.revenue / max) * (h - 2 * pad)
            return `${x},${y}`
        }).join(' ')
        return (
            <svg width={w} height={h} className="w-full">
                <polyline fill="none" stroke="#111827" strokeWidth="2" points={pts} />
                <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
            </svg>
        )
    }

    const StatusBars = ({ counts }: { counts: Record<string, number> }) => {
        const entries = Object.entries(counts)
        const w = 520, h = 160, pad = 20
        const max = Math.max(1, ...entries.map(([, v]) => v))
        const bw = (w - 2 * pad) / Math.max(1, entries.length)
        return (
            <svg width={w} height={h} className="w-full">
                {entries.map(([k, v], i) => {
                    const x = pad + i * bw
                    const barH = (v / max) * (h - 2 * pad)
                    const y = h - pad - barH
                    return (
                        <g key={k}>
                            <rect x={x + 6} y={y} width={bw - 12} height={barH} fill="#111827" rx={4} />
                            <text x={x + bw / 2} y={h - pad + 12} textAnchor="middle" fontSize="10" fill="#6b7280">{k}</text>
                        </g>
                    )
                })}
            </svg>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-xl font-semibold mt-1">{metrics ? fmt(metrics.totalRevenue) : '—'}</div>
                </div>
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="text-xl font-semibold mt-1">{metrics ? metrics.totalOrders : '—'}</div>
                </div>
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-600">Avg Order Value</div>
                    <div className="text-xl font-semibold mt-1">{metrics ? fmt(metrics.averageOrderValue) : '—'}</div>
                </div>
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-600">Orders (7d)</div>
                    <div className="text-xl font-semibold mt-1">{metrics ? metrics.recentOrders : '—'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-medium">Revenue (Last 14 days)</h2>
                        <div className="text-sm text-gray-500">{fromStr} → {toStr}</div>
                    </div>
                    {daily.length ? (
                        <RevenueChart data={daily} />
                    ) : (
                        <div className="text-sm text-gray-500">Loading…</div>
                    )}
                </section>

                <section className="rounded-xl border p-4">
                    <h2 className="font-medium mb-2">Orders by Status</h2>
                    {metrics && Object.keys(metrics.ordersByStatus || {}).length ? (
                        <StatusBars counts={metrics.ordersByStatus} />
                    ) : (
                        <div className="text-sm text-gray-500">No data</div>
                    )}
                </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <section className="rounded-xl border p-4">
                    <h2 className="font-medium mb-2">Performance</h2>
                    {performance ? (
                        <ul className="text-sm space-y-1">
                            <li>SSE Connections: {performance.sseConnections}</li>
                            <li>Uptime (s): {Math.round(performance.uptime)}</li>
                            <li>Last Update: {performance.lastUpdate}</li>
                        </ul>
                    ) : <div className="text-sm text-gray-500">Loading…</div>}
                </section>

                <section className="rounded-xl border p-4">
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


