// ─── Diagnostic script ────────────────────────────────────────────
// Connects using the SAME pool config as the live backend.
// Run from backend/ with:   node src/_diagnose.js
// ───────────────────────────────────────────────────────────────────
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  console.log('\n═══ 1. RAW members TABLE DUMP ═══');
  const { rows: members } = await pool.query('SELECT * FROM members');
  console.log('Row count:', members.length);
  members.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n═══ 2. EXACT phone search — WHERE phone = \'0883727116\' ═══');
  const { rows: exact } = await pool.query(
    "SELECT id, first_name, last_name, phone FROM members WHERE phone = '0883727116'"
  );
  console.log('Rows returned:', exact.length, exact);

  console.log('\n═══ 3. PARTIAL phone search — WHERE phone LIKE \'%0883%\' ═══');
  const { rows: partial } = await pool.query(
    "SELECT id, first_name, last_name, phone FROM members WHERE phone LIKE '%0883%'"
  );
  console.log('Rows returned:', partial.length, partial);

  console.log('\n═══ 4. Name search — WHERE first_name ILIKE \'%mat%\' ═══');
  const { rows: name } = await pool.query(
    "SELECT id, first_name, last_name, phone FROM members WHERE first_name ILIKE '%mat%'"
  );
  console.log('Rows returned:', name.length, name);

  console.log('\n═══ 5. pg_typeof on phone column ═══');
  const { rows: dtype } = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='members' AND column_name='phone'"
  );
  console.log(dtype);

  console.log('\n═══ 6. attendance table dump ═══');
  const { rows: att } = await pool.query('SELECT * FROM attendance');
  console.log('Row count:', att.length);
  att.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n═══ 7. visitor_attendance table dump ═══');
  const { rows: vatt } = await pool.query('SELECT * FROM visitor_attendance');
  console.log('Row count:', vatt.length);
  vatt.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n═══ 8. visitors table dump ═══');
  const { rows: vis } = await pool.query('SELECT * FROM visitors');
  console.log('Row count:', vis.length);
  vis.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n═══ DONE ═══\n');
  await pool.end();
}

run().catch(err => {
  console.error('Diagnostic failed:', err);
  pool.end();
  process.exit(1);
});
