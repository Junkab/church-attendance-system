const mysql = require('mysql2/promise');
require('dotenv').config();

// Enhanced connection pool configuration
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT, 10) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME     || 'rfp_attendance',
  
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // Timeout settings to prevent ETIMEDOUT
  connectTimeout: 10000,    // 10 seconds to establish connection
  acquireTimeout: 10000,    // 10 seconds to acquire connection from pool
  timeout: 60000,           // 60 seconds for query execution
  
  // MySQL settings
  timezone: '+00:00',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: false,
  dateStrings: false,
  
  // Prevent connection drops
  multipleStatements: false
});

// Test connection on startup with retry logic
async function testConnection(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('[DB] MySQL connection established successfully');
      console.log(`[DB] Connected to: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
      console.log(`[DB] Database: ${process.env.DB_NAME || 'rfp_attendance'}`);
      
      // Test query
      await connection.query('SELECT 1');
      connection.release();
      return true;
    } catch (err) {
      console.error(`[DB] Connection attempt ${i + 1}/${retries} failed:`, err.message);
      
      if (i < retries - 1) {
        console.log(`[DB] Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('[DB] All connection attempts failed');
        console.error('[DB] Please check:');
        console.error('    - MySQL server is running');
        console.error('    - Credentials in .env are correct');
        console.error('    - Database "rfp_attendance" exists');
        console.error('    - Host/port are accessible');
        process.exit(1);
      }
    }
  }
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('[DB] Database connection lost. Reconnecting...');
  }
});

// Test connection immediately
testConnection();

module.exports = pool;
