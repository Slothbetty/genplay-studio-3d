# GenPlay Studio 3D - Render Deployment Guide

Render is the perfect platform for your GenPlay Studio 3D app! It's much simpler than AWS and significantly more cost-effective.

## Why Render is Perfect for Your App

### Cost Comparison:
- **AWS**: $20-50+/month (EC2 + CloudFront + API Gateway + Lambda)
- **Render**: $7/month for static site + $7/month for web service = **$14/month total**

### Advantages:
- ✅ **Much simpler setup** - No complex AWS services
- ✅ **Automatic HTTPS** - Free SSL certificates
- ✅ **Global CDN** - Built-in for static sites
- ✅ **Auto-deployments** - Connect GitHub for automatic updates
- ✅ **Better developer experience** - Clean dashboard
- ✅ **No CORS issues** - Render handles this automatically

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Tripo 3D API Key** - Your existing API key

## Step 1: Prepare Your Repository

### 1.1 Update API Configuration for Production

Update your `src/services/api.js` to handle production URLs:

```javascript
// src/services/api.js
const isDevelopment = import.meta.env.DEV
const baseURL = isDevelopment 
  ? 'http://localhost:3001/api'  // Use local proxy in development
  : (import.meta.env.VITE_RENDER_PROXY_URL || 'https://your-proxy-service.onrender.com/api')

const API_CONFIG = {
  baseURL: baseURL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_TRIPO_AI_API_KEY}`
  }
}
```

### 1.2 Create Render Configuration Files

Create `render.yaml` in your project root:

```yaml
# render.yaml
services:
  # Static site (React app)
  - type: web
    name: genplay-studio-3d
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

  # Proxy service (for API calls)
  - type: web
    name: genplay-proxy
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node proxy-server.js
    envVars:
      - key: VITE_TRIPO_AI_API_KEY
        sync: false
      - key: NODE_ENV
        value: production
```

### 1.3 Update Proxy Server for Render

Update your `proxy-server.js` to work with Render:

```javascript
// proxy-server.js
import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Enable CORS for all origins in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://genplay-studio-3d.onrender.com', 'http://localhost:3000']
    : 'http://localhost:3000',
  credentials: true
}))

// Proxy for model downloads
app.get('/api/download', async (req, res) => {
  try {
    const url = req.query.url
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const response = await fetch(fullUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const contentType = url.includes('.glb') ? 'application/octet-stream' : 'application/octet-stream'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', buffer.byteLength)
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Download failed', message: error.message })
  }
})

// Main proxy middleware
const proxyOptions = {
  target: 'https://api.tripo3d.ai/v2',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/openapi'
  },
  onProxyReq: (proxyReq, req, res) => {
    if (process.env.VITE_TRIPO_AI_API_KEY) {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_TRIPO_AI_API_KEY}`)
    }
  }
}

app.use('/api', createProxyMiddleware(proxyOptions))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GenPlay Proxy Server Running' })
})

app.listen(PORT, () => {
  console.log(`🚀 GenPlay Proxy Server running on port ${PORT}`)
})
```

## Step 2: Deploy to Render

### 2.1 Deploy Static Site (React App)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Static Site"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your GenPlay Studio 3D repository

3. **Configure Static Site**
   - **Name**: `genplay-studio-3d`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_TRIPO_AI_API_KEY=your_api_key_here
     VITE_RENDER_PROXY_URL=https://your-proxy-service.onrender.com
     ```

4. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your app

### 2.2 Deploy Proxy Service

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select the same repository

2. **Configure Web Service**
   - **Name**: `genplay-proxy`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node proxy-server.js`
   - **Plan**: Free (or $7/month for better performance)

3. **Environment Variables**
   ```
   VITE_TRIPO_AI_API_KEY=your_api_key_here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### 2.3 Update Static Site Configuration

After your proxy service is deployed:

1. **Get the proxy service URL** (e.g., `https://genplay-proxy.onrender.com`)
2. **Update your static site environment variables**:
   ```
   VITE_RENDER_PROXY_URL=https://genplay-proxy.onrender.com
   ```
3. **Redeploy the static site** (Render will auto-deploy when you push changes)

## Step 3: Email Configuration

### 3.1 Gmail Setup (Recommended)

For the contact form to work, you need to set up Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password) in `EMAIL_PASS`

3. **Update Environment Variables** in your Render proxy service:
   ```
   EMAIL_USER=your-actual-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### 3.2 Alternative Email Providers

For other email providers, you can modify the transporter configuration in `proxy-server.js`:

```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})
```

Add these environment variables to your Render proxy service:
```
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
```

## Step 4: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your static site settings
   - Click "Custom Domains"
   - Add your domain (e.g., `genplay-studio.com`)

2. **Configure DNS**
   - Add CNAME record pointing to your Render URL
   - Render will automatically provision SSL certificate

## Step 5: Update Your App for Production

### 5.1 Update ModelViewer Component

Update `src/components/ModelViewer.jsx` to use the Render proxy:

```javascript
// In ModelViewer.jsx
const proxyUrl = import.meta.env.DEV 
  ? `http://localhost:3001/api/download?url=${encodeURIComponent(modelUrl)}`
  : `${import.meta.env.VITE_RENDER_PROXY_URL}/api/download?url=${encodeURIComponent(modelUrl)}`
