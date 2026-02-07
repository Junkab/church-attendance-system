/**
 * ============================================================================
 * MySQL Database Connection Pool
 * Church Attendance System - Railway Deployment
 * ============================================================================
 * 
 * This module creates and manages a MySQL connection pool for the Church
 * Attendance System deployed on Railway with MySQL addon.
 * 
 * Features:
 * - Production-ready connection pooling
 * - Environment variable validation
 * - Automatic SSL/TLS for Railway
 * - Connection testing on startup
 * - Comprehensive error handling
 * - No hardcoded defaults (uses only environment variables)
 * 
 * @module config/db
 */

const mysql = require('mysql2');

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================

/**
 * Validates that all required database environment variables are present.
 * Exits the application with a clear error message if any are missing.
 */
function validateEnvironment() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('\n╔══════════════════════════════════════════════════════════╗');
    console.error('║  ❌ FATAL ERROR: Missing Database Configuration         ║');
    console.error('╚══════════════════════════════════════════════════════════╝\n');
    console.error('The following required environment variables are not set:\n');
    missing.forEach(key => console.error(`  ✗ ${key}`));
    console.error('\n📋 For Railway deployment:');
    console.error('   1. Go to Railway Dashboard → Your Project → Variables');
    console.error('   2. Add all required variables listed above');
    console.error('   3. Redeploy your application\n');
    console.error('📋 For local development:');
    console.error('   1. Copy .env.example to .env');
    console.error('   2. Fill in your local MySQL credentials');
    console.error('   3. Restart your application\n');
    process.exit(1);
  }
}

// Validate environment variables before proceeding
validateEnvironment();

// ============================================================================
// CONNECTION POOL CONFIGURATION
// ============================================================================

