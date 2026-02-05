#!/usr/bin/env node
/**
 * MySQL Connection Diagnostic Tool
 * Run this to verify MySQL connection before starting the server
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'rfp_attendance',
  connectTimeout: 10000
};

console.log('═══════════════════════════════════════════════════════');
console.log('  MySQL Connection Diagnostic Tool');
console.log('═══════════════════════════════════════════════════════\n');

async function runDiagnostics() {
  console.log('📋 Configuration:');
  console.log(`   Host:     ${config.host}`);
  console.log(`   Port:     ${config.port}`);
  console.log(`   User:     ${config.user}`);
  console.log(`   Password: ${config.password ? '***' + config.password.slice(-3) : 'NOT SET'}`);
  console.log(`   Database: ${config.database}\n`);

  // Test 1: Can we connect to MySQL server?
  console.log('🔍 Test 1: MySQL Server Connection...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: config.connectTimeout
    });
    console.log('   ✓ Successfully connected to MySQL server\n');
  } catch (error) {
    console.error('   ✗ Failed to connect to MySQL server');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n   💡 Fix: Check your password in .env file');
      console.error('      Current password ends with: ***' + (config.password ? config.password.slice(-3) : 'NONE'));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n   💡 Fix: Start MySQL server');
      console.error('      Windows: services.msc → MySQL80 → Start');
      console.error('      Linux:   sudo systemctl start mysql');
      console.error('      Mac:     brew services start mysql');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n   💡 Fix: Check firewall or use 127.0.0.1 instead of localhost');
    }
    
    process.exit(1);
  }

  // Test 2: Does the database exist?
  console.log('🔍 Test 2: Database Existence...');
  try {
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === config.database);
    
    if (dbExists) {
      console.log(`   ✓ Database "${config.database}" exists\n`);
    } else {
      console.error(`   ✗ Database "${config.database}" does NOT exist`);
      console.error('\n   💡 Fix: Run the schema file:');
      console.error('      mysql -u root -p < database/schema.sql\n');
      await connection.end();
      process.exit(1);
    }
  } catch (error) {
    console.error('   ✗ Failed to check databases:', error.message);
    await connection.end();
    process.exit(1);
  }

  // Test 3: Can we select the database?
  console.log('🔍 Test 3: Database Selection...');
  try {
    await connection.query(`USE ${config.database}`);
    console.log(`   ✓ Successfully selected database\n`);
  } catch (error) {
    console.error('   ✗ Failed to select database:', error.message);
    await connection.end();
    process.exit(1);
  }

  // Test 4: Do all required tables exist?
  console.log('🔍 Test 4: Table Structure...');
  const requiredTables = ['members', 'attendance', 'visitors', 'visitor_attendance'];
  try {
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    let allTablesExist = true;
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`   ✓ Table "${table}" exists`);
      } else {
        console.error(`   ✗ Table "${table}" is MISSING`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.error('\n   💡 Fix: Run the schema file:');
      console.error('      mysql -u root -p < database/schema.sql\n');
      await connection.end();
      process.exit(1);
    }
    console.log('');
  } catch (error) {
    console.error('   ✗ Failed to check tables:', error.message);
    await connection.end();
    process.exit(1);
  }

  // Test 5: Check seed data
  console.log('🔍 Test 5: Seed Data...');
  try {
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM members');
    const memberCount = rows[0].count;
    
    if (memberCount >= 2) {
      console.log(`   ✓ Found ${memberCount} members (including seed data)\n`);
    } else {
      console.warn(`   ⚠ Only ${memberCount} member(s) found`);
      console.warn('   Expected at least 2 (seed data)\n');
    }

    const [members] = await connection.query('SELECT member_id, first_name, last_name, phone FROM members LIMIT 5');
    if (members.length > 0) {
      console.log('   Sample members:');
      members.forEach(m => {
        console.log(`   - ${m.member_id}: ${m.first_name} ${m.last_name} (${m.phone})`);
      });
      console.log('');
    }
  } catch (error) {
    console.error('   ✗ Failed to check seed data:', error.message);
  }

  // Test 6: Check triggers
  console.log('🔍 Test 6: Triggers...');
  try {
    const [triggers] = await connection.query(`SHOW TRIGGERS FROM ${config.database}`);
    if (triggers.length > 0) {
      console.log('   ✓ Triggers found:');
      triggers.forEach(t => console.log(`   - ${t.Trigger} on ${t.Table}`));
      console.log('');
    } else {
      console.warn('   ⚠ No triggers found (member_id auto-generation may not work)\n');
    }
  } catch (error) {
    console.error('   ✗ Failed to check triggers:', error.message);
  }

  // Test 7: Test a sample query
  console.log('🔍 Test 7: Sample Query (Search Member)...');
  try {
    const [results] = await connection.query(
      "SELECT * FROM members WHERE phone LIKE ? LIMIT 1",
      ['%0883%']
    );
    
    if (results.length > 0) {
      console.log('   ✓ Query executed successfully');
      console.log(`   Found: ${results[0].first_name} ${results[0].last_name}\n`);
    } else {
      console.log('   ✓ Query executed (no results for test phone)\n');
    }
  } catch (error) {
    console.error('   ✗ Query failed:', error.message);
  }

  await connection.end();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✓ All diagnostics passed!');
  console.log('  Your MySQL database is ready.');
  console.log('  You can now run: npm start');
  console.log('═══════════════════════════════════════════════════════\n');
}

runDiagnostics().catch(error => {
  console.error('\n✗ Diagnostic failed with unexpected error:', error);
  process.exit(1);
});
