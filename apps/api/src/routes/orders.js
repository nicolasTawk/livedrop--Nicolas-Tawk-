const express = require('express');
const { Order, Product, Customer } = require('../db');
const { handleOrderStatusStream } = require('../sse/order-status');
const router = express.Router();

// POST /api/orders
router.post('/', async (req, res) => {
    try {
        const { customerId, items } = req.body;

        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Customer ID and items are required' });
        }

        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Verify products and calculate total
        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });

            // Update stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create order
        const order = new Order({
            customerId,
            items: orderItems,
            total,
            status: 'PENDING'
        });

        await order.save();

        // Populate customer info for response
        await order.populate('customerId', 'name email');

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/orders?customerId=:customerId
router.get('/', async (req, res) => {
    try {
        const { customerId } = req.query;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const orders = await Order.find({ customerId })
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/orders/:id/status (for updating order status)
router.put('/:id/status', async (req, res) => {
    try {
        const { status, carrier, trackingNumber, estimatedDelivery } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        if (carrier) order.carrier = carrier;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
        order.updatedAt = new Date();

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/orders/:id/stream (SSE endpoint)
router.get('/:id/stream', handleOrderStatusStream);

module.exports = router;
