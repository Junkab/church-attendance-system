import React, { useState, useRef, useEffect, useCallback } from 'react';
import { smartSearch, registerAttendance } from '../api/api';
import SuccessPopup from './SuccessPopup';

/* ────────────────────────── styles ──────────────── */
const S = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#9a9088',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '6px',
  },
  labelHint: {
    fontSize: '0.72rem',
    fontWeight: 400,
    color: '#6b635a',
    textTransform: 'none',
    letterSpacing: '0',
    marginLeft: '8px',
    fontStyle: 'italic',
  },
  inputWrap: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 42px 14px 42px',
    background: 'rgba(14,14,22,0.7)',
    border: '1px solid rgba(200,170,100,0.2)',
    borderRadius: '10px',
    color: '#f0ead6',
    fontSize: '1rem',
    fontFamily: "'Raleway', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    stroke: '#9a9088',
    fill: 'none',
    strokeWidth: 2,
    pointerEvents: 'none',
  },
  clearBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    color: '#6b635a',
    transition: 'color 0.15s, background 0.15s',
  },
  spinner: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(200,170,100,0.15)',
    borderTop: '2px solid #c8aa64',
    borderRadius: '50%',
    animation: 'mfSpin 0.6s linear infinite',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #c8aa64, #a8893f)',
    border: 'none',
    borderRadius: '10px',
    color: '#0a0a0f',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: "'Raleway', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  btnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  error: {
    background: 'rgba(224,85,85,0.1)',
    border: '1px solid rgba(224,85,85,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#e05555',
    fontSize: '0.88rem',
    lineHeight: 1.5,
  },
  card: {
    background: 'rgba(22,22,38,0.88)',
    border: '1px solid rgba(200,170,100,0.22)',
    borderRadius: '12px',
    padding: '20px',
  },
  cardTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#c8aa64',
    marginBottom: '14px',
    letterSpacing: '0.04em',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '7px 0',
    borderBottom: '1px solid rgba(200,170,100,0.1)',
    fontSize: '0.9rem',
  },
  rowKey: { color: '#9a9088', fontWeight: 500 },
  rowVal: { color: '#f0ead6', fontWeight: 500 },
  dupError: {
    background: 'rgba(224,85,85,0.1)',
    border: '1px solid rgba(224,85,85,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#e05555',
    fontSize: '0.88rem',
    marginTop: '4px',
  },
};

/* ────────────────────────── component ───────────── */
export default function MemberFlow({ service }) {
  const [query, setQuery]             = useState('');
  const [member, setMember]           = useState(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [regLoading, setRegLoading]   = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dupError, setDupError]       = useState('');
  const inputRef                      = useRef(null);
  const debounceRef                   = useRef(null);

  /* ── reset everything ──────────────────────────── */
  const reset = useCallback(() => {
    setQuery('');
    setMember(null);
    setError('');
    setDupError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  }, []);

  /* ── perform the actual API call ───────────────── */
  const doSearch = useCallback(async (term) => {
    if (!term || !term.trim()) {
      setMember(null);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setMember(null);
    setDupError('');
    try {
      const res = await smartSearch(term.trim());
      setMember(res.member);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(err.response.data.message || 'Member not found.');
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(' '));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── debounced onChange ─────────────────────────── */
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    // clear previous member + error immediately on new input
    setMember(null);
    setError('');
    setDupError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      doSearch(val);
    }, 300);
  };

  /* ── Enter key: fire immediately (skip debounce) ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      doSearch(query);
    }
  };

  /* ── cleanup debounce on unmount ───────────────── */
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  /* ── register attendance ───────────────────────── */
  const handleRegister = async () => {
    if (!member) return;
    setRegLoading(true);
    setDupError('');
    try {
      await registerAttendance(member.id, service);
      setShowSuccess(true);
      setTimeout(reset, 2200);
    } catch (err) {
      if (err.response?.status === 409) {
        setDupError(err.response.data.message || 'Already checked in.');
      } else {
        setDupError('Registration failed. Please try again.');
      }
    } finally {
      setRegLoading(false);
    }
  };

  /* ── detect what the user is typing (for the label hint) */
  const detectType = () => {
    const t = query.trim();
    if (!t) return 'phone, name, or ID';
    if (/^MBR-/i.test(t)) return 'Member ID';
    if (/^\d+$/.test(t))  return 'Phone Number';
    return 'Name';
  };

  return (
    <div style={S.wrap}>
      {showSuccess && <SuccessPopup message="Registered successfully" onClose={() => setShowSuccess(false)} />}

      {/* label */}
      <div>
        <div style={S.label}>
          Search Member
          <span style={S.labelHint}>detecting: {detectType()}</span>
        </div>

        {/* input row */}
        <div style={S.inputWrap}>
          {/* search icon */}
          <svg style={S.searchIcon} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            style={S.input}
            type="text"
            inputMode="text"
            placeholder="Type phone, name, or Member ID…"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
          />

          {/* right-side indicator: spinner while loading, clear button when there's text */}
          {loading ? (
            <div style={S.spinner} />
          ) : query ? (
            <button style={S.clearBtn} onClick={reset} aria-label="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* error */}
      {error && <div style={S.error}>{error}</div>}

      {/* member card — appears automatically when found */}
      {member && (
        <>
          <div style={S.card}>
            <div style={S.cardTitle}>Member Found</div>
            {[
              ['First Name',  member.first_name],
              ['Last Name',   member.last_name],
              ['Phone',       member.phone],
              ['Email',       member.email || '—'],
              ['Gender',      member.gender],
              ['Member ID',   member.member_id],
            ].map(([k, v]) => (
              <div style={S.row} key={k}>
                <span style={S.rowKey}>{k}</span>
                <span style={S.rowVal}>{v}</span>
              </div>
            ))}
          </div>

          {/* register button */}
          <button
            style={{ ...S.btn, ...(regLoading ? S.btnDisabled : {}) }}
            onClick={handleRegister}
            disabled={regLoading}
          >
            {regLoading ? 'Registering…' : 'Register Attendance'}
          </button>

          {dupError && <div style={S.dupError}>{dupError}</div>}
        </>
      )}

      {/* keyframe for the spinner */}
      <style>{`@keyframes mfSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
