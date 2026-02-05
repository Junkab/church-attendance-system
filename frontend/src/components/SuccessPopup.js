import React, { useEffect } from 'react';

/* ─── inline styles (no external file needed) ──── */
const overlay = {
  position:   'fixed',
  inset:      0,
  background: 'rgba(0,0,0,0.62)',
  display:    'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex:     1000,
  animation:  'fadeIn 0.2s ease',
};

const card = {
  background:    'linear-gradient(145deg, #1a1a2e 0%, #16162a 100%)',
  border:        '1px solid rgba(94,189,122,0.35)',
  borderRadius:  '18px',
  padding:       '44px 40px 36px',
  textAlign:     'center',
  maxWidth:      '360px',
  width:         '90%',
  boxShadow:     '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(94,189,122,0.08)',
  animation:     'scaleIn 0.28s cubic-bezier(.22,1,.36,1)',
};

const iconCircle = {
  width:          '72px',
  height:         '72px',
  borderRadius:   '50%',
  background:     'rgba(94,189,122,0.12)',
  border:         '2px solid rgba(94,189,122,0.4)',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  margin:         '0 auto 22px',
};

const checkIcon = {
  width:  '32px',
  height: '32px',
  stroke: '#5ebd7a',
  fill:   'none',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const title = {
  fontFamily: "'Cinzel', serif",
  fontSize:   '1.45rem',
  fontWeight: 600,
  color:      '#5ebd7a',
  marginBottom: '6px',
  letterSpacing: '0.02em',
};

const sub = {
  fontSize:  '0.92rem',
  color:     '#9a9088',
  fontWeight: 400,
  lineHeight: 1.5,
};

const bar = {
  width:      '100%',
  height:     '3px',
  background: 'rgba(94,189,122,0.15)',
  borderRadius: '2px',
  marginTop:  '28px',
  overflow:   'hidden',
};

const barFill = {
  height:     '100%',
  background: '#5ebd7a',
  borderRadius: '2px',
  animation:  'shrink 2s linear forwards',
};

/* ─────────────────────────────────────────────── */
export default function SuccessPopup({ message = 'Registered successfully', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={iconCircle}>
          <svg style={checkIcon} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={title}>Success</div>
        <div style={sub}>{message}</div>
        <div style={bar}><div style={barFill} /></div>
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn  { from { transform:scale(0.82); opacity:0 } to { transform:scale(1); opacity:1 } }
        @keyframes shrink   { from { width:100% } to { width:0 } }
      `}</style>
    </div>
  );
}
