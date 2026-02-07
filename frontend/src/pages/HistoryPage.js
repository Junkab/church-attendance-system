import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistory, downloadHistoryPdf, deleteHistory } from '../api/api';
import '../styles/global.css';

const PIN = '1234'; // must match what was validated in PinModal

export default function HistoryPage() {
  const navigate        = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchHistory(PIN);
      setRecords(data.records);
    } catch (err) {
      if (err.response?.status === 401) {
        // session somehow invalid → kick back
        navigate('/');
        return;
      }
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      await downloadHistoryPdf(PIN);
    } catch {
      setError('PDF download failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('This will permanently delete all attendance history records. Continue?')) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await deleteHistory(PIN);
      await load();
    } catch {
      setError('Failed to delete history. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  /* format helpers */
  const fmtDate = (d) => {
    if (!d) return '—';
  
    // value already comes as an ISO string with timezone (e.g. 2026-02-04T00:00:00.000Z)
    // parse directly and format in UTC to avoid client timezone shifting the date
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };
  const fmtTime = (t) => {
    if (!t) return '—';
    
    const dt = new Date(t);
    if (Number.isNaN(dt.getTime())) return '—';
    // Treat stored times as UTC so they display as originally recorded,
    // without being shifted by the browser's local timezone (was +1 hour)
    return dt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  };

  return (
    <div className="hist-root">
      <div className="hist-bg" />
      <div className="hist-overlay" />

      <div className="hist-content">

        {/* ── header ──────────────────────────── */}
        <header className="hist-header">
          <button className="hist-back" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>

          <div className="hist-logo-wrap">
            <img className="hist-logo" src="/logo.png" alt="RFP Ministries" />
          </div>

          <h1 className="hist-title">Attendance History</h1>

          <div className="hist-actions">
            <button
              className={`hist-pdf-btn ${pdfLoading ? 'loading' : ''}`}
              onClick={handlePdf}
              disabled={pdfLoading || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {pdfLoading ? 'Generating…' : 'Download PDF'}
            </button>

            <button
              className="hist-delete-btn"
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              {deleting ? 'Deleting…' : 'Delete History'}
            </button>
          </div>
        </header>

        {/* ── error banner ────────────────────── */}
        {error && <div className="hist-error">{error}</div>}

        {/* ── loading ─────────────────────────── */}
        {loading && (
          <div className="hist-loading">
            <div className="hist-spinner" />
            <span>Loading records…</span>
          </div>
        )}

        {/* ── empty ───────────────────────────── */}
        {!loading && !error && records.length === 0 && (
          <div className="hist-empty">No attendance records found.</div>
        )}

        {/* ── table ───────────────────────────── */}
        {!loading && records.length > 0 && (
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Check-in</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                    <td>{r.name}</td>
                    <td><span className={`hist-badge ${r.type === 'Member' ? 'member' : 'visitor'}`}>{r.type}</span></td>
                    <td>{r.phone || '—'}</td>
                    <td>{r.gender}</td>
                    <td>{r.service}</td>
                    <td>{fmtDate(r.service_date)}</td>
                    <td>{fmtTime(r.check_in_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* record count */}
        {!loading && records.length > 0 && (
          <div className="hist-count">{records.length} record{records.length !== 1 ? 's' : ''} total</div>
        )}
      </div>

      {/* ═══════════ SCOPED STYLES ═══════════ */}
      <style>{`
        /* ─── root & bg ───────────────────────── */
        .hist-root {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .hist-bg {
          position: fixed;
          inset: 0;
          background: url('/bg.jpg') center/cover no-repeat;
          z-index: 0;
          filter: brightness(0.28) saturate(1.1);
        }
        .hist-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(6,6,14,0.7) 40%, rgba(6,6,12,0.95) 70%);
          z-index: 1;
        }

        /* ─── content ─────────────────────────── */
        .hist-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        /* ─── header block ────────────────────── */
        .hist-header {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .hist-back {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #9a9088;
          font-family: 'Raleway', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .hist-back:hover { color: #c8aa64; }

        .hist-logo-wrap {
          width: 110px;
          filter: drop-shadow(0 2px 8px rgba(200,170,100,0.25));
        }
        .hist-logo {
          width: 100%;
          height: auto;
          display: block;
          filter: invert(1) brightness(0.92) sepia(0.15) hue-rotate(5deg) saturate(1.3);
        }

        .hist-title {
          font-family: 'Cinzel', serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #f0ead6;
          letter-spacing: 0.05em;
        }

        .hist-actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }

        /* ─── pdf button ──────────────────────── */
        .hist-pdf-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #c8aa64, #a8893f);
          border: none;
          border-radius: 8px;
          color: #0a0a0f;
          font-family: 'Raleway', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: opacity 0.2s, transform 0.1s;
        }
        .hist-pdf-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .hist-pdf-btn:active { transform: translateY(0); }
        .hist-pdf-btn.loading,
        .hist-pdf-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .hist-delete-btn {
          padding: 9px 16px;
          background: transparent;
          border-radius: 8px;
          border: 1px solid rgba(224,85,85,0.5);
          color: #e05555;
          font-family: 'Raleway', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s;
        }
        .hist-delete-btn:hover {
          background: rgba(224,85,85,0.12);
          border-color: rgba(224,85,85,0.8);
        }
        .hist-delete-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ─── error ───────────────────────────── */
        .hist-error {
          width: 100%;
          max-width: 680px;
          background: rgba(224,85,85,0.1);
          border: 1px solid rgba(224,85,85,0.3);
          border-radius: 10px;
          padding: 12px 18px;
          color: #e05555;
          font-family: 'Raleway', sans-serif;
          font-size: 0.88rem;
          text-align: center;
        }

        /* ─── loading ─────────────────────────── */
        .hist-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 48px 0;
          color: #9a9088;
          font-family: 'Raleway', sans-serif;
          font-size: 0.9rem;
        }
        .hist-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(200,170,100,0.15);
          border-top-color: #c8aa64;
          border-radius: 50%;
          animation: histSpin 0.7s linear infinite;
        }
        @keyframes histSpin { to { transform:rotate(360deg); } }

        /* ─── empty ───────────────────────────── */
        .hist-empty {
          color: #6b635a;
          font-family: 'Raleway', sans-serif;
          font-size: 0.95rem;
          font-style: italic;
          padding: 48px 0;
          text-align: center;
        }

        /* ─── table wrapper ───────────────────── */
        .hist-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(200,170,100,0.16);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        /* ─── table ───────────────────────────── */
        .hist-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }

        /* thead */
        .hist-table thead {
          background: rgba(22,22,38,0.95);
          border-bottom: 1px solid rgba(200,170,100,0.22);
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .hist-table th {
          padding: 13px 14px;
          text-align: left;
          font-family: 'Raleway', sans-serif;
          font-size: 0.73rem;
          font-weight: 600;
          color: #c8aa64;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        /* tbody */
        .hist-table tbody tr.even { background: rgba(16,16,26,0.92); }
        .hist-table tbody tr.odd  { background: rgba(24,24,40,0.92); }
        .hist-table tbody tr {
          border-bottom: 1px solid rgba(200,170,100,0.07);
          transition: background 0.15s;
        }
        .hist-table tbody tr:hover { background: rgba(200,170,100,0.06) !important; }

        .hist-table td {
          padding: 11px 14px;
          font-family: 'Raleway', sans-serif;
          font-size: 0.85rem;
          color: #d8d0c0;
          white-space: nowrap;
        }

        /* type badge */
        .hist-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .hist-badge.member {
          background: rgba(94,189,122,0.12);
          color: #5ebd7a;
          border: 1px solid rgba(94,189,122,0.25);
        }
        .hist-badge.visitor {
          background: rgba(200,170,100,0.12);
          color: #c8aa64;
          border: 1px solid rgba(200,170,100,0.25);
        }

        /* ─── record count ────────────────────── */
        .hist-count {
          font-family: 'Raleway', sans-serif;
          font-size: 0.78rem;
          color: #6b635a;
          letter-spacing: 0.04em;
        }

        /* ─── responsive ──────────────────────── */
        @media (max-width: 720px) {
          .hist-content { padding: 24px 12px 32px; }
          .hist-title   { font-size: 1.25rem; }
          .hist-logo-wrap { width: 90px; }
        }
      `}</style>
    </div>
  );
}
