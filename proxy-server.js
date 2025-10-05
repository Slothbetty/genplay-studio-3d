import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware for parsing JSON
app.use(express.json())

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

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['name', 'email', 'message'] 
      })
    }

    // Create transporter with real Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@genplayai.io',
      subject: `[CONTACT FORM] ${service || 'General Inquiry'} - ${name}`,
      headers: {
        'X-Custom-Header': 'GenPlay-Contact-Form',
        'X-Priority': '3'
      },
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Service:</strong> ${service || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This email was sent from the GenPlay AI contact form.</em></p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
Service: ${service || 'General Inquiry'}

Message:
${message}

---
This email was sent from the GenPlay AI contact form.
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)
    
    // Log successful email sending
    console.log(`✅ Email sent successfully to info@genplayai.io from ${email}`)
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully!' 
    })

  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({ 
      error: 'Failed to send email', 
      message: error.message 
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