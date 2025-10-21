# Deployment Guide - Storefront v1

Complete deployment guide for the Storefront application with MongoDB Atlas, real-time features, and intelligent assistant.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier)
- Render.com or Railway.app account (free tier)
- Vercel account (free tier)
- Your Week 3 Colab notebook with ngrok

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free account (no credit card required)

2. **Create Cluster**
   - Choose "M0 Sandbox" (free tier)
   - Select region closest to you
   - Name your cluster (e.g., "storefront-cluster")

3. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `storefront-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Get Connection String**
   - Go to "Clusters" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `storefront`

## Step 2: Backend Deployment (Render.com)

1. **Prepare Repository**
   ```bash
   # Commit all changes
   git add .
   git commit -m "Add backend API with MongoDB and SSE"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to https://render.com
   - Sign up/login with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository with your code

3. **Configure Service**
   - **Name**: `storefront-api`
   - **Environment**: `Node`
   - **Build Command**: `cd apps/api && npm install`
   - **Start Command**: `cd apps/api && npm start`
   - **Root Directory**: Leave empty

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://storefront-user:YOUR_PASSWORD@cluster.mongodb.net/storefront?retryWrites=true&w=majority
   PORT=3000
   NODE_ENV=production
   LLM_BASE_URL=https://your-ngrok-url.ngrok.io
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note the service URL (e.g., `https://storefront-api.onrender.com`)

## Step 3: Seed Database

1. **Install MongoDB Compass** (optional)
   - Download from https://www.mongodb.com/products/compass
   - Connect using your Atlas connection string
   - Navigate to `storefront` database

2. **Seed via API** (recommended)
   ```bash
   # Install dependencies locally
   cd apps/api
   npm install
   
   # Set environment variable
   export MONGODB_URI="your-atlas-connection-string"
   
   # Run seed script
   npm run seed
   ```

3. **Verify Data**
   - Check that you have 15 customers, 30 products, 20+ orders
   - Test user: `demo@example.com` should have 3 orders

## Step 4: Frontend Deployment (Vercel)

1. **Prepare Frontend**
   ```bash
   # Update API URL in frontend
   echo "REACT_APP_API_URL=https://your-backend-url.onrender.com" > apps/storefront/.env
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - **Root Directory**: `apps/storefront`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Note the frontend URL (e.g., `https://storefront.vercel.app`)

## Step 5: LLM Endpoint (Week 3 Colab)

1. **Open Your Week 3 Colab**
   - Go to your existing Colab notebook
   - Make sure your RAG system is running

2. **Add New Endpoint**
   Add this code to your Colab notebook:
   ```python
   # ADD THIS NEW ENDPOINT (don't touch existing RAG endpoints)
   @app.route('/generate', methods=['POST'])
   def generate():
       """Simple text completion - no RAG, no retrieval"""
       prompt = request.json.get('prompt')
       max_tokens = request.json.get('max_tokens', 500)
       
       # Use the same model you already loaded
       response = model.generate(prompt, max_tokens=max_tokens)
       
       return jsonify({"text": response})
   ```

3. **Update ngrok**
   - Make sure ngrok is running
   - Note the new ngrok URL
   - Update your backend environment variable with this URL

## Step 6: Update Backend CORS

1. **Update CORS Origin**
   - Go to your Render dashboard
   - Update environment variable:
   ```
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

2. **Redeploy**
   - Render will automatically redeploy when you change environment variables

## Step 7: Test Complete System

1. **Test Frontend**
   - Visit your Vercel URL
   - Login with `demo@example.com`
   - Browse products, add to cart, checkout

2. **Test Real-time Features**
   - Place an order
   - Go to order status page
   - Watch live status updates via SSE

3. **Test Assistant**
   - Click "Ask Support"
   - Try different questions:
     - "What's your return policy?"
     - "Where is my order?"
     - "Hello, how are you?"

4. **Test Admin Dashboard**
   - Visit `/admin` (if implemented)
   - Check business metrics and performance

## Troubleshooting

### Backend Issues
- **Database Connection**: Check MongoDB Atlas network access
- **CORS Errors**: Verify CORS_ORIGIN matches your frontend URL
- **LLM Connection**: Ensure ngrok is running and URL is correct

### Frontend Issues
- **API Calls Failing**: Check REACT_APP_API_URL environment variable
- **SSE Not Working**: Verify backend is deployed and accessible
- **Assistant Not Responding**: Check LLM_BASE_URL in backend

### Common Solutions
```bash
# Check backend logs
# In Render dashboard, go to "Logs" tab

# Test API directly
curl https://your-backend-url.onrender.com/health

# Test LLM endpoint
curl -X POST https://your-ngrok-url.ngrok.io/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "max_tokens": 50}'
```

## Production Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Database seeded with test data
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] LLM endpoint working
- [ ] SSE real-time updates working
- [ ] Assistant responding correctly
- [ ] All environment variables set
- [ ] CORS configured properly
- [ ] Test user `demo@example.com` has orders

## URLs to Document

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-api.onrender.com
- **LLM Endpoint**: https://your-ngrok.ngrok.io
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

## Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboards
2. Verify all environment variables are set
3. Test each component individually
4. Check MongoDB Atlas connection
5. Ensure ngrok is running for LLM endpoint
