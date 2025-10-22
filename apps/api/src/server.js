// Minimal Express bootstrap for the API: CORS, JSON body parsing, logging,
// Mongo connection, routes, and a simple health check. Keep it explicit.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS + JSON + request logging. CORS origin controlled by env so we can
// point the same build at dev/prod frontends without code changes.
app.use(cors({
    origin: process.env.CORS_ORIGIN || "https://livedrop-nicolas-tawk-h4pt.vercel.app",
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Database connection with graceful failure. If Atlas is briefly unreachable,
// we still boot the server so health checks work and callers get clear errors.
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/storefront';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('⚠️ Server will continue without database connection');
});

mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

// Routes: keep route modules thin and focused on one resource each.
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/assistant', require('./routes/assistant'));

// Health check for deploy platform and quick local sanity checks.
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
