/**
 * ============================================================================
 * Express Server - Church Attendance System
 * ============================================================================
 * 
 * Main application server with:
 * - Environment variable loading
 * - Database connection
 * - CORS configuration
 * - API routes
 * - Error handling
 * - Graceful shutdown
 * 
 * @author Church Attendance System
 * @version 2.0.0
 */

// Load environment variables first (for local development)
// Railway provides env vars directly, so dotenv is optional in production
try {
  require('dotenv').config();
} catch (err) {
  console.log('[ENV] Using platform environment variables (dotenv not loaded)');
}

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

// Import routes
const membersRouter = require('./routes/members');
const attendanceRouter = require('./routes/attendance');
const visitorsRouter = require('./routes/visitors');
const historyRouter = require('./routes/history');

// ============================================================================
// APP INITIALIZATION
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3001;

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  🚀 Church Attendance System - Backend Server           ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * CORS Configuration
 * Allows frontend (Render) to make requests to backend (Railway)
 */
const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || 'https://church-frontend-ql69.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      db: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      db: 'disconnected',
      error: error.message 
    });
  }
});

// API routes
app.use('/api/members', membersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/visitors', visitorsRouter);
app.use('/api/history', historyRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Church Attendance System API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      members: '/api/members',
      attendance: '/api/attendance',
      visitors: '/api/visitors',
      history: '/api/history'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.path
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global error handler
 * Catches all unhandled errors in routes
 */
app.use((err, req, res, next) => {
  console.error('\n⚠️  Unhandled Error:');
  console.error('   Path:', req.path);
  console.error('   Method:', req.method);
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);
  
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the Express server
 */
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  ✅ Server Started Successfully                          ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');
      console.log(`📍 Server running on port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_ORIGIN}`);
      console.log(`\n🎯 API Endpoints:`);
      console.log(`   • Health: http://localhost:${PORT}/api/health`);
      console.log(`   • Members: http://localhost:${PORT}/api/members`);
      console.log(`   • Attendance: http://localhost:${PORT}/api/attendance`);
      console.log(`   • Visitors: http://localhost:${PORT}/api/visitors`);
      console.log(`   • History: http://localhost:${PORT}/api/history\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Handle graceful shutdown
 */
async function gracefulShutdown(signal) {
  console.log(`\n📴 Received ${signal}, shutting down gracefully...`);
  
  // Close server (stop accepting new connections)
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  // Database connections are already handled by db.js
  
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000); // Force shutdown after 10 seconds
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = app;
