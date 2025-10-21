# Storefront API

Backend API for the Storefront v1 application with MongoDB Atlas, real-time order tracking, and intelligent support assistant.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas connection string and LLM endpoint
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

- `MONGODB_URI` - MongoDB Atlas connection string
- `PORT` - Server port (default: 3000)
- `LLM_BASE_URL` - Your Week 3 Colab ngrok URL
- `CORS_ORIGIN` - Frontend URL for CORS

## API Endpoints

### Customers
- `GET /api/customers?email=user@example.com` - Look up customer by email
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer

### Products
- `GET /api/products` - List products with search, filter, sort, pagination
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders?customerId=:id` - Get orders for customer
- `GET /api/orders/:id/stream` - SSE stream for real-time order updates
- `PUT /api/orders/:id/status` - Update order status

### Analytics
- `GET /api/analytics/daily-revenue?from=YYYY-MM-DD&to=YYYY-MM-DD` - Daily revenue
- `GET /api/analytics/dashboard-metrics` - Dashboard metrics

### Assistant
- `POST /api/assistant/query` - Send message to assistant
- `GET /api/assistant/intents` - Get available intents
- `GET /api/assistant/functions` - Get available functions

### Dashboard
- `GET /api/dashboard/business-metrics` - Business metrics
- `GET /api/dashboard/performance` - Performance metrics
- `GET /api/dashboard/assistant-stats` - Assistant analytics

## Test User

For evaluation, use: `demo@example.com` (has 3 orders with different statuses)

## Database Schema

### Customers
- `name`, `email` (unique), `phone`, `address`, `createdAt`

### Products  
- `name`, `description`, `price`, `category`, `tags`, `imageUrl`, `stock`

### Orders
- `customerId`, `items[]`, `total`, `status`, `carrier`, `trackingNumber`, `estimatedDelivery`

## Real-Time Features

The SSE endpoint (`/api/orders/:id/stream`) automatically simulates order progression:
- `PENDING` → `PROCESSING` (3-5 seconds)
- `PROCESSING` → `SHIPPED` (5-7 seconds) 
- `SHIPPED` → `DELIVERED` (5-7 seconds)

## Assistant Features

- **Intent Detection**: 7 intents (policy_question, order_status, product_search, complaint, chitchat, off_topic, violation)
- **Function Calling**: getOrderStatus, searchProducts, getCustomerOrders
- **Knowledge Base**: Grounded responses with citations
- **Identity**: Alex, Customer Support Specialist

## Deployment

1. **MongoDB Atlas**: Create free cluster, whitelist IPs
2. **Backend**: Deploy to Render.com or Railway.app
3. **Frontend**: Deploy to Vercel
4. **LLM**: Add `/generate` endpoint to Week 3 Colab

## Health Check

- `GET /health` - Server and database status
