require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const pool      = require('./config/db');

const membersRouter    = require('./routes/members');
const attendanceRouter = require('./routes/attendance');
const visitorsRouter   = require('./routes/visitors');
const historyRouter    = require('./routes/history');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

app.use('/api/members',    membersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/visitors',   visitorsRouter);
app.use('/api/history',    historyRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[Express] Unhandled:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function ensureSeed() {
  try {
    await pool.query(`
      INSERT INTO members (first_name, last_name, phone, email, gender, member_id)
      VALUES
        ('Mathews', 'Dube',  '0883727116', 'matthewdube77@gmail.com', 'Male', 
         CONCAT('MBR-', UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8)))),
        ('Rose',    'Dube',  '0882531736', 'rose@gmail.com',           'Female',
         CONCAT('MBR-', UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8))))
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name  = VALUES(last_name),
        email      = VALUES(email),
        gender     = VALUES(gender)
    `);
    console.log('[Seed] Seed data ensured');
  } catch (err) {
    console.error('[Seed] Could not ensure seed data:', err.message);
  }
}

app.listen(PORT, async () => {
  await ensureSeed();
  console.log(`\n  ✦ RFP Attendance Backend (MySQL) running on http://localhost:${PORT}\n`);
});

module.exports = app;
