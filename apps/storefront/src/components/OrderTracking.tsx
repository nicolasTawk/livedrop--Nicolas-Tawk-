import React from 'react';
import { useOrderTracking } from '../lib/sse-client';

interface OrderTrackingProps {
    orderId: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
    const { status, isConnected, error } = useOrderTracking(orderId);

    if (!status) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading order status...</p>
            </div>
        );
    }

    const statusConfig = {
        PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending' },
        PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: '🔄', label: 'Processing' },
        SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: '📦', label: 'Shipped' },
        DELIVERED: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Delivered' }
    };

    const currentStatus = statusConfig[status.status];

    return (
        <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Live tracking active' : 'Connection lost'}
                </span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Order Status */}
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Order Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                        {currentStatus.icon} {currentStatus.label}
                    </span>
                </div>

                {status.carrier && status.trackingNumber && (
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="font-medium">Carrier:</span> {status.carrier}
                        </div>
                        <div>
                            <span className="font-medium">Tracking:</span> {status.trackingNumber}
                        </div>
                    </div>
                )}

                {status.estimatedDelivery && (
                    <div className="mt-3 text-sm">
                        <span className="font-medium">Estimated Delivery:</span>{' '}
                        {new Date(status.estimatedDelivery).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* Status Timeline */}
            <div className="space-y-2">
                <h4 className="font-medium text-sm">Order Progress</h4>
                <div className="space-y-1">
                    {Object.entries(statusConfig).map(([key, config]) => {
                        const isActive = status.status === key;
                        const isCompleted = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(status.status) >=
                            ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(key);

                        return (
                            <div key={key} className="flex items-center gap-3 text-sm">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {isCompleted ? '✓' : config.icon}
                                </div>
                                <span className={isActive ? 'font-medium' : ''}>
                                    {config.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
