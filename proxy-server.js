import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initializeDatabase, newsletterDB, db } from './src/database/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize database on startup
const initializeApp = async () => {
  try {
    if (process.env.DATABASE_URL) {
      // Use PostgreSQL database (both production and development)
      const dbConnected = await db.testConnection();
      if (dbConnected) {
        console.log('🗄️ Using PostgreSQL database for application storage');
        await initializeDatabase();
      } else {
        throw new Error('Database connection failed');
      }
    } else {
      // No database URL provided
      console.error('❌ DATABASE_URL environment variable is required');
      console.error('Please set DATABASE_URL in your .env file or environment variables');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ App initialization error:', error);
    console.error('❌ Database connection required');
    process.exit(1);
  }
};


// Helper function to send confirmation email
const sendConfirmationEmail = async (email, verificationToken) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  })

  const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/confirm?token=${verificationToken}`
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm your GenPlay AI Newsletter Subscription',
    headers: {
      'X-Custom-Header': 'GenPlay-Newsletter-Confirmation',
      'X-Priority': '3'
    },
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to GenPlay AI!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Confirm your newsletter subscription</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Thank you for subscribing!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We're excited to have you join our community! To complete your subscription and start receiving our latest updates, 
            please confirm your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Confirm Subscription
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, you can also copy and paste this link into your browser:<br>
            <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0; font-size: 16px;">What to expect:</h3>
            <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
              <li>Latest AI and 3D technology updates</li>
              <li>Exclusive product announcements</li>
              <li>Tips and tutorials for 3D creation</li>
              <li>Special offers and discounts</li>
            </ul>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            This confirmation link will expire in 24 hours.<br>
            If you didn't request this subscription, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `
Welcome to GenPlay AI!

Thank you for subscribing to our newsletter! To complete your subscription and start receiving our latest updates, please confirm your email address by visiting this link:

${confirmationUrl}

What to expect:
- Latest AI and 3D technology updates
- Exclusive product announcements  
- Tips and tutorials for 3D creation
- Special offers and discounts

This confirmation link will expire in 24 hours.
If you didn't request this subscription, you can safely ignore this email.

Best regards,
The GenPlay AI Team
    `
  }

  await transporter.sendMail(mailOptions)
  console.log(`📧 Confirmation email sent to: ${email}`)
}

// Helper function to send welcome email
const sendWelcomeEmail = async (email) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to GenPlay AI Newsletter! 🎉',
    headers: {
      'X-Custom-Header': 'GenPlay-Newsletter-Welcome',
      'X-Priority': '3'
    },
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to GenPlay AI!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You're now part of our community</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Thank you for confirming your subscription!</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We're thrilled to have you join our community of AI and 3D enthusiasts! 
            You'll now receive our latest updates, exclusive content, and special offers.
          </p>
          
          <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0; font-size: 18px;">What's coming your way:</h3>
            <ul style="color: #666; margin: 15px 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>🚀 Latest AI Technology Updates</strong> - Stay ahead with cutting-edge AI developments</li>
              <li><strong>🎨 3D Creation Tips & Tutorials</strong> - Master the art of 3D modeling and design</li>
              <li><strong>💡 Exclusive Product Announcements</strong> - Be the first to know about new features</li>
              <li><strong>🎁 Special Offers & Discounts</strong> - Access to member-only deals and promotions</li>
              <li><strong>📚 Industry Insights</strong> - Expert analysis and trends in AI and 3D technology</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Explore GenPlay AI
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0; font-size: 16px;">💡 Pro Tip:</h3>
            <p style="color: #856404; margin: 10px 0; font-size: 14px;">
              Add our email address to your contacts to ensure you never miss an update! 
              This helps prevent our emails from going to your spam folder.
            </p>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            You can unsubscribe at any time by replying to this email or visiting our website.<br>
            We respect your privacy and will never share your email address.
          </p>
        </div>
      </div>
    `,
    text: `
🎉 Welcome to GenPlay AI!

Thank you for confirming your subscription! We're thrilled to have you join our community of AI and 3D enthusiasts.

What's coming your way:
🚀 Latest AI Technology Updates - Stay ahead with cutting-edge AI developments
🎨 3D Creation Tips & Tutorials - Master the art of 3D modeling and design  
💡 Exclusive Product Announcements - Be the first to know about new features
🎁 Special Offers & Discounts - Access to member-only deals and promotions
📚 Industry Insights - Expert analysis and trends in AI and 3D technology

Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

💡 Pro Tip: Add our email address to your contacts to ensure you never miss an update!

You can unsubscribe at any time by replying to this email. We respect your privacy and will never share your email address.

Best regards,
The GenPlay AI Team
    `
  }

  await transporter.sendMail(mailOptions)
  console.log(`📧 Welcome email sent to: ${email}`)
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

// Database info endpoint
app.get('/api/db/info', async (req, res) => {
  try {
    const dbInfo = await db.getInfo();
    res.json({
      success: true,
      database: dbInfo,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Database info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database info',
      message: error.message
    });
  }
})

