const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { sanitise, validateVisitor } = require('../middleware/validation');

router.post('/register', async (req, res) => {
  try {
    const errors = validateVisitor(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const fullName  = sanitise(req.body.full_name);
    const phone     = sanitise(req.body.phone) || null;
    const gender    = sanitise(req.body.gender);
    const firstTime = req.body.first_time;
    const service   = req.body.service;
    const today     = new Date().toISOString().split('T')[0];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [visitorResult] = await connection.query(
        `INSERT INTO visitors (full_name, phone, gender, first_time, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [fullName, phone, gender, firstTime]
      );

      const [visitorRows] = await connection.query(
        `SELECT id, full_name, phone, gender, first_time, created_at
         FROM visitors WHERE id = ?`,
        [visitorResult.insertId]
      );

      const visitor = visitorRows[0];

      const [attendanceResult] = await connection.query(
        `INSERT INTO visitor_attendance (visitor_id, service, service_date, check_in_time)
         VALUES (?, ?, ?, NOW())`,
        [visitor.id, service, today]
      );

      const [attendanceRows] = await connection.query(
        `SELECT id, visitor_id, service, service_date, check_in_time
         FROM visitor_attendance WHERE id = ?`,
        [attendanceResult.insertId]
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        visitor:    visitor,
        attendance: attendanceRows[0],
      });

    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error('[Visitors] Register error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
