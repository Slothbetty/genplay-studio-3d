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
    ? true // Allow all origins in production
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.status(200).end()
})

// Health check (should come first)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GenPlay Proxy Server Running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  })
})

// Proxy for model downloads (must come BEFORE main proxy middleware)
app.get('/api/download', async (req, res) => {
  try {
    const url = req.query.url
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }
    
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    
    const response = await fetch(fullUrl, {
      redirect: 'follow', // Follow redirects automatically
      headers: {
        'User-Agent': 'GenPlay-Proxy/1.0'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream'
    if (url.includes('.glb')) {
      contentType = 'model/gltf-binary'
    } else if (url.includes('.stl')) {
      contentType = 'application/sla'
    } else if (url.includes('.obj')) {
      contentType = 'application/obj'
    }
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', buffer.byteLength)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Download error:', error.message, 'URL:', req.query.url)
    res.status(500).json({ 
      error: 'Download failed', 
      message: error.message,
      url: req.query.url 
    })
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
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to all proxy responses
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  },
  onError: (err, req, res) => {
    res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}

app.use('/api', createProxyMiddleware(proxyOptions))

app.listen(PORT, () => {
  // GenPlay Proxy Server started successfully
}) 