// Check database tables endpoint
app.get('/api/db/tables', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    res.json({
      success: true,
      tables: tables,
      count: tables.length
    });
  } catch (error) {
    console.error('Database tables error:', error);
    res.status(500).json({ 
      error: 'Failed to get database tables',
      message: error.message 
    });
  }
});

// Test email configuration endpoint
app.get('/api/test/email', async (req, res) => {
  try {
    const emailConfig = {
      emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
      emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS
    };
    
    res.json({
      success: true,
      emailConfig: emailConfig,
      message: 'Email configuration check'
    });
  } catch (error) {
    console.error('Email config test error:', error);
    res.status(500).json({ 
      error: 'Failed to check email config',
      message: error.message 
    });
  }
});

// Test email sending endpoint
app.post('/api/test/send-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000
    });

    // Test the connection first
    console.log('🔍 Testing Gmail connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully');

    const mailOptions = {
      from: process.env.EMAIL_USER, // Use Gmail account directly
      to: to,
      subject: 'Test Email from GenPlay AI - ' + new Date().toISOString(),
      text: `This is a test email to verify email functionality.
      
Sent at: ${new Date().toISOString()}
From: ${process.env.EMAIL_USER}
To: ${to}

If you receive this email, the email system is working correctly!`,
      html: `
        <h1>Test Email from GenPlay AI</h1>
        <p>This is a test email to verify email functionality.</p>
        <hr>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
        <p><strong>To:</strong> ${to}</p>
        <hr>
        <p><em>If you receive this email, the email system is working correctly!</em></p>
      `
    };

    console.log('📧 Attempting to send test email to:', to);
    console.log('📧 From:', process.env.EMAIL_USER);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully:', info.messageId);
    console.log('📧 Email response:', info.response);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      response: info.response,
      from: process.env.EMAIL_USER,
      to: to
    });

  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      message: error.message,
      details: error.toString(),
      code: error.code
    });
  }
});

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

    // Use PostgreSQL database
    const existingSubscriber = await newsletterDB.getSubscriberByEmail(email.toLowerCase())

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
      return res.status(409).json({ 
        message: 'This email is already subscribed to our newsletter' 
      })
      } else if (existingSubscriber.status === 'pending') {
        return res.status(409).json({ 
          message: 'Please check your email for a confirmation link to complete your subscription' 
        })
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Add new subscriber
    await newsletterDB.addSubscriber({
      email: email.toLowerCase(),
      status: 'pending',
      verificationToken: verificationToken,
      verificationExpiry: verificationExpiry
    })

    // Send confirmation email
    await sendConfirmationEmail(email, verificationToken)
    
    console.log(`✅ Newsletter subscription initiated for: ${email}`)
      
      res.json({ 
        success: true, 
      message: 'Please check your email for a confirmation link to complete your subscription!' 
      })

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

    // Unsubscribe user using database
    const result = await newsletterDB.unsubscribeUser(email.toLowerCase())

    if (!result) {
      return res.status(404).json({ 
        message: 'Email not found in our newsletter list' 
      })
    }

      console.log(`📧 Newsletter unsubscribed: ${email}`)
      
      res.json({ 
        success: true, 
        message: 'Successfully unsubscribed from newsletter' 
      })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    res.status(500).json({ 
      error: 'Failed to unsubscribe from newsletter', 
      message: error.message 
    })
  }
})

// Newsletter email verification endpoint
app.get('/api/newsletter/verify', async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ 
        error: 'Verification token is required' 
      })
    }

    // Find subscriber with matching token
    const subscriber = await newsletterDB.getSubscriberByToken(token)

    if (!subscriber) {
      return res.status(404).json({ 
        error: 'Invalid or expired verification token' 
      })
    }
    
    // Check if token has expired
    const now = new Date()
    const expiryDate = new Date(subscriber.verification_expiry)
    
    if (now > expiryDate) {
      return res.status(400).json({ 
        error: 'Verification token has expired. Please subscribe again.' 
      })
    }

    // Activate subscription
    const result = await newsletterDB.verifySubscriber(subscriber.email)

    if (result) {
      console.log(`✅ Newsletter subscription confirmed: ${subscriber.email}`)
      
      // Send welcome email
      await sendWelcomeEmail(subscriber.email)
      
      res.json({ 
        success: true, 
        message: 'Email successfully verified! Welcome to GenPlay AI newsletter!' 
      })
    } else {
      throw new Error('Failed to update subscription data')
    }

  } catch (error) {
    console.error('Newsletter verification error:', error)
    res.status(500).json({ 
      error: 'Failed to verify email', 
      message: error.message 
    })
  }
})

