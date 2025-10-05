# GenPlay Studio 3D - AWS Deployment Guide

This guide covers multiple deployment options for your React-based 3D model generation app on AWS.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js and npm installed
- Git repository for your code

## Option 1: AWS Amplify (Recommended - Easiest)

AWS Amplify is the easiest way to deploy React apps with automatic CI/CD.

### Setup Steps:

1. **Install AWS Amplify CLI:**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify in your project:**
   ```bash
   cd "GenPlay Studio 3D"
   amplify init
   ```

3. **Add hosting:**
   ```bash
   amplify add hosting
   # Choose "Amazon CloudFront and S3"
   ```

4. **Deploy:**
   ```bash
   amplify publish
   ```

### Environment Variables:
Add your Tripo 3D API key to Amplify:
```bash
amplify console
# Go to Environment Variables and add:
# VITE_TRIPO_API_KEY=your_api_key_here
```

## Option 2: AWS S3 + CloudFront (Static Hosting)

### Setup Steps:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket:**
   - Go to AWS S3 Console
   - Create bucket named `genplay-studio-3d`
   - Enable "Static website hosting"
   - Set index document to `index.html`

3. **Upload files:**
   ```bash
   aws s3 sync dist/ s3://genplay-studio-3d --delete
   ```

4. **Create CloudFront Distribution:**
   - Origin: Your S3 bucket
   - Default root object: `index.html`
   - Enable HTTPS

5. **Set up custom domain (optional):**
   - Add your domain to Route 53
   - Create SSL certificate in ACM
   - Update CloudFront distribution

## Option 3: AWS Elastic Beanstalk

### Setup Steps:

1. **Create deployment package:**
   ```bash
   npm run build
   zip -r deployment.zip dist/ package.json
   ```

2. **Deploy via AWS Console:**
   - Go to Elastic Beanstalk Console
   - Create new application
   - Choose "Web server environment"
   - Upload your deployment.zip

3. **Configure environment variables:**
   - Add `VITE_TRIPO_API_KEY` in environment configuration

## Option 4: AWS EC2 (Full Control)

### Setup Steps:

1. **Launch EC2 Instance:**
   - Choose Ubuntu or Amazon Linux
   - Configure security groups (open ports 80, 443, 3000)

2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. **Deploy your app:**
   ```bash
   git clone your-repo
   cd "GenPlay Studio 3D"
   npm install
   npm run build
   ```

4. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/your/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

5. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Configuration

### For Production:

1. **Update API endpoints:**
   - Remove proxy server dependency
   - Update API calls to use direct Tripo 3D API
   - Handle CORS properly

2. **Environment variables:**
   ```bash
   VITE_TRIPO_API_KEY=your_production_api_key
   VITE_API_BASE_URL=https://api.tripo3d.ai/v2
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Update API service:**
   ```javascript
   // src/services/api.js
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.tripo3d.ai/v2'
   ```

## Email Configuration

### Gmail Setup (Recommended)

For the contact form to work in production:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password) in `EMAIL_PASS`

3. **Set Environment Variables**:
   ```bash
   EMAIL_USER=your-actual-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Alternative Email Providers

For other email providers, modify the transporter configuration in your proxy server:

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

## Proxy Server Deployment

Since your app uses a local proxy server, you'll need to deploy it separately:

### Option A: Deploy Proxy to EC2

1. **Create separate EC2 instance for proxy:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Deploy proxy server
   git clone your-repo
   cd "GenPlay Studio 3D"
   npm install
   ```

2. **Run proxy server:**
   ```bash
   node proxy-server.js
   ```

3. **Update React app to use proxy URL:**
   ```javascript
   const API_BASE_URL = 'https://your-proxy-domain.com/api'
   ```

4. **Set up email environment variables on EC2:**
   ```bash
   export EMAIL_USER=your-email@gmail.com
   export EMAIL_PASS=your-app-password
   ```

### Option B: Use API Gateway + Lambda

1. **Create Lambda function for proxy:**
   ```javascript
   // lambda-proxy.js
   const fetch = require('node-fetch');
   
   exports.handler = async (event) => {
       const { httpMethod, path, queryStringParameters, body } = event;
       
       // Forward request to Tripo 3D API
       const response = await fetch(`https://api.tripo3d.ai/v2${path}`, {
           method: httpMethod,
           headers: {
               'Authorization': `Bearer ${process.env.TRIPO_API_KEY}`,
               'Content-Type': 'application/json'
           },
           body: body
       });
       
       return {
           statusCode: response.status,
           headers: {
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type,Authorization'
           },
           body: await response.text()
       };
   };
   ```

2. **Create API Gateway:**
   - Create REST API
   - Add Lambda integration
   - Configure CORS

3. **Set up email environment variables in Lambda:**
   - Go to Lambda function configuration
   - Add environment variables:
     - `EMAIL_USER`: your-email@gmail.com
     - `EMAIL_PASS`: your-app-password

## Recommended Deployment Architecture

For production, I recommend:

```
Internet → CloudFront → S3 (React App)
                ↓
         API Gateway → Lambda (Proxy + Email)
                ↓
         Tripo 3D API + Gmail SMTP
```

## Security Considerations

1. **API Key Security:**
   - Never expose API keys in client-side code
   - Use environment variables
   - Consider using AWS Secrets Manager

2. **Email Security:**
   - Use App Passwords instead of regular passwords
   - Store email credentials in environment variables
   - Consider using AWS Secrets Manager for email credentials

3. **CORS Configuration:**
   - Configure proper CORS headers
   - Restrict origins to your domain

4. **HTTPS:**
   - Always use HTTPS in production
   - Configure SSL certificates

## Monitoring and Logging

1. **CloudWatch Logs:**
   - Set up log groups for your application
   - Monitor errors and performance

2. **CloudWatch Metrics:**
   - Monitor API calls and response times
   - Set up alarms for errors
   - Monitor email delivery success rates

## Cost Optimization

1. **S3 + CloudFront:**
   - Very cost-effective for static sites
   - Pay only for storage and data transfer

2. **Lambda:**
   - Pay per request
   - Auto-scaling

3. **EC2:**
   - Fixed monthly cost
   - More control but higher cost

## Quick Start (Recommended)

For the fastest deployment:

1. **Use AWS Amplify:**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   amplify init
   amplify add hosting
   amplify publish
   ```

2. **Deploy proxy to Lambda:**
   - Create Lambda function with proxy code
   - Set up API Gateway
   - Update React app to use API Gateway URL

This gives you a scalable, cost-effective solution with minimal maintenance.

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure proxy server is running
   - Check CORS headers in API Gateway

2. **API Key Issues:**
   - Verify environment variables are set
   - Check API key permissions

3. **Build Errors:**
   - Ensure all dependencies are installed
   - Check for TypeScript errors

4. **Email Issues:**
   - Check Gmail App Password setup
   - Verify email environment variables
   - Check SMTP connection logs

### Support:

- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: Available with paid plans
- Community: AWS Developer Forums 