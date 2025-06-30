import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = 3001

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// Proxy for model downloads (external URLs) - must come BEFORE main proxy
app.get('/api/download', async (req, res) => {
  try {
    const url = req.query.url
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    console.log('Received URL parameter:', url)
    console.log('URL starts with http:', url.startsWith('http'))

    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    console.log(`Downloading model from: ${fullUrl}`)
    
    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    
    // Determine content type based on URL
    const contentType = url.includes('.glb') ? 'application/octet-stream' : 'application/octet-stream'
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', buffer.byteLength)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    console.log(`Serving model with Content-Type: ${contentType}, size: ${buffer.byteLength} bytes`)
    
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Download failed', message: error.message })
  }
})

// Proxy middleware configuration
const proxyOptions = {
  target: 'https://api.tripo3d.ai/v2',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/openapi' // Rewrite /api to /openapi
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add API key to headers
    if (process.env.VITE_TRIPO_AI_API_KEY) {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_TRIPO_AI_API_KEY}`)
    }
    
    // Log the request
    console.log(`Proxying: ${req.method} ${req.path} -> ${proxyReq.path}`)
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    console.log(`Response: ${proxyRes.statusCode} for ${req.path}`)
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err)
    res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}

// Use proxy for all /api routes
app.use('/api', createProxyMiddleware(proxyOptions))

// WebSocket proxy for task monitoring
const wss = new WebSocketServer({ 
  server,
  path: '/api/task/watch'
})

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established')
  
  // Extract task ID from URL
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const taskId = url.searchParams.get('taskId')
  
  if (!taskId) {
    ws.close(1008, 'Task ID required')
    return
  }
  
  // Connect to Tripo 3D WebSocket
  const tripoWs = new WebSocket(`wss://api.tripo3d.ai/v2/openapi/task/watch/${taskId}`, {
    headers: {
      Authorization: `Bearer ${process.env.VITE_TRIPO_AI_API_KEY}`
    }
  })
  
  tripoWs.on('message', (data) => {
    ws.send(data)
  })
  
  tripoWs.on('error', (error) => {
    console.error('Tripo WebSocket error:', error)
    ws.close(1011, 'Upstream error')
  })
  
  tripoWs.on('close', () => {
    ws.close()
  })
  
  ws.on('message', (data) => {
    // Forward messages to Tripo (if needed)
    tripoWs.send(data)
  })
  
  ws.on('close', () => {
    tripoWs.close()
  })
  
  ws.on('error', (error) => {
    console.error('Client WebSocket error:', error)
    tripoWs.close()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CORS Proxy Server Running' })
})

server.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`)
  console.log(`📡 Proxying requests to: https://api.tripo3d.ai/v2`)
  console.log(`🔑 API Key configured: ${process.env.VITE_TRIPO_AI_API_KEY ? 'Yes' : 'No'}`)
  console.log(`🌐 Your React app should use: http://localhost:${PORT}/api`)
  console.log(`🔌 WebSocket proxy available at: ws://localhost:${PORT}/api/task/watch`)
}) 