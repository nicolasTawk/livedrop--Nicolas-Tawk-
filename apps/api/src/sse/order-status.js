const { Order } = require('../db');

// Store active SSE connections
const activeConnections = new Map();

// Auto-progression intervals for each order
const orderIntervals = new Map();

function setupOrderStatusStream(req, res, orderId) {
    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Store connection
    activeConnections.set(orderId, res);

    // Send initial status
    sendStatusUpdate(res, orderId);

    // Auto-progression logic
    startAutoProgression(orderId);

    // Handle client disconnect
    req.on('close', () => {
        cleanupConnection(orderId);
    });
}

async function sendStatusUpdate(res, orderId) {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            res.write(`data: ${JSON.stringify({ error: 'Order not found' })}\n\n`);
            return;
        }

        const statusData = {
            orderId,
            status: order.status,
            carrier: order.carrier,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            timestamp: new Date().toISOString()
        };

        res.write(`data: ${JSON.stringify(statusData)}\n\n`);
    } catch (error) {
        console.error('Error sending status update:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to fetch order status' })}\n\n`);
    }
}

function startAutoProgression(orderId) {
    // Clear any existing interval
    if (orderIntervals.has(orderId)) {
        clearInterval(orderIntervals.get(orderId));
    }

    const interval = setInterval(async () => {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                clearInterval(interval);
                orderIntervals.delete(orderId);
                return;
            }

            let newStatus;
            let carrier = order.carrier;
            let estimatedDelivery = order.estimatedDelivery;

            // Auto-progress status
            switch (order.status) {
                case 'PENDING':
                    newStatus = 'PROCESSING';
                    break;
                case 'PROCESSING':
                    newStatus = 'SHIPPED';
                    carrier = carrier || 'FedEx';
                    order.trackingNumber = order.trackingNumber || `FX${Date.now()}`;
                    estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
                    break;
                case 'SHIPPED':
                    newStatus = 'DELIVERED';
                    break;
                case 'DELIVERED':
                    // Order is complete, stop progression
                    clearInterval(interval);
                    orderIntervals.delete(orderId);
                    return;
                default:
                    return;
            }

            // Update order in database
            order.status = newStatus;
            if (carrier) order.carrier = carrier;
            if (order.trackingNumber) order.trackingNumber = order.trackingNumber;
            if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
            order.updatedAt = new Date();
            await order.save();

            // Send update to client
            const res = activeConnections.get(orderId);
            if (res) {
                await sendStatusUpdate(res, orderId);

                // Close connection if delivered
                if (newStatus === 'DELIVERED') {
                    setTimeout(() => {
                        cleanupConnection(orderId);
                    }, 2000); // Give client time to process final update
                }
            }

        } catch (error) {
            console.error('Error in auto-progression:', error);
            clearInterval(interval);
            orderIntervals.delete(orderId);
        }
    }, 5000); // Progress every 5 seconds

    orderIntervals.set(orderId, interval);
}

function cleanupConnection(orderId) {
    const res = activeConnections.get(orderId);
    if (res) {
        res.end();
        activeConnections.delete(orderId);
    }

    const interval = orderIntervals.get(orderId);
    if (interval) {
        clearInterval(interval);
        orderIntervals.delete(orderId);
    }
}

// SSE endpoint handler
function handleOrderStatusStream(req, res) {
    const orderId = req.params.id;

    if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
    }

    setupOrderStatusStream(req, res, orderId);
}

module.exports = {
    handleOrderStatusStream,
    activeConnections,
    cleanupConnection
};
