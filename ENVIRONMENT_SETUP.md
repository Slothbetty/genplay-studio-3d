# Environment Setup Guide

## Overview
This guide explains how to set up separate development and production environments with dedicated databases on Render.

## Architecture

### 🏗️ **Environment Structure:**
```
┌─────────────────┐    ┌─────────────────┐
│   Development   │    │   Production    │
├─────────────────┤    ├─────────────────┤
│ genplay-proxy-dev│    │ genplay-proxy   │
│ (dev database)  │    │ (prod database) │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│genplay-newsletter│    │genplay-newsletter│
│   -db-dev       │    │   -db-prod      │
└─────────────────┘    └─────────────────┘
```

## Services Created

### 📊 **Databases:**
- **`genplay-db-dev`** - Development database
- **`genplay-db-prod`** - Production database

### 🚀 **Web Services:**
- **`genplay-proxy-dev`** - Development API server
- **`genplay-proxy`** - Production API server

## Setup Instructions

### 1. **Deploy to Render**

Deploy your application to create all services:

```bash
git add .
git commit -m "Add separate dev/prod environments"
git push origin main
```

This will create:
- ✅ 2 PostgreSQL databases (dev + prod)
- ✅ 2 web services (dev + prod)
- ✅ Automatic environment configuration

### 2. **Configure Environment Variables**

#### **Development Service (`genplay-proxy-dev`):**
```env
NODE_ENV=development
DATABASE_URL=postgresql://... (auto-configured)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
VITE_TRIPO_AI_API_KEY=your-api-key
```

#### **Production Service (`genplay-proxy`):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://... (auto-configured)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend-url.onrender.com
VITE_TRIPO_AI_API_KEY=your-api-key
```

### 3. **Local Development Setup**

Create a `.env` file for local development:

```env
# Use development database
DATABASE_URL=postgresql://username:password@host:port/database

# Environment
NODE_ENV=development

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# API Key
VITE_TRIPO_AI_API_KEY=your-api-key

# Server Port
PORT=3001
```

## Environment URLs

After deployment, you'll have these URLs:

### **Development:**
- **API**: `https://genplay-proxy-dev.onrender.com`
- **Database**: `genplay-db-dev`

### **Production:**
- **API**: `https://genplay-proxy.onrender.com`
- **Database**: `genplay-db-prod`

## Workflow

### 🔄 **Development Workflow:**
1. **Local Development**: Use development database
2. **Test Features**: Safe testing with dev data
3. **Deploy to Dev**: Test on dev environment
4. **Deploy to Prod**: Deploy to production

### 🚀 **Deployment Workflow:**
1. **Develop locally** with dev database
2. **Test on dev environment** (`genplay-proxy-dev`)
3. **Deploy to production** (`genplay-proxy`)

## Database Management

### **Development Database:**
- **Purpose**: Local development and testing
- **Data**: Test subscribers, safe to reset
- **Access**: Development team only

### **Production Database:**
- **Purpose**: Live production data
- **Data**: Real subscribers, never reset
- **Access**: Production environment only

## Testing

### **Test Development Environment:**
```bash
# Test dev API
curl https://genplay-proxy-dev.onrender.com/health

# Test dev newsletter
curl -X POST https://genplay-proxy-dev.onrender.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### **Test Production Environment:**
```bash
# Test prod API
curl https://genplay-proxy.onrender.com/health

# Test prod newsletter
curl -X POST https://genplay-proxy.onrender.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Environment Variables Reference

| Variable | Dev Value | Prod Value | Description |
|----------|-----------|------------|-------------|
| `NODE_ENV` | `development` | `production` | Environment identifier |
| `DATABASE_URL` | Dev DB URL | Prod DB URL | Database connection |
| `EMAIL_USER` | Your email | Your email | Gmail address |
| `EMAIL_PASS` | App password | App password | Gmail app password |
| `FRONTEND_URL` | `http://localhost:3000` | `https://your-frontend.onrender.com` | Frontend URL |
| `VITE_TRIPO_AI_API_KEY` | Your key | Your key | API key |

## Benefits

### ✅ **Advantages:**
- **Isolated Environments**: Dev and prod are completely separate
- **Safe Testing**: Test without affecting production
- **Data Protection**: Production data is never at risk
- **Team Collaboration**: Shared development environment
- **Easy Deployment**: Simple promotion from dev to prod

### 🔒 **Security:**
- **Separate Databases**: No cross-contamination
- **Environment Isolation**: Dev can't access prod data
- **Secure Connections**: SSL encryption for all databases
- **Access Control**: Environment-specific permissions

## Monitoring

### **Development Monitoring:**
- Check dev service logs
- Monitor dev database performance
- Test new features safely

### **Production Monitoring:**
- Monitor production service health
- Track production database performance
- Monitor real user interactions

## Troubleshooting

### **Common Issues:**

1. **Wrong Database Connection**
   ```
   Check: DATABASE_URL environment variable
   Solution: Ensure correct database URL for environment
   ```

2. **Environment Mismatch**
   ```
   Check: NODE_ENV environment variable
   Solution: Set correct environment (development/production)
   ```

3. **Service Not Starting**
   ```
   Check: All required environment variables
   Solution: Verify all variables are set in Render dashboard
   ```

### **Debug Commands:**

```bash
# Check environment
echo $NODE_ENV

# Test database connection
node -e "
import { testConnection } from './src/database/newsletter.js';
testConnection().then(console.log);
"

# View database info
node -e "
import pool from './src/database/newsletter.js';
pool.query('SELECT current_database(), current_user').then(r => console.log(r.rows));
"
```

## Cost

### **Render Pricing:**
- **Free Tier**: 2 databases + 2 web services
- **Total Cost**: $0/month (free tier)
- **Scaling**: Upgrade individual services as needed

### **Resource Usage:**
- **Development**: Light usage, free tier sufficient
- **Production**: Monitor usage, upgrade if needed

Your environment is now properly separated with dedicated development and production databases! 🚀
