const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { sanitise, validateSmartSearch } = require('../middleware/validation');

router.get('/search', async (req, res) => {
  try {
    const errors = validateSmartSearch(req.query);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const term = sanitise(req.query.q);
    if (!term) {
      return res.status(400).json({ success: false, errors: ['q is required'] });
    }

    let sql, params;

    if (/^MBR-/i.test(term)) {
      sql = `
        SELECT id, member_id, first_name, last_name, phone, email, gender
        FROM members
        WHERE UPPER(member_id) = UPPER(?)
        LIMIT 1
      `;
      params = [term];
    } else {
      sql = `
        SELECT id, member_id, first_name, last_name, phone, email, gender
        FROM members
        WHERE phone LIKE ?
           OR first_name LIKE ?
           OR last_name  LIKE ?
           OR CONCAT(first_name, ' ', last_name) LIKE ?
        LIMIT 1
      `;
      const searchTerm = '%' + term + '%';
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No member found matching your search. Please check the details and try again.',
      });
    }

    return res.status(200).json({ success: true, member: rows[0] });

  } catch (err) {
    console.error('[Members] Search error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
