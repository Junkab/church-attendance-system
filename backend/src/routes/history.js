const express = require('express');
const router  = express.Router();
const PDFDocument = require('pdfkit');
const pool    = require('../config/db');

const VALID_PIN = '1234';

function requirePin(req, res, next) {
  const pin = req.query.pin || (req.body && req.body.pin);
  if (!pin || String(pin) !== VALID_PIN) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing PIN. Access denied.',
    });
  }
  next();
}

router.use(requirePin);

const HISTORY_SQL = `
  SELECT
    CONCAT(m.first_name, ' ', m.last_name) AS name,
    'Member' AS type,
    m.phone AS phone,
    m.gender AS gender,
    a.service AS service,
    a.service_date AS service_date,
    a.check_in_time AS check_in_time
  FROM attendance a
  JOIN members m ON a.member_id = m.id

  UNION ALL

  SELECT
    v.full_name AS name,
    'Visitor' AS type,
    COALESCE(v.phone, '-') AS phone,
    v.gender AS gender,
    va.service AS service,
    va.service_date AS service_date,
    va.check_in_time AS check_in_time
  FROM visitor_attendance va
  JOIN visitors v ON va.visitor_id = v.id

  ORDER BY service_date DESC, check_in_time DESC
`;

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(HISTORY_SQL);
    return res.status(200).json({ success: true, records: rows });
  } catch (err) {
    console.error('[History] Query error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      detail: err.message || 'Unknown error',
    });
  }
});

// Delete all attendance history (members + visitors), protected by the same PIN
router.delete('/', async (_req, res) => {
  try {
    // Use TRUNCATE to avoid safe-update restrictions on DELETE without WHERE
    const [memberResult]  = await pool.query('TRUNCATE TABLE attendance');
    const [visitorResult] = await pool.query('TRUNCATE TABLE visitor_attendance');
    return res.status(200).json({
      success: true,
      deleted: {
        attendance:        memberResult.affectedRows || 0,
        visitor_attendance: visitorResult.affectedRows || 0,
      },
    });
  } catch (err) {
    console.error('[History] Delete error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete history',
    });
  }
});

router.get('/pdf', async (_req, res) => {
  try {
    const [rows] = await pool.query(HISTORY_SQL);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="RFP_Attendance_History.pdf"');

    const doc = new PDFDocument({ autoFirstPage: true, margin: 48 });
    doc.pipe(res);

    const pageW   = doc.page.width;
    const pageH   = doc.page.height;
    const margin  = 48;
    const colW    = pageW - margin * 2;

    const BG        = '#0f0f1a';
    const GOLD      = '#c8aa64';
    const GOLD_DIM  = '#6b5a2e';
    const TEXT      = '#e8e0d0';
    const TEXT_DIM  = '#8a8278';
    const ROW_EVEN  = '#161625';
    const ROW_ODD   = '#1e1e32';
    const HDR_BG    = '#1a1a2e';

    doc.rect(0, 0, pageW, pageH).fill(BG);
    doc.rect(0, 0, pageW, 6).fill(GOLD);

    doc.moveDown(0.6);
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(22).text('RFP Ministries', { align: 'center' });
    doc.fillColor(TEXT_DIM).font('Helvetica').fontSize(10).text('Raised For a Purpose', { align: 'center' });

    doc.moveDown(0.5);
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(15).text('Attendance History', { align: 'center' });

    const now = new Date();
    const genLabel = 'Generated: ' + now.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    }) + '  |  ' + now.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    doc.fillColor(TEXT_DIM).font('Helvetica').fontSize(9).text(genLabel, { align: 'center' });

    doc.moveDown(0.4);
    const ruleY = doc.y;
    doc.moveTo(margin, ruleY).lineTo(pageW - margin, ruleY).strokeColor(GOLD_DIM).lineWidth(0.7).stroke();
    doc.moveDown(0.5);

    const cols = [
      { key: 'name',        label: 'Name',        w: 0.22 },
      { key: 'type',        label: 'Type',        w: 0.10 },
      { key: 'phone',       label: 'Phone',       w: 0.16 },
      { key: 'gender',      label: 'Gender',      w: 0.10 },
      { key: 'service',     label: 'Service',     w: 0.22 },
      { key: 'service_date',label: 'Date',        w: 0.10 },
      { key: 'check_in_time',label: 'Check-in',   w: 0.10 },
    ];

    const totalRatio = cols.reduce((s, c) => s + c.w, 0);
    cols.forEach(c => { c.px = (c.w / totalRatio) * colW; });

    const rowH     = 22;
    const headerH  = 26;
    let curY       = doc.y;

    function drawHeader(y) {
      let x = margin;
      doc.rect(margin, y, colW, headerH).fill(HDR_BG);
      doc.moveTo(margin, y).lineTo(margin + colW, y).strokeColor(GOLD).lineWidth(1).stroke();

      cols.forEach(col => {
        doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8.5)
          .text(col.label, x + 6, y + 8, { width: col.px - 12, lineBreak: false, ellipsis: true });
        x += col.px;
      });
      return y + headerH;
    }

    function drawRow(y, row, isEven) {
      let x = margin;
      doc.rect(margin, y, colW, rowH).fill(isEven ? ROW_EVEN : ROW_ODD);

      cols.forEach(col => {
        let val = row[col.key];
        if (col.key === 'check_in_time' && val) {
          const d = new Date(val);
          val = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        if (col.key === 'service_date' && val) {
          const d = new Date(val);
          val = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        const textCol = (col.key === 'type')
          ? (val === 'Member' ? '#5ebd7a' : '#c8aa64')
          : TEXT;

        doc.fillColor(textCol).font('Helvetica').fontSize(8)
          .text(String(val || '—'), x + 6, y + 7, { width: col.px - 12, lineBreak: false, ellipsis: true });
        x += col.px;
      });
      return y + rowH;
    }

    function remainingSpace(y) {
      return pageH - margin - y;
    }

    curY = drawHeader(curY);
    let rowIndex = 0;

    for (const row of rows) {
      if (remainingSpace(curY) < rowH + 10) {
        doc.addPage();
        doc.rect(0, 0, pageW, pageH).fill(BG);
        doc.rect(0, 0, pageW, 6).fill(GOLD);

        curY = margin + 18;
        doc.fillColor(TEXT_DIM).font('Helvetica').fontSize(8)
          .text('RFP Ministries – Attendance History (continued)', margin, curY, { align: 'center', width: colW });
        curY += 16;
        curY = drawHeader(curY);
        rowIndex = 0;
      }

      curY = drawRow(curY, row, rowIndex % 2 === 0);
      rowIndex++;
    }

    if (rows.length === 0) {
      doc.moveDown(1);
      doc.fillColor(TEXT_DIM).font('Helvetica').fontSize(11)
        .text('No attendance records found.', { align: 'center' });
    }

    doc.moveDown(0.6);
    const bottomY = doc.y;
    doc.moveTo(margin, bottomY).lineTo(pageW - margin, bottomY).strokeColor(GOLD_DIM).lineWidth(0.7).stroke();

    doc.end();

  } catch (err) {
    console.error('[History] PDF error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'PDF generation failed' });
    } else {
      res.end();
    }
  }
});

module.exports = router;
