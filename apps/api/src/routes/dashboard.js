const express = require('express');
const { Order } = require('../db');
const { activeConnections } = require('../sse/order-status');
const router = express.Router();

// GET /api/dashboard/business-metrics
router.get('/business-metrics', async (req, res) => {
    try {
        const metrics = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$total' }
                }
            }
        ]);

        const result = metrics[0] || {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching business metrics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/dashboard/performance
router.get('/performance', async (req, res) => {
    try {
        const performance = {
            sseConnections: activeConnections.size,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            // You can add more performance metrics here
            apiLatency: 'N/A', // Would need to implement request timing middleware
            lastUpdate: new Date().toISOString()
        };

        res.json(performance);
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/dashboard/assistant-stats
router.get('/assistant-stats', async (req, res) => {
    try {
        // This would typically come from your assistant analytics
        // For now, return mock data - you'll implement real tracking later
        const assistantStats = {
            totalQueries: 0,
            intentDistribution: {
                policy_question: 0,
                order_status: 0,
                product_search: 0,
                complaint: 0,
                chitchat: 0,
                off_topic: 0,
                violation: 0
            },
            functionCalls: {
                getOrderStatus: 0,
                searchProducts: 0,
                getCustomerOrders: 0
            },
            averageResponseTime: 0,
            lastUpdate: new Date().toISOString()
        };

        res.json(assistantStats);
    } catch (error) {
        console.error('Error fetching assistant stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
