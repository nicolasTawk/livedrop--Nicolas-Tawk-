// Simple test script to verify API endpoints
const API_BASE = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing Storefront API...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const health = await healthResponse.json();
        console.log('✅ Health:', health.status);
        console.log('   Database:', health.database);
        console.log('');

        // Test products endpoint
        console.log('2. Testing products endpoint...');
        const productsResponse = await fetch(`${API_BASE}/api/products?limit=3`);
        const productsData = await productsResponse.json();
        console.log('✅ Products loaded:', productsData.products.length);
        console.log('   First product:', productsData.products[0]?.name);
        console.log('');

        // Test customer lookup
        console.log('3. Testing customer lookup...');
        const customerResponse = await fetch(`${API_BASE}/api/customers?email=demo@example.com`);
        const customer = await customerResponse.json();
        console.log('✅ Customer found:', customer.name);
        console.log('   Email:', customer.email);
        console.log('');

        // Test orders for customer
        console.log('4. Testing customer orders...');
        const ordersResponse = await fetch(`${API_BASE}/api/orders?customerId=${customer._id}`);
        const orders = await ordersResponse.json();
        console.log('✅ Orders found:', orders.length);
        if (orders.length > 0) {
            console.log('   First order status:', orders[0].status);
            console.log('   First order total: $' + orders[0].total);
        }
        console.log('');

        // Test analytics
        console.log('5. Testing analytics...');
        const analyticsResponse = await fetch(`${API_BASE}/api/analytics/dashboard-metrics`);
        const analytics = await analyticsResponse.json();
        console.log('✅ Analytics loaded');
        console.log('   Total revenue: $' + analytics.totalRevenue);
        console.log('   Total orders:', analytics.totalOrders);
        console.log('');

        console.log('🎉 All API tests passed!');
        console.log('\n📋 Next steps:');
        console.log('   1. Set up MongoDB Atlas');
        console.log('   2. Run: npm run seed');
        console.log('   3. Start frontend: npm run dev');
        console.log('   4. Test the full application');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure the backend is running: npm run dev');
        console.log('   2. Check MongoDB connection');
        console.log('   3. Verify environment variables');
    }
}

testAPI();
