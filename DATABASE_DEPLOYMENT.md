# Database Deployment Guide

## Overview
This guide helps you deploy your newsletter system with PostgreSQL database on Render.

## Quick Start

### 1. **Deploy to Render**

Your `render.yaml` is already configured with PostgreSQL. Simply deploy:

```bash
git add .
git commit -m "Add PostgreSQL database support"
git push origin main
```

### 2. **Set Environment Variables**

In your Render dashboard, add these environment variables to your **proxy service**:

```env
DATABASE_URL=postgresql://username:password@host:port/database
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Note**: The `DATABASE_URL` will be automatically provided by Render when you deploy.

### 3. **Verify Deployment**

After deployment, check that everything is working:

```bash
# Test the health endpoint
curl https://your-proxy-url.onrender.com/health

# Test newsletter subscription
curl -X POST https://your-proxy-url.onrender.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## How It Works

### **Production (Render)**
- ✅ Uses PostgreSQL database
- ✅ Automatic table creation
- ✅ Connection pooling
- ✅ SSL encryption
- ✅ Automatic backups

### **Development (Local)**
- ✅ Uses JSON file storage
- ✅ No database required
- ✅ Easy testing and development

## Database Schema

The system automatically creates this table:

```sql
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  verification_token VARCHAR(255),
  verification_expiry TIMESTAMP,
  verified_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Auto | PostgreSQL connection string (provided by Render) |
| `EMAIL_USER` | Yes | Your Gmail address |
| `EMAIL_PASS` | Yes | Gmail app password |
| `FRONTEND_URL` | Yes | Your frontend URL for confirmation links |
| `VITE_TRIPO_AI_API_KEY` | Yes | Your Tripo3D API key |

## Testing

### 1. **Test Database Connection**
```bash
curl https://your-proxy-url.onrender.com/health
```

### 2. **Test Newsletter Subscription**
```bash
curl -X POST https://your-proxy-url.onrender.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. **Test Admin Endpoints**
```bash
# Get subscribers
curl https://your-proxy-url.onrender.com/api/newsletter/subscribers

# Send newsletter
curl -X POST https://your-proxy-url.onrender.com/api/newsletter/send \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test","content":"Test content"}'
```

## Monitoring

### **Render Dashboard**
- Check service logs for any errors
- Monitor database performance
- View automatic backups

### **Health Checks**
- Database connection status
- Email service configuration
- API endpoint availability

## Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   ```
   Check: DATABASE_URL environment variable
   Solution: Ensure database service is running
   ```

2. **Email Sending Failed**
   ```
   Check: EMAIL_USER and EMAIL_PASS
   Solution: Verify Gmail app password
   ```

3. **Frontend URL Issues**
   ```
   Check: FRONTEND_URL environment variable
   Solution: Set correct frontend URL
   ```

### **Debug Commands**

```bash
# Check service logs
render service:logs genplay-proxy

# Test database connection
render service:shell genplay-proxy
node -e "import { testConnection } from './src/database/newsletter.js'; testConnection().then(console.log);"
```

## Cost

### **Render PostgreSQL**
- **Free Tier**: 1GB storage, 1GB RAM
- **Starter**: $7/month - 1GB storage, 1GB RAM
- **Standard**: $20/month - 10GB storage, 2GB RAM

### **Storage Estimates**
- **1,000 subscribers**: ~50KB
- **10,000 subscribers**: ~500KB
- **100,000 subscribers**: ~5MB

## Security

- ✅ SSL encryption for all database connections
- ✅ Prepared statements prevent SQL injection
- ✅ Environment variables for sensitive data
- ✅ Automatic backups and recovery

## Next Steps

1. **Deploy**: Push your code to trigger deployment
2. **Configure**: Set environment variables in Render dashboard
3. **Test**: Verify all endpoints are working
4. **Monitor**: Check logs and performance
5. **Scale**: Upgrade database plan as needed

Your newsletter system is now ready for production with a robust PostgreSQL database! 🚀