// Get newsletter subscribers (admin endpoint)
app.get('/api/newsletter/subscribers', async (req, res) => {
  try {
    const result = await newsletterDB.getAllSubscribers()

    res.json({
      success: true,
      subscribers: result.subscribers,
      counts: result.counts
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
    const activeSubscribers = await newsletterDB.getActiveSubscribers()

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

// Gmail group management endpoint
app.post('/api/newsletter/gmail-group', async (req, res) => {
  try {
    const { action, groupEmail } = req.body

    if (!action || !groupEmail) {
      return res.status(400).json({ 
        error: 'Action and group email are required' 
      })
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        error: 'Email service not configured' 
      })
    }

    const activeSubscribers = await newsletterDB.getActiveSubscribers()

    if (activeSubscribers.length === 0) {
      return res.status(400).json({ 
        error: 'No active subscribers found' 
      })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    })

    if (action === 'add') {
      // Send email to Gmail group with subscriber list
      const subscriberList = activeSubscribers.map(sub => sub.email).join('\n')
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: groupEmail,
        subject: 'GenPlay AI Newsletter Subscribers - Add to Group',
        headers: {
          'X-Custom-Header': 'GenPlay-Gmail-Group-Management',
          'X-Priority': '3'
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Gmail Group Management</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Add subscribers to Gmail group</p>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Newsletter Subscribers to Add</h2>
              <p style="color: #666; margin-bottom: 20px;">
                Please add the following ${activeSubscribers.length} email addresses to your Gmail group:
              </p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0; font-size: 16px;">Email Addresses:</h3>
                <pre style="color: #666; font-size: 14px; white-space: pre-wrap; word-break: break-all;">${subscriberList}</pre>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0; font-size: 14px;">Instructions:</h3>
                <ol style="color: #856404; margin: 10px 0; padding-left: 20px; font-size: 14px;">
                  <li>Copy the email addresses above</li>
                  <li>Go to your Gmail group settings</li>
                  <li>Add these addresses to your group</li>
                  <li>Save the changes</li>
                </ol>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                Generated on ${new Date().toLocaleString()}<br>
                Total active subscribers: ${activeSubscribers.length}
              </p>
            </div>
          </div>
        `,
        text: `
Gmail Group Management - Add Newsletter Subscribers

Please add the following ${activeSubscribers.length} email addresses to your Gmail group:

${subscriberList}

Instructions:
1. Copy the email addresses above
2. Go to your Gmail group settings  
3. Add these addresses to your group
4. Save the changes

Generated on ${new Date().toLocaleString()}
Total active subscribers: ${activeSubscribers.length}
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`📧 Gmail group management email sent to: ${groupEmail}`)
      
      res.json({ 
        success: true, 
        message: `Gmail group management email sent to ${groupEmail} with ${activeSubscribers.length} subscriber addresses` 
      })

    } else if (action === 'sync') {
      // Send a sync request to update the group
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: groupEmail,
        subject: 'GenPlay AI Newsletter - Group Sync Request',
        headers: {
          'X-Custom-Header': 'GenPlay-Gmail-Group-Sync',
          'X-Priority': '3'
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Gmail Group Sync</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Update group with latest subscribers</p>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Group Sync Request</h2>
              <p style="color: #666; margin-bottom: 20px;">
                Please update your Gmail group with the latest newsletter subscribers.
                Current active subscribers: <strong>${activeSubscribers.length}</strong>
              </p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="mailto:${process.env.EMAIL_USER}?subject=Gmail Group Sync Request&body=Please send the latest subscriber list" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 12px 25px; 
                          text-decoration: none; 
                          border-radius: 20px; 
                          font-weight: bold; 
                          font-size: 14px;
                          display: inline-block;">
                  Request Latest Subscriber List
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                Generated on ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `,
        text: `
Gmail Group Sync Request

Please update your Gmail group with the latest newsletter subscribers.
Current active subscribers: ${activeSubscribers.length}

To get the latest subscriber list, reply to this email or contact: ${process.env.EMAIL_USER}

Generated on ${new Date().toLocaleString()}
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`📧 Gmail group sync request sent to: ${groupEmail}`)
      
      res.json({ 
        success: true, 
        message: `Gmail group sync request sent to ${groupEmail}` 
      })

    } else {
      return res.status(400).json({ 
        error: 'Invalid action. Use "add" or "sync"' 
      })
    }

  } catch (error) {
    console.error('Gmail group management error:', error)
    res.status(500).json({ 
      error: 'Failed to manage Gmail group', 
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

// Apply proxy middleware only to Tripo3D API routes (exclude newsletter and email endpoints)
app.use('/api', (req, res, next) => {
  // Skip proxy for newsletter and email endpoints
  if (req.path.startsWith('/newsletter') || req.path.startsWith('/send-email')) {
    return next()
  }
  // Apply proxy middleware for all other /api routes
  createProxyMiddleware(proxyOptions)(req, res, next)
})

// Start server
const startServer = async () => {
  try {
    await initializeApp();

app.listen(PORT, () => {
      console.log(`🚀 GenPlay Proxy Server running on port ${PORT}`);
      console.log(`📧 Newsletter system ready`);
      console.log(`🗄️ Database: PostgreSQL (Generic Application Database)`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
      console.log(`📊 Tables: newsletter_subscribers, users, settings`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 