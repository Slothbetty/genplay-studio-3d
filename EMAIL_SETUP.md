# Email Setup Guide

## Overview
The contact form now sends emails directly to `info@genplayai.io` without requiring users to open their email client. The system includes a professional contact form with loading states and automatic email delivery.

## Environment Variables Required

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Existing variables
VITE_TRIPO_AI_API_KEY=your-api-key-here
PORT=3001
NODE_ENV=development
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password) in `EMAIL_PASS`

## Alternative Email Providers

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

Add these environment variables:
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
```

## Features

### Contact Form Features:
- **Professional UI**: Modern, responsive contact form with validation
- **Loading States**: Spinning loader with "Sending..." text during submission
- **Form Validation**: Required field validation and email format checking
- **Success Feedback**: User-friendly success messages
- **Error Handling**: Graceful error handling with retry options
- **Auto-close**: Form automatically closes after successful submission

### Email Features:
- **Direct Delivery**: Emails sent directly to `info@genplayai.io`
- **Rich Formatting**: Both HTML and plain text email versions
- **Custom Headers**: Special headers for Gmail filtering
- **Subject Formatting**: `[CONTACT FORM] Service Name - Customer Name`
- **Complete Data**: All form fields included in email

## Testing

1. Start the proxy server: `npm run proxy`
2. Start the frontend: `npm run dev`
3. Navigate to the Services section on the landing page
4. Click "Get Quote" or "Learn More" on any service
5. Fill out the contact form and click "Submit Request"
6. Watch the loading spinner and success message
7. Check that the email is received at `info@genplayai.io`

## Gmail Filter Setup

To automatically organize contact form emails in Gmail:

1. **Go to Gmail Settings** → Filters and Blocked Addresses
2. **Create a new filter** with these criteria:
   - **Subject**: `[CONTACT FORM]`
   - **From**: `your-email@gmail.com` (the sending address)
3. **Choose actions**:
   - Apply label: "Customer Contact Form" (create this label)
   - Mark as important
   - Never send it to Spam
4. **Save the filter**

## Troubleshooting

- **Authentication failed**: Check your email credentials and app password
- **Connection timeout**: Verify your email provider's SMTP settings
- **CORS errors**: Ensure the proxy server is running on the correct port
- **Form not submitting**: Check browser console for JavaScript errors
- **Loading spinner stuck**: Check proxy server logs for email sending errors
