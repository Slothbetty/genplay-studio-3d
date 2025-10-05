import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Newsletter data file path
const NEWSLETTER_DATA_FILE = path.join(process.cwd(), 'newsletter-subscribers.json')

// Initialize newsletter data file if it doesn't exist
if (!fs.existsSync(NEWSLETTER_DATA_FILE)) {
  fs.writeFileSync(NEWSLETTER_DATA_FILE, JSON.stringify({
    subscribers: [],
    lastUpdated: new Date().toISOString()
  }))
}

// Helper functions for newsletter data
const readNewsletterData = () => {
  try {
    const data = fs.readFileSync(NEWSLETTER_DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading newsletter data:', error)
    return { subscribers: [], lastUpdated: new Date().toISOString() }
  }
}

const writeNewsletterData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString()
    fs.writeFileSync(NEWSLETTER_DATA_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing newsletter data:', error)
    return false
  }
}

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

    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER and EMAIL_PASS must be set')
      return res.status(500).json({ 
        error: 'Email service not configured', 
        message: 'Please contact administrator' 
      })
    }

    // Create transporter with real Gmail credentials and timeout settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
      pool: true,
      maxConnections: 5,
      maxMessages: 100
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

    // Send email with timeout handling
    try {
      await transporter.sendMail(mailOptions)
      console.log(`✅ Email sent successfully to info@genplayai.io from ${email}`)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      
      // Handle specific error types
      if (emailError.code === 'ETIMEDOUT') {
        return res.status(500).json({ 
          error: 'Email service timeout', 
          message: 'Email service is temporarily unavailable. Please try again later.' 
        })
      } else if (emailError.code === 'EAUTH') {
        return res.status(500).json({ 
          error: 'Email authentication failed', 
          message: 'Email service configuration error. Please contact administrator.' 
        })
      } else {
        return res.status(500).json({ 
          error: 'Email sending failed', 
          message: 'Unable to send email. Please try again later.' 
        })
      }
    }
    
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

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Valid email address is required' 
      })
    }

    // Read current newsletter data
    const newsletterData = readNewsletterData()
    
    // Check if email already exists
    const existingSubscriber = newsletterData.subscribers.find(
      sub => sub.email.toLowerCase() === email.toLowerCase()
    )

    if (existingSubscriber) {
      return res.status(409).json({ 
        message: 'This email is already subscribed to our newsletter' 
      })
    }

    // Add new subscriber
    const newSubscriber = {
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      status: 'active'
    }

    newsletterData.subscribers.push(newSubscriber)

    // Save updated data
    if (writeNewsletterData(newsletterData)) {
      console.log(`✅ New newsletter subscriber: ${email}`)
      
      res.json({ 
        success: true, 
        message: 'Successfully subscribed to newsletter!' 
      })
    } else {
      throw new Error('Failed to save subscription data')
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    res.status(500).json({ 
      error: 'Failed to subscribe to newsletter', 
      message: error.message 
    })
  }
})

// Newsletter unsubscribe endpoint
app.post('/api/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Valid email address is required' 
      })
    }

    const newsletterData = readNewsletterData()
    
    // Find and update subscriber status
    const subscriberIndex = newsletterData.subscribers.findIndex(
      sub => sub.email.toLowerCase() === email.toLowerCase()
    )

    if (subscriberIndex === -1) {
      return res.status(404).json({ 
        message: 'Email not found in our newsletter list' 
      })
    }

    // Mark as unsubscribed
    newsletterData.subscribers[subscriberIndex].status = 'unsubscribed'
    newsletterData.subscribers[subscriberIndex].unsubscribedAt = new Date().toISOString()

    if (writeNewsletterData(newsletterData)) {
      console.log(`📧 Newsletter unsubscribed: ${email}`)
      
      res.json({ 
        success: true, 
        message: 'Successfully unsubscribed from newsletter' 
      })
    } else {
      throw new Error('Failed to update subscription data')
    }

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    res.status(500).json({ 
      error: 'Failed to unsubscribe from newsletter', 
      message: error.message 
    })
  }
})

// Get newsletter subscribers (admin endpoint)
app.get('/api/newsletter/subscribers', async (req, res) => {
  try {
    const newsletterData = readNewsletterData()
    
    // Return only active subscribers for privacy
    const activeSubscribers = newsletterData.subscribers.filter(
      sub => sub.status === 'active'
    )

    res.json({
      success: true,
      count: activeSubscribers.length,
      subscribers: activeSubscribers.map(sub => ({
        email: sub.email,
        subscribedAt: sub.subscribedAt
      }))
    })

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    res.status(500).json({ 
      error: 'Failed to fetch subscribers', 
      message: error.message 
    })
  }
})

// Send newsletter endpoint (admin endpoint)
app.post('/api/newsletter/send', async (req, res) => {
  try {
    const { subject, content, htmlContent } = req.body

    if (!subject || !content) {
      return res.status(400).json({ 
        error: 'Subject and content are required' 
      })
    }

    // Get active subscribers
    const newsletterData = readNewsletterData()
    const activeSubscribers = newsletterData.subscribers.filter(
      sub => sub.status === 'active'
    )

    if (activeSubscribers.length === 0) {
      return res.status(400).json({ 
        error: 'No active subscribers found' 
      })
    }

    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing: EMAIL_USER and EMAIL_PASS must be set')
      return res.status(500).json({ 
        error: 'Email service not configured', 
        message: 'Please contact administrator' 
      })
    }

    // Create transporter with timeout settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    })

    // Send newsletter to all subscribers
    const emailPromises = activeSubscribers.map(async (subscriber) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: subject,
        text: content,
        html: htmlContent || content.replace(/\n/g, '<br>'),
        headers: {
          'X-Custom-Header': 'GenPlay-Newsletter',
          'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
        }
      }

      return transporter.sendMail(mailOptions)
    })

    // Send emails with error handling
    try {
      await Promise.all(emailPromises)
      console.log(`📧 Newsletter sent to ${activeSubscribers.length} subscribers`)
      
      res.json({ 
        success: true, 
        message: `Newsletter sent to ${activeSubscribers.length} subscribers` 
      })
    } catch (emailError) {
      console.error('Newsletter sending error:', emailError)
      
      // Handle specific error types
      if (emailError.code === 'ETIMEDOUT') {
        return res.status(500).json({ 
          error: 'Email service timeout', 
          message: 'Email service is temporarily unavailable. Please try again later.' 
        })
      } else if (emailError.code === 'EAUTH') {
        return res.status(500).json({ 
          error: 'Email authentication failed', 
          message: 'Email service configuration error. Please contact administrator.' 
        })
      } else {
        return res.status(500).json({ 
          error: 'Newsletter sending failed', 
          message: 'Unable to send newsletter. Please try again later.' 
        })
      }
    }

  } catch (error) {
    console.error('Newsletter sending error:', error)
    res.status(500).json({ 
      error: 'Failed to send newsletter', 
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