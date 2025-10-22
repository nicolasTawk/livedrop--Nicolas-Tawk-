const express = require('express');
const { Product } = require('../db');
const router = express.Router();

// GET /api/products?search=&tag=&sort=&page=&limit=
router.get('/', async (req, res) => {
    try {
        const {
            search = '',
            tag = '',
            sort = 'name',
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        let query = {};

        if (search) {
            // Use text search when available for better relevance; falls back to normal sort below
            query.$text = { $search: search };
        }

        if (tag) {
            query.tags = { $in: [tag] };
        }

        // Build sort
        let sortObj = {};
        switch (sort) {
            case 'price_asc':
                sortObj = { price: 1 };
                break;
            case 'price_desc':
                sortObj = { price: -1 };
                break;
            case 'name':
                sortObj = { name: 1 };
                break;
            default:
                sortObj = { name: 1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Only fetch fields needed by the storefront grid, and use lean() to
        // return plain JS objects (lower memory and CPU vs hydrated Mongoose docs)
        // Build base query; select only fields the UI needs and lean() for speed
        const findQuery = Product.find(query)
            .select('name description price category tags imageUrl stock createdAt')
            .lean();

        // If text search is used, sort by textScore first
        if (query.$text) {
            // When $text is used, include the score and sort by it first
            findQuery.select({ score: { $meta: 'textScore' } });
            findQuery.sort({ score: { $meta: 'textScore' } });
        } else {
            findQuery.sort(sortObj);
        }

        const products = await findQuery
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const { name, description, price, category, tags, imageUrl, stock } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            tags: tags || [],
            imageUrl,
            stock: stock || 0
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
