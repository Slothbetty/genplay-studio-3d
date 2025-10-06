# Database Schema Documentation

## Overview
This document describes the database schema for the GenPlay AI application. The database is designed to be generic and extensible for various features beyond just newsletters.

## Database Structure

### **Database Names:**
- **Development**: `genplay_db_dev`
- **Production**: `genplay_db_prod`

### **Database Users:**
- **Development**: `genplay_user_dev`
- **Production**: `genplay_user_prod`

## Tables

### 1. **newsletter_subscribers**
Newsletter subscription management.

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

**Columns:**
- `id` - Primary key
- `email` - Subscriber email address (unique)
- `subscribed_at` - When they first subscribed
- `status` - Subscription status: 'pending', 'active', 'unsubscribed'
- `verification_token` - Email verification token
- `verification_expiry` - Token expiration time
- `verified_at` - When email was verified
- `unsubscribed_at` - When they unsubscribed
- `created_at` - Record creation time
- `updated_at` - Last update time

**Indexes:**
- `idx_newsletter_email` - On email column
- `idx_newsletter_status` - On status column

### 2. **users**
General user management (for future features).

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Primary key
- `email` - User email address (unique)
- `name` - User's display name
- `status` - User status: 'active', 'inactive', 'suspended'
- `created_at` - Record creation time
- `updated_at` - Last update time

**Indexes:**
- `idx_users_email` - On email column

### 3. **settings**
Application settings and configuration.

```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Primary key
- `key` - Setting key (unique)
- `value` - Setting value
- `description` - Setting description
- `created_at` - Record creation time
- `updated_at` - Last update time

**Indexes:**
- `idx_settings_key` - On key column

## Database Operations

### **General Database Utilities**

```javascript
import { db } from './src/database/index.js';

// Test connection
await db.testConnection();

// Get database info
const info = await db.getInfo();

// Execute raw query
const result = await db.query('SELECT * FROM users WHERE status = $1', ['active']);
```

### **Newsletter Operations**

```javascript
import { newsletterDB } from './src/database/index.js';

// Add subscriber
await newsletterDB.addSubscriber({
  email: 'user@example.com',
  status: 'pending',
  verificationToken: 'token123',
  verificationExpiry: new Date()
});

// Get subscriber
const subscriber = await newsletterDB.getSubscriberByEmail('user@example.com');

// Verify subscriber
await newsletterDB.verifySubscriber('user@example.com');

// Get all subscribers
const { subscribers, counts } = await newsletterDB.getAllSubscribers();
```

## API Endpoints

### **Database Info**
```http
GET /api/db/info
```

**Response:**
```json
{
  "success": true,
  "database": {
    "current_database": "genplay_db_dev",
    "current_user": "genplay_user_dev",
    "version": "PostgreSQL 15.4"
  },
  "environment": "development"
}
```

### **Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "GenPlay Proxy Server Running",
  "environment": "development",
  "port": 3001
}
```

## Future Extensions

### **Potential Additional Tables:**

1. **projects** - 3D project management
2. **models** - 3D model metadata
3. **api_keys** - API key management
4. **usage_logs** - API usage tracking
5. **payments** - Payment and subscription management
6. **notifications** - User notifications
7. **analytics** - Usage analytics

### **Example Future Schema:**

```sql
-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Models table
CREATE TABLE models (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_size BIGINT,
  file_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security

### **Connection Security:**
- SSL encryption for all connections
- Environment-specific database access
- Connection pooling for efficiency

### **Data Protection:**
- Prepared statements prevent SQL injection
- Environment isolation (dev/prod separation)
- Regular backups (automatic on Render)

### **Access Control:**
- Database users have minimal required permissions
- No direct database access from external sources
- API-based access only

## Performance

### **Indexing Strategy:**
- Primary keys on all tables
- Unique indexes on email fields
- Status indexes for filtering
- Key indexes for settings lookup

### **Query Optimization:**
- Connection pooling
- Prepared statements
- Efficient data types
- Proper indexing

## Backup and Recovery

### **Automatic Backups:**
- Render provides daily automatic backups
- 7-day retention on free tier
- Manual backup capability

### **Manual Backup:**
```bash
# Export newsletter data
curl https://your-api-url.onrender.com/api/newsletter/subscribers > backup.json

# Database backup (via Render dashboard)
# Go to database service → Backups → Create backup
```

## Monitoring

### **Database Health:**
```bash
# Check database connection
curl https://your-api-url.onrender.com/api/db/info

# Check service health
curl https://your-api-url.onrender.com/health
```

### **Performance Monitoring:**
- Render dashboard provides database metrics
- Connection count monitoring
- Query performance tracking
- Storage usage monitoring

## Migration and Updates

### **Schema Updates:**
1. Update database initialization code
2. Deploy to development environment
3. Test schema changes
4. Deploy to production environment

### **Data Migration:**
```javascript
// Example migration script
const migrateData = async () => {
  // Add new column
  await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
  
  // Update existing data
  await db.query('UPDATE users SET phone = \'N/A\' WHERE phone IS NULL');
  
  // Create new index
  await db.query('CREATE INDEX idx_users_phone ON users(phone)');
};
```

This database schema provides a solid foundation for the GenPlay AI application with room for future growth and feature expansion.
