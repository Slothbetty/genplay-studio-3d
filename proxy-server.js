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
    
    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const contentType = url.includes('.glb') ? 'model/gltf-binary' : 'application/octet-stream'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', buffer.byteLength)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    res.send(Buffer.from(buffer))
  } catch (error) {
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
  },
  onError: (err, req, res) => {
    res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}

app.use('/api', createProxyMiddleware(proxyOptions))

app.listen(PORT, () => {
  console.log(`🚀 GenPlay Proxy Server running on port ${PORT}`)
  console.log(`📡 Proxying requests to: https://api.tripo3d.ai/v2`)
  console.log(`🔑 API Key configured: ${process.env.VITE_TRIPO_AI_API_KEY ? 'Yes' : 'No'}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
}) 