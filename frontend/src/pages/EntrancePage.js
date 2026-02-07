import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import MemberFlow from '../components/MemberFlow';
import VisitorFlow from '../components/VisitorFlow';
import PinModal from '../components/PinModal';

/* ── service options ────────────────────────────── */
const SERVICES = [
  'Sunday Morning Service',
  'Sunday Mid-Morning Service',
  'Mid-Week Service',
  'Lunch-Hour Service',
  'Special Service',
];

/* ── main page ──────────────────────────────────── */
export default function EntrancePage() {
  const navigate = useNavigate();
  const [service, setService] = useState('');
  const [tab, setTab] = useState('member'); // 'member' | 'visitor'
  const [showPin, setShowPin] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/ingest/2c2b50fc-3f23-4f16-b841-fa037b667636`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'SVC-1',
        location: 'EntrancePage.js:service',
        message: 'Service selection changed',
        data: { service },
        timestamp: Date.now(),
      }),
    }).catch(() => { });
  }, [service]);

  return (
    <div className="entrance-root">
      {/* ── full-bleed hero bg ────────────────────── */}
      <div className="entrance-bg" />

      {/* ── overlay for readability ───────────────── */}
      <div className="entrance-overlay" />

      {/* ── content layer ─────────────────────────── */}
      <div className="entrance-content">

        {/* logo + title block */}
        <header className="entrance-header">
          <div className="entrance-logo-wrap">
            <img className="entrance-logo-img" src="/logo.png" alt="RFP Ministries Logo" />
          </div>
          <h1 className="entrance-title">Church Entrance</h1>
          <p className="entrance-subtitle">Welcome to RFP Ministries</p>
        </header>

        {/* ── service selector ────────────────────── */}
        <div className="entrance-service">
          <label className="entrance-service-label">Select Service</label>
          <select
            className="entrance-service-select"
            value={service}
            onChange={e => setService(e.target.value)}
          >
            <option value="" disabled>Choose a service…</option>
            {SERVICES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* ── member / visitor tabs ───────────────── */}
        <div className="entrance-tabs">
          <button
            className={`entrance-tab ${tab === 'member' ? 'active' : ''}`}
            onClick={() => setTab('member')}
          >
            Member
          </button>
          <button
            className={`entrance-tab ${tab === 'visitor' ? 'active' : ''}`}
            onClick={() => setTab('visitor')}
          >
            Visitor
          </button>
        </div>

        {/* ── flow panel ──────────────────────────── */}
        <div className="entrance-panel">
          {!service ? (
            <div className="entrance-no-service">
              Please select a service above to continue.
            </div>
          ) : tab === 'member' ? (
            <MemberFlow key={`m-${service}`} service={service} />
          ) : (
            <VisitorFlow key={`v-${service}`} service={service} />
          )}
        </div>

        {/* ── history button ─────────────────────── */}
        <button className="entrance-history-btn" onClick={() => setShowPin(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </button>

        {/* ── footer ──────────────────────────────── */}
        <footer className="entrance-footer">
          This terminal is for attendance tracking only.<br />
          For member portal access, please visit the app.
        </footer>
      </div>

      {/* ── PIN modal (rendered outside content but inside root) ── */}
      {showPin && (
        <PinModal
          onSuccess={() => { setShowPin(false); navigate('/history'); }}
          onClose={() => setShowPin(false)}
        />
      )}

      {/* ══════════════ SCOPED STYLES ══════════════ */}
      <style>{`
        /* ─── root & bg ─────────────────────────── */
        .entrance-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow-x: hidden;
        }

        .entrance-bg {
          position: fixed;
          inset: 0;
          background: url('/bg.jpg') center/cover no-repeat;
          z-index: 0;
          filter: brightness(0.38) saturate(1.1);
        }

        .entrance-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.25)  0%,
            rgba(8,8,16,0.55) 35%,
            rgba(8,8,16,0.82) 60%,
            rgba(6,6,12,0.95) 100%
          );
          z-index: 1;
        }

        /* ─── content wrapper ─────────────────── */
        .entrance-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 460px;
          padding: 40px 24px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
        }

        /* ─── header ──────────────────────────── */
        .entrance-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .entrance-logo-wrap {
          width: 180px;
          height: auto;
          filter: drop-shadow(0 3px 14px rgba(200,170,100,0.3));
        }
        .entrance-logo-img {
          width: 100%;
          height: auto;
          display: block;
          /* The source logo has a light background; invert so it reads on dark */
          filter: invert(1) brightness(0.92) sepia(0.15) hue-rotate(5deg) saturate(1.3);
        }

        .entrance-title {
          font-family: 'Cinzel', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #f0ead6;
          letter-spacing: 0.06em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }

        .entrance-subtitle {
          font-family: 'Raleway', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          color: #c8aa64;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-shadow: 0 1px 8px rgba(0,0,0,0.5);
        }

        /* ─── service selector ────────────────── */
        .entrance-service {
          width: 100%;
        }
        .entrance-service-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 600;
          color: #9a9088;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
        .entrance-service-select {
          width: 100%;
          padding: 13px 42px 13px 16px;
          background: rgba(14,14,22,0.75);
          border: 1px solid rgba(200,170,100,0.25);
          border-radius: 10px;
          color: #f0ead6;
          font-size: 0.96rem;
          font-family: 'Raleway', sans-serif;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c8aa64' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          transition: border-color 0.2s;
        }
        .entrance-service-select:focus {
          border-color: rgba(200,170,100,0.5);
        }
        .entrance-service-select option {
          background: #12121c;
          color: #f0ead6;
        }

        /* ─── tabs ────────────────────────────── */
        .entrance-tabs {
          display: flex;
          width: 100%;
          gap: 8px;
          background: rgba(14,14,22,0.55);
          border-radius: 12px;
          padding: 5px;
        }
        .entrance-tab {
          flex: 1;
          padding: 11px;
          background: transparent;
          border: none;
          border-radius: 9px;
          color: #9a9088;
          font-size: 0.92rem;
          font-weight: 600;
          font-family: 'Raleway', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(.22,1,.36,1);
        }
        .entrance-tab.active {
          background: rgba(200,170,100,0.18);
          color: #c8aa64;
          box-shadow: 0 2px 10px rgba(200,170,100,0.12);
        }

        /* ─── panel ───────────────────────────── */
        .entrance-panel {
          width: 100%;
          background: rgba(16,16,26,0.78);
          border: 1px solid rgba(200,170,100,0.18);
          border-radius: 14px;
          padding: 24px 22px;
          backdrop-filter: blur(6px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }

        .entrance-no-service {
          text-align: center;
          color: #9a9088;
          font-size: 0.9rem;
          padding: 28px 0;
          font-style: italic;
        }

        /* ─── footer ──────────────────────────── */
        .entrance-footer {
          text-align: center;
          font-size: 0.74rem;
          color: #6b635a;
          line-height: 1.6;
          letter-spacing: 0.02em;
        }

        /* ─── responsive (tablets & mobile) ───── */
        @media (max-width: 520px) {
          .entrance-content {
            padding: 28px 16px 24px;
            gap: 18px;
          }
          .entrance-logo-wrap { width: 150px; }
          .entrance-title  { font-size: 1.45rem; }
          .entrance-panel  { padding: 18px 16px; }
        }

        /* ─── history button ──────────────────── */
        .entrance-history-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: 1px solid rgba(200,170,100,0.22);
          border-radius: 8px;
          padding: 9px 20px;
          color: #9a9088;
          font-family: 'Raleway', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .entrance-history-btn:hover {
          color: #c8aa64;
          border-color: rgba(200,170,100,0.4);
          background: rgba(200,170,100,0.06);
        }
      `}</style>
    </div>
  );
}
