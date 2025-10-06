# Local Development Setup

## Overview
This guide helps you set up local development with a dedicated development database on Render.

## Quick Setup

### 1. **Get Development Database URL from Render**

1. Go to your Render dashboard
2. Find your PostgreSQL database service (`genplay-db-dev`)
3. Copy the **External Database URL**

### 2. **Create Local Environment File**

Create a `.env` file in your project root:

```env
# Database (Development)
DATABASE_URL=postgresql://username:password@host:port/database

# Environment
NODE_ENV=development

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for confirmation links)
FRONTEND_URL=http://localhost:3000

# API Key
VITE_TRIPO_AI_API_KEY=your-api-key-here

# Server Port
PORT=3001
```

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Start Development Server**

```bash
# Start the proxy server
npm run proxy
```

The server will:
- ✅ Connect to your Render PostgreSQL database
- ✅ Create tables automatically
- ✅ Start on port 3001

### 5. **Start Frontend (in another terminal)**

```bash
# Start the React app
npm run dev
```

## Benefits of Separate Development Database

### ✅ **Advantages:**
- **Isolated Development**: Separate database for development
- **Safe Testing**: Test without affecting production data
- **Real Data**: Test with actual subscriber data structure
- **No Data Loss**: Data persists between restarts
- **Team Collaboration**: Shared development database for team
- **Production Safety**: No risk of corrupting production data

### 🔄 **Workflow:**
1. **Develop locally** with development database
2. **Test features** with development data
3. **Deploy to production** with production database
4. **Clean separation** between environments

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string from Render (dev database) |
| `NODE_ENV` | Yes | Environment (development/production) |
| `EMAIL_USER` | Yes | Your Gmail address |
| `EMAIL_PASS` | Yes | Gmail app password |
| `FRONTEND_URL` | Yes | Frontend URL for confirmation links |
| `VITE_TRIPO_AI_API_KEY` | Yes | Your Tripo3D API key |
| `PORT` | No | Server port (default: 3001) |

## Testing

### **Test Database Connection**
```bash
curl http://localhost:3001/health
```

### **Test Newsletter Subscription**
```bash
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### **Test Admin Endpoints**
```bash
# Get subscribers
curl http://localhost:3001/api/newsletter/subscribers

# Send newsletter
curl -X POST http://localhost:3001/api/newsletter/send \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test","content":"Test content"}'
```

## Database Management

### **View Data**
You can view your database data in the Render dashboard:
1. Go to your PostgreSQL service
2. Click "Connect" → "External Connection"
3. Use a PostgreSQL client (like pgAdmin or DBeaver)

### **Reset Data**
If you need to reset the database:
```sql
-- Connect to your database and run:
DELETE FROM newsletter_subscribers;
```

### **Backup Data**
```bash
# Export all subscribers
curl http://localhost:3001/api/newsletter/subscribers > backup.json
```

## Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   ```
   Error: Database connection failed
   Solution: Check DATABASE_URL in .env file
   ```

2. **Email Sending Failed**
   ```
   Error: Email service not configured
   Solution: Check EMAIL_USER and EMAIL_PASS
   ```

3. **Port Already in Use**
   ```
   Error: Port 3001 is already in use
   Solution: Change PORT in .env file or kill existing process
   ```

### **Debug Commands**

```bash
# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Test database connection
node -e "
import { testConnection } from './src/database/newsletter.js';
testConnection().then(console.log);
"

# View database tables
node -e "
import pool from './src/database/newsletter.js';
pool.query('SELECT * FROM newsletter_subscribers LIMIT 5').then(r => console.log(r.rows));
"
```

## Development Tips

### **Hot Reloading**
- Frontend: Automatic reload on file changes
- Backend: Restart server after code changes

### **Database Changes**
- Tables are created automatically on startup
- Schema changes require server restart

### **Testing**
- Use real email addresses for testing
- Check email delivery in your inbox
- Test confirmation flow end-to-end

## Production Deployment

When you're ready to deploy:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Update newsletter system"
   git push origin main
   ```

2. **Deploy to Render:**
   - Render will automatically deploy
   - Database is already configured
   - Environment variables are set in Render dashboard

3. **Verify deployment:**
   ```bash
   curl https://your-proxy-url.onrender.com/health
   ```

## Security Notes

- ✅ Database connection uses SSL encryption
- ✅ Environment variables are not committed to git
- ✅ Email credentials are secure
- ✅ Database access is limited to your services

Your local development environment is now ready with the same database as production! 🚀