/**
 * Determines if SSL should be enabled based on environment.
 * Railway MySQL requires SSL connections.
 */
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.DB_HOST?.includes('railway');
const requiresSSL = isProduction || isRailway;

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  🗄️  MySQL Connection Pool Initialization               ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');
console.log(`📍 Environment:  ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`🔐 SSL Required: ${requiresSSL ? 'YES (Railway MySQL)' : 'NO (Local dev)'}`);
console.log(`🌐 Host:         ${process.env.DB_HOST}`);
console.log(`🔢 Port:         ${process.env.DB_PORT}`);
console.log(`💾 Database:     ${process.env.DB_NAME}`);
console.log(`👤 User:         ${process.env.DB_USER}`);
console.log('');

/**
 * MySQL Connection Pool Configuration
 * 
 * Using connection pooling for:
 * - Better performance (connection reuse)
 * - Resource optimization
 * - Automatic connection management
 * - Request queuing when pool is busy
 */
const poolConfig = {
  // Database credentials from environment variables only
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  
  // Connection pool settings
  waitForConnections: true,  // Queue requests when pool is full
  connectionLimit: 10,       // Maximum 10 concurrent connections
  queueLimit: 0,             // Unlimited queue (adjust if needed)
  
  // Additional settings for Railway
  connectTimeout: 10000,     // 10 seconds to establish connection
  enableKeepAlive: true,     // Detect broken connections
  keepAliveInitialDelay: 0,  // Start keep-alive immediately
  
  // SSL configuration for Railway MySQL
  ...(requiresSSL && {
    ssl: {
      rejectUnauthorized: false  // Railway uses self-signed certificates
    }
  })
};

console.log('⚙️  Pool Configuration:');
console.log(`   • Connection Limit:  ${poolConfig.connectionLimit}`);
console.log(`   • Queue Limit:       ${poolConfig.queueLimit === 0 ? 'Unlimited' : poolConfig.queueLimit}`);
console.log(`   • Connect Timeout:   ${poolConfig.connectTimeout}ms`);
console.log(`   • SSL/TLS:           ${requiresSSL ? 'Enabled' : 'Disabled'}`);
console.log('');

// Create the connection pool
const pool = mysql.createPool(poolConfig);

// Get promise-based pool for async/await support
const promisePool = pool.promise();

// ============================================================================
// CONNECTION TESTING
// ============================================================================

/**
 * Tests the database connection on application startup.
 * Exits with error if connection fails.
 */
async function testConnection() {
  console.log('🔄 Testing database connection...\n');
  
  try {
    // Execute a simple test query
    const [rows] = await promisePool.query('SELECT 1 AS test');
    
    if (rows && rows[0].test === 1) {
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  ✅ Database connected successfully                      ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');
      console.log(`📊 Connection Details:`);
      console.log(`   • Host:     ${process.env.DB_HOST}`);
      console.log(`   • Database: ${process.env.DB_NAME}`);
      console.log(`   • Status:   Connected & Ready`);
      console.log(`   • Pool:     ${poolConfig.connectionLimit} connections available\n`);
      return true;
    }
  } catch (error) {
    console.error('\n╔══════════════════════════════════════════════════════════╗');
    console.error('║  ❌ Database Connection Failed                           ║');
    console.error('╚══════════════════════════════════════════════════════════╝\n');
    console.error(`Error: ${error.message}`);
    console.error(`Code:  ${error.code}\n`);
    
    // Provide specific guidance based on error type
    if (error.code === 'ECONNREFUSED') {
      console.error('🔍 Troubleshooting ECONNREFUSED:');
      console.error('   1. Verify MySQL service is running');
      console.error('   2. Check DB_HOST and DB_PORT are correct');
      console.error('   3. For Railway: Ensure MySQL addon is linked');
      console.error('   4. For Railway: Use mysql.railway.internal (not public host)\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔍 Troubleshooting Access Denied:');
      console.error('   1. Verify DB_USER and DB_PASSWORD are correct');
      console.error('   2. Check for typos or extra spaces in credentials');
      console.error('   3. For Railway: Copy password from MySQL → Connect tab\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🔍 Troubleshooting Bad Database:');
      console.error('   1. Verify DB_NAME is correct');
      console.error('   2. Check if database exists in MySQL');
      console.error('   3. For Railway: Default database is "railway"\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('🔍 Troubleshooting Timeout:');
      console.error('   1. Check network connectivity');
      console.error('   2. Verify firewall settings');
      console.error('   3. For Railway: Ensure app is in same project as MySQL\n');
    }
    
    console.error('Current Configuration:');
    console.error(`   DB_HOST: ${process.env.DB_HOST}`);
    console.error(`   DB_PORT: ${process.env.DB_PORT}`);
    console.error(`   DB_USER: ${process.env.DB_USER}`);
    console.error(`   DB_NAME: ${process.env.DB_NAME}\n`);
    
    process.exit(1);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global pool error handler for unexpected connection issues
 */
pool.on('error', (error) => {
  console.error('\n⚠️  Unexpected pool error:', error.message);
  
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('   → Connection to MySQL was lost');
    console.error('   → Pool will automatically reconnect\n');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('   → MySQL server refused connection');
    console.error('   → Check if MySQL service is running\n');
  } else {
    console.error('   → Unexpected error occurred');
    console.error('   → Check Railway logs for details\n');
  }
});

/**
 * Graceful shutdown handler
 * Ensures all connections are properly closed on application termination
 */
process.on('SIGTERM', async () => {
  console.log('\n📴 Received SIGTERM, closing database connections...');
  try {
    await pool.end();
    console.log('✅ Database connections closed gracefully\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing connections:', error.message);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('\n📴 Received SIGINT (Ctrl+C), closing database connections...');
  try {
    await pool.end();
    console.log('✅ Database connections closed gracefully\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing connections:', error.message);
    process.exit(1);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Test connection immediately on module load
testConnection();

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export the promise-based connection pool
 * 
 * Usage:
 *   const pool = require('./config/db');
 *   const [rows] = await pool.query('SELECT * FROM members');
 * 
 * @type {mysql.Pool}
 */
module.exports = promisePool;