```

### 5.2 Update API Service

Ensure your `src/services/api.js` uses the correct base URL:

```javascript
const baseURL = isDevelopment 
  ? 'http://localhost:3001/api'
  : (import.meta.env.VITE_RENDER_PROXY_URL || 'https://your-proxy-service.onrender.com/api')
```

## Step 6: Test Your Deployment

1. **Visit your static site URL** (e.g., `https://genplay-studio-3d.onrender.com`)
2. **Test the full flow**:
   - Upload an image
   - Generate a model
   - View the 3D model
   - Test the contact form (fill out and submit)
3. **Check proxy service logs** in Render dashboard
4. **Verify email delivery** at `info@genplayai.io`

## Cost Breakdown

### Render Pricing:
- **Static Site**: Free (or $7/month for custom domain)
- **Web Service**: Free (or $7/month for better performance)
- **Total**: $0-14/month

### AWS Equivalent:
- **S3 + CloudFront**: $5-15/month
- **API Gateway**: $3.50/month per million requests
- **Lambda**: $0.20 per million requests
- **EC2 (if needed)**: $10-50/month
- **Total**: $20-70/month

## Monitoring and Maintenance

### 1. **Automatic Deployments**
- Push to GitHub → Automatic deployment
- No manual intervention needed

### 2. **Logs and Monitoring**
- View logs in Render dashboard
- Set up alerts for errors
- Monitor performance

### 3. **Scaling**
- Static sites automatically scale
- Web services can be upgraded to paid plans for better performance

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure proxy service is running
   - Check environment variables are set correctly

2. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`

3. **API Key Issues**
   - Verify environment variables are set
   - Check API key permissions

4. **Model Loading Issues**
   - Check proxy service logs
   - Verify download endpoint is working

### Support:
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Email Support: Available with paid plans

## Quick Start Commands

```bash
# 1. Push your code to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. Deploy to Render (via dashboard)
# - Go to dashboard.render.com
# - Create static site and web service
# - Set environment variables
# - Deploy!

# 3. Test your deployment
curl https://your-app.onrender.com/health
```

## Benefits Over AWS

| Feature | Render | AWS |
|---------|--------|-----|
| **Setup Time** | 10 minutes | 2+ hours |
| **Complexity** | Simple | Complex |
| **Cost** | $0-14/month | $20-70/month |
| **SSL** | Automatic | Manual setup |
| **CDN** | Built-in | Separate service |
| **Deployments** | Git-based | Multiple services |
| **Monitoring** | Built-in | CloudWatch setup |

**Render is the perfect choice for your GenPlay Studio 3D app!** 🚀 