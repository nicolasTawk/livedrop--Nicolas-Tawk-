export interface OrderStatusUpdate {
    orderId: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    timestamp: string;
}

export class SSEOrderTracker {
    private eventSource: EventSource | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    constructor(
        private orderId: string,
        private onUpdate: (update: OrderStatusUpdate) => void,
        private onError?: (error: Event) => void,
        private onComplete?: () => void
    ) { }

    connect(apiBaseUrl: string = 'http://localhost:3000') {
        if (this.eventSource) {
            this.disconnect();
        }

        const url = `${apiBaseUrl}/api/orders/${this.orderId}/stream`;
        console.log('🔗 Connecting to SSE:', url);

        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const update: OrderStatusUpdate = JSON.parse(event.data);
                console.log('📦 Order status update:', update);
                this.onUpdate(update);

                // Close connection when order is delivered
                if (update.status === 'DELIVERED') {
                    setTimeout(() => {
                        this.disconnect();
                        this.onComplete?.();
                    }, 2000);
                }
            } catch (error) {
                console.error('❌ Error parsing SSE message:', error);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('❌ SSE connection error:', error);
            this.onError?.(error);
            this.handleReconnect(apiBaseUrl);
        };

        this.eventSource.onopen = () => {
            console.log('✅ SSE connection opened');
            this.reconnectAttempts = 0;
        };
    }

    private handleReconnect(apiBaseUrl: string) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.disconnect();
            this.connect(apiBaseUrl);
        }, delay);
    }

    disconnect() {
        if (this.eventSource) {
            console.log('🔌 Disconnecting SSE');
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN;
    }
}

// Hook for React components
import React from 'react';

export function useOrderTracking(orderId: string | null) {
    const [status, setStatus] = React.useState<OrderStatusUpdate | null>(null);
    const [isConnected, setIsConnected] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const trackerRef = React.useRef<SSEOrderTracker | null>(null);

    React.useEffect(() => {
        if (!orderId) return;

        const tracker = new SSEOrderTracker(
            orderId,
            (update) => {
                setStatus(update);
                setIsConnected(true);
                setError(null);
            },
            (error) => {
                console.error('SSE error:', error);
                setError('Connection lost. Attempting to reconnect...');
                setIsConnected(false);
            },
            () => {
                console.log('Order tracking completed');
                setIsConnected(false);
            }
        );

        trackerRef.current = tracker;
        tracker.connect();

        return () => {
            tracker.disconnect();
        };
    }, [orderId]);

    return {
        status,
        isConnected,
        error,
        disconnect: () => trackerRef.current?.disconnect()
    };
}
