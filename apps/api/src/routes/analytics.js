const express = require('express');
const { Order } = require('../db');
const router = express.Router();

// GET /api/analytics/daily-revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/daily-revenue', async (req, res) => {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ error: 'From and to dates are required' });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // MongoDB aggregation for daily revenue
        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    revenue: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    date: '$_id',
                    revenue: 1,
                    orderCount: 1,
                    _id: 0
                }
            }
        ]);

        res.json(dailyRevenue);
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/analytics/dashboard-metrics
router.get('/dashboard-metrics', async (req, res) => {
    try {
        // Get total revenue
        const totalRevenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$total' }
                }
            }
        ]);

        // Get orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent orders (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentOrders = await Order.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const metrics = {
            totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
            totalOrders: totalRevenueResult[0]?.totalOrders || 0,
            averageOrderValue: totalRevenueResult[0]?.averageOrderValue || 0,
            recentOrders,
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
