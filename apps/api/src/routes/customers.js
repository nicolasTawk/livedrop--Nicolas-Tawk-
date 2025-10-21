const express = require('express');
const { Customer } = require('../db');
const router = express.Router();

// GET /api/customers?email=user@example.com
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email parameter is required' });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/customers (for creating new customers)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ error: 'Customer with this email already exists' });
        }

        const customer = new Customer({
            name,
            email,
            phone,
            address
        });

        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
