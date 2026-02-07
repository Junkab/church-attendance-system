/**
 * ============================================================================
 * MySQL Connection Diagnostic Tool
 * Church Attendance System
 * ============================================================================
 * 
 * This utility helps diagnose MySQL connection issues.
 * Run with: node src/diagnose.js
 * 
 * It will test:
 * - Environment variables
 * - MySQL connection
 * - SSL/TLS configuration
 * - Basic queries
 * 
 * @author Church Attendance System
 * @version 2.0.0
 */

// Load environment variables
try {
  require('dotenv').config();
  console.log('✅ Environment variables loaded from .env\n');
} catch (err) {
  console.log('ℹ️  No .env file found (using system environment variables)\n');
}

const mysql = require('mysql2/promise');

// ============================================================================
// DIAGNOSTIC TESTS
// ============================================================================

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  🔍 MySQL Connection Diagnostic Tool                    ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

/**
 * Test 1: Check Environment Variables
 */
function testEnvironmentVariables() {
  console.log('📋 Test 1: Environment Variables');
  console.log('─────────────────────────────────\n');
  
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  let allPresent = true;
  
  required.forEach(key => {
    const value = process.env[key];
    if (value) {
      // Mask password
      const displayValue = key === 'DB_PASSWORD' 
        ? '*'.repeat(value.length) 
        : value;
      console.log(`✅ ${key.padEnd(15)} = ${displayValue}`);
    } else {
      console.log(`❌ ${key.padEnd(15)} = NOT SET`);
      allPresent = false;
    }
  });
  
  console.log('');
  return allPresent;
}

/**
 * Test 2: Detect Environment
 */
function testEnvironmentDetection() {
  console.log('🌐 Test 2: Environment Detection');
  console.log('─────────────────────────────────\n');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailway = process.env.DB_HOST?.includes('railway');
  const requiresSSL = isProduction || isRailway;
  
  console.log(`NODE_ENV:      ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Is Production: ${isProduction ? 'YES' : 'NO'}`);
  console.log(`Is Railway:    ${isRailway ? 'YES' : 'NO'}`);
  console.log(`Requires SSL:  ${requiresSSL ? 'YES' : 'NO'}\n`);
  
  return { isProduction, isRailway, requiresSSL };
}

/**
 * Test 3: Test MySQL Connection
 */
async function testConnection(requiresSSL) {
  console.log('🔌 Test 3: MySQL Connection');
  console.log('─────────────────────────────────\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000,
    ...(requiresSSL && {
      ssl: {
        rejectUnauthorized: false
      }
    })
  };
  
  console.log('Connection Configuration:');
  console.log(`  Host:     ${config.host}`);
  console.log(`  Port:     ${config.port}`);
  console.log(`  User:     ${config.user}`);
  console.log(`  Password: ${'*'.repeat(config.password?.length || 0)}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  SSL:      ${requiresSSL ? 'Enabled' : 'Disabled'}\n`);
  
  try {
    console.log('Attempting connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection established!\n');
    
    // Test query
    console.log('Testing SELECT query...');
    const [rows] = await connection.query('SELECT 1 AS test, NOW() AS server_time');
    console.log('✅ Query successful!');
    console.log(`   Server Time: ${rows[0].server_time}\n`);
    
    // Get server info
    console.log('Getting server info...');
    const [serverInfo] = await connection.query('SELECT VERSION() AS version');
    console.log(`✅ MySQL Version: ${serverInfo[0].version}\n`);
    
    // Test database access
    console.log('Testing database access...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Database accessible`);
    console.log(`   Tables found: ${tables.length}\n`);
    
    await connection.end();
    console.log('✅ Connection closed gracefully\n');
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error(`Error Code:    ${error.code}`);
    console.error(`Error Message: ${error.message}\n`);
    
    // Provide specific guidance
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Troubleshooting ECONNREFUSED:');
      console.error('   1. MySQL service is not running');
      console.error('   2. Wrong host or port');
      console.error('   3. Firewall blocking connection');
      console.error('   4. For Railway: Use mysql.railway.internal\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Troubleshooting Access Denied:');
      console.error('   1. Wrong username or password');
      console.error('   2. User does not have permissions');
      console.error('   3. For Railway: Check MySQL addon credentials\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Troubleshooting Bad Database:');
      console.error('   1. Database does not exist');
      console.error('   2. Wrong database name');
      console.error('   3. For Railway: Default is "railway"\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('💡 Troubleshooting Timeout:');
      console.error('   1. Network connectivity issues');
      console.error('   2. Firewall blocking traffic');
      console.error('   3. MySQL server not responding\n');
    }
    
    return false;
  }
}

/**
 * Test 4: Test Connection Pool
 */
async function testConnectionPool(requiresSSL) {
  console.log('🏊 Test 4: Connection Pool');
  console.log('─────────────────────────────────\n');
  
  const poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ...(requiresSSL && {
      ssl: {
        rejectUnauthorized: false
      }
    })
  };
  
  try {
    console.log('Creating connection pool...');
    const pool = mysql.createPool(poolConfig);
    const promisePool = pool.promise();
    console.log('✅ Pool created\n');
    
    console.log('Testing pool query...');
    const [rows] = await promisePool.query('SELECT 1 AS pool_test');
    console.log('✅ Pool query successful!\n');
    
    console.log('Testing multiple concurrent queries...');
    const promises = Array(5).fill(null).map((_, i) => 
      promisePool.query('SELECT ? AS query_num', [i + 1])
    );
    await Promise.all(promises);
    console.log('✅ Concurrent queries successful!\n');
    
    await pool.end();
    console.log('✅ Pool closed gracefully\n');
    
    return true;
  } catch (error) {
    console.error('❌ Pool test failed!\n');
    console.error(`Error: ${error.message}\n`);
    return false;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runDiagnostics() {
  console.log('Starting diagnostics...\n');
  
  // Test 1: Environment Variables
  const envVarsOk = testEnvironmentVariables();
  
  if (!envVarsOk) {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  ❌ Diagnostics Failed: Missing Environment Variables   ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log('Please set all required environment variables and try again.\n');
    process.exit(1);
  }
  
  // Test 2: Environment Detection
  const { requiresSSL } = testEnvironmentDetection();
  
  // Test 3: Connection
  const connectionOk = await testConnection(requiresSSL);
  
  if (!connectionOk) {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  ❌ Diagnostics Failed: Connection Error                ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    process.exit(1);
  }
  
  // Test 4: Connection Pool
  const poolOk = await testConnectionPool(requiresSSL);
  
  // Final Summary
  console.log('╔══════════════════════════════════════════════════════════╗');
  if (connectionOk && poolOk) {
    console.log('║  ✅ All Diagnostics Passed!                              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log('🎉 MySQL connection is working correctly!\n');
    console.log('Your configuration:');
    console.log(`   • Host:     ${process.env.DB_HOST}`);
    console.log(`   • Database: ${process.env.DB_NAME}`);
    console.log(`   • SSL:      ${requiresSSL ? 'Enabled' : 'Disabled'}`);
    console.log('\n✅ You can now start your application with: npm start\n');
  } else {
    console.log('║  ❌ Some Diagnostics Failed                              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log('Please fix the errors above and try again.\n');
  }
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('\n❌ Unexpected error during diagnostics:');
  console.error(error);
  process.exit(1);
});
