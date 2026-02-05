const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { validateAttendance } = require('../middleware/validation');

router.post('/register', async (req, res) => {
  try {
    const errors = validateAttendance(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const memberId  = req.body.member_id;
    const service   = req.body.service;
    const today     = new Date().toISOString().split('T')[0];

    const [dupCheck] = await pool.query(
      `SELECT id FROM attendance
       WHERE member_id = ? AND service = ? AND service_date = ?
       LIMIT 1`,
      [memberId, service, today]
    );

    if (dupCheck.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked in for this service today.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO attendance (member_id, service, service_date, check_in_time)
       VALUES (?, ?, ?, NOW())`,
      [memberId, service, today]
    );

    const [rows] = await pool.query(
      `SELECT id, member_id, service, service_date, check_in_time
       FROM attendance WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, attendance: rows[0] });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already checked in for this service today.',
      });
    }
    console.error('[Attendance] Register error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
