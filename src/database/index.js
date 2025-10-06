import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create newsletter_subscribers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
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
      )
    `);

    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
    `);

    // Create a general users table for future use
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for users table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create a general settings table for future use
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for settings table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
    `);

    console.log('✅ Database tables initialized successfully');
    console.log('📊 Tables created: newsletter_subscribers, users, settings');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// General database utilities
export const db = {
  // Test database connection
  async testConnection() {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  },

  // Get database info
  async getInfo() {
    try {
      const result = await pool.query('SELECT current_database(), current_user, version()');
      return result.rows[0];
    } catch (error) {
      console.error('❌ Database info error:', error);
      return null;
    }
  },

  // Execute raw query
  async query(text, params) {
    return await pool.query(text, params);
  }
};

// Newsletter database operations
export const newsletterDB = {
  // Add new subscriber
  async addSubscriber(subscriberData) {
    const { email, status, verificationToken, verificationExpiry } = subscriberData;
    
    const query = `
      INSERT INTO newsletter_subscribers (email, status, verification_token, verification_expiry)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        status = $2,
        verification_token = $3,
        verification_expiry = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [email, status, verificationToken, verificationExpiry];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get subscriber by email
  async getSubscriberByEmail(email) {
    const query = 'SELECT * FROM newsletter_subscribers WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Get subscriber by verification token
  async getSubscriberByToken(token) {
    const query = 'SELECT * FROM newsletter_subscribers WHERE verification_token = $1 AND status = $2';
    const result = await pool.query(query, [token, 'pending']);
    return result.rows[0];
  },

  // Verify subscriber
  async verifySubscriber(email) {
    const query = `
      UPDATE newsletter_subscribers 
      SET status = 'active', 
          verified_at = CURRENT_TIMESTAMP,
          verification_token = NULL,
          verification_expiry = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = $1 AND status = 'pending'
      RETURNING *
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Unsubscribe user
  async unsubscribeUser(email) {
    const query = `
      UPDATE newsletter_subscribers 
      SET status = 'unsubscribed', 
          unsubscribed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = $1 AND status = 'active'
      RETURNING *
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Get all subscribers with counts
  async getAllSubscribers() {
    const query = `
      SELECT 
        email,
        subscribed_at,
        status,
        verified_at,
        unsubscribed_at,
        (SELECT COUNT(*) FROM newsletter_subscribers) as total_count,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active') as active_count,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'pending') as pending_count,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'unsubscribed') as unsubscribed_count
      FROM newsletter_subscribers 
      ORDER BY subscribed_at DESC
    `;
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return {
        subscribers: [],
        counts: { total: 0, active: 0, pending: 0, unsubscribed: 0 }
      };
    }

    const firstRow = result.rows[0];
    const counts = {
      total: parseInt(firstRow.total_count),
      active: parseInt(firstRow.active_count),
      pending: parseInt(firstRow.pending_count),
      unsubscribed: parseInt(firstRow.unsubscribed_count)
    };

    const subscribers = result.rows.map(row => ({
      email: row.email,
      subscribedAt: row.subscribed_at,
      status: row.status,
      verifiedAt: row.verified_at,
      unsubscribedAt: row.unsubscribed_at
    }));

    return { subscribers, counts };
  },

  // Get active subscribers only
  async getActiveSubscribers() {
    const query = 'SELECT email FROM newsletter_subscribers WHERE status = $1';
    const result = await pool.query(query, ['active']);
    return result.rows.map(row => ({ email: row.email }));
  },

  // Clean up expired verification tokens
  async cleanupExpiredTokens() {
    const query = `
      DELETE FROM newsletter_subscribers 
      WHERE status = 'pending' 
      AND verification_expiry < CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query);
    return result.rowCount;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

export default pool;
