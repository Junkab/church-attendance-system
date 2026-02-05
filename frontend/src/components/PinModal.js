import React, { useState, useRef, useEffect } from 'react';

export default function PinModal({ onSuccess, onClose }) {
  const [digits, setDigits]   = useState(['', '', '', '']);
  const [error, setError]     = useState('');
  const [shake, setShake]     = useState(false);
  const inputRefs             = useRef([]);

  // focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  /* advance or submit */
  const handleChange = (i, val) => {
    // only single digit
    if (val && !/^\d$/.test(val)) return;

    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError('');

    if (val) {
      // move focus forward
      if (i < 3) inputRefs.current[i + 1]?.focus();
      // if last digit filled → validate
      if (i === 3) {
        const pin = [...next].join('');
        if (pin === '1234') {
          onSuccess();
        } else {
          triggerError();
        }
      }
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      next[i] = '';
      setDigits(next);
      setError('');
      // move focus back
      const target = i > 0 ? i - 1 : 0;
      inputRefs.current[target]?.focus();
    }
  };

  // paste support — grab up to 4 digits from clipboard
  const handlePaste = (e) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!raw) return;
    const next = ['', '', '', ''];
    [...raw].forEach((ch, idx) => { next[idx] = ch; });
    setDigits(next);
    setError('');
    const filled = raw.length;
    if (filled < 4) {
      inputRefs.current[filled]?.focus();
    } else {
      // validate
      if (raw === '1234') {
        onSuccess();
      } else {
        triggerError();
      }
    }
  };

  function triggerError() {
    setError('Incorrect PIN. Please try again.');
    setShake(true);
    setDigits(['', '', '', '']);
    setTimeout(() => {
      setShake(false);
      inputRefs.current[0]?.focus();
    }, 500);
  }

  return (
    <div className="pin-overlay" onClick={onClose}>
      <div
        className={`pin-card ${shake ? 'shake' : ''}`}
        onClick={e => e.stopPropagation()}
        onPaste={handlePaste}
      >
        {/* lock icon */}
        <div className="pin-icon-wrap">
          <svg className="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 className="pin-title">History Access</h2>
        <p className="pin-sub">Enter your 4-digit PIN to continue</p>

        {/* digit boxes */}
        <div className="pin-boxes">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              className={`pin-box ${error ? 'err' : ''} ${d ? 'filled' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoComplete="off"
            />
          ))}
        </div>

        {/* error */}
        {error && <p className="pin-error">{error}</p>}

        {/* cancel */}
        <button className="pin-cancel" onClick={onClose}>Cancel</button>
      </div>

      <style>{`
        .pin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.62);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 900;
          animation: pinFadeIn 0.18s ease;
        }
        @keyframes pinFadeIn { from { opacity:0 } to { opacity:1 } }

        .pin-card {
          background: linear-gradient(145deg, #1a1a2e 0%, #12121f 100%);
          border: 1px solid rgba(200,170,100,0.22);
          border-radius: 20px;
          padding: 40px 36px 32px;
          text-align: center;
          width: 90%;
          max-width: 340px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.55);
          animation: pinScaleIn 0.26s cubic-bezier(.22,1,.36,1);
        }
        @keyframes pinScaleIn { from { transform:scale(0.82); opacity:0 } to { transform:scale(1); opacity:1 } }

        .pin-card.shake {
          animation: pinShake 0.42s cubic-bezier(.36,.07,.19,.97);
        }
        @keyframes pinShake {
          0%,100% { transform:translateX(0); }
          18%     { transform:translateX(-7px); }
          36%     { transform:translateX(7px); }
          54%     { transform:translateX(-4px); }
          72%     { transform:translateX(4px); }
        }

        .pin-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(200,170,100,0.1);
          border: 1px solid rgba(200,170,100,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }
        .pin-icon {
          width: 24px;
          height: 24px;
          color: #c8aa64;
        }

        .pin-title {
          font-family: 'Cinzel', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #f0ead6;
          margin-bottom: 4px;
          letter-spacing: 0.03em;
        }
        .pin-sub {
          font-family: 'Raleway', sans-serif;
          font-size: 0.82rem;
          color: #8a8278;
          margin-bottom: 24px;
        }

        .pin-boxes {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 6px;
        }
        .pin-box {
          width: 52px;
          height: 60px;
          border-radius: 10px;
          border: 2px solid rgba(200,170,100,0.25);
          background: rgba(10,10,18,0.7);
          color: #f0ead6;
          font-size: 1.6rem;
          font-weight: 600;
          font-family: 'Cinzel', serif;
          text-align: center;
          outline: none;
          caret-color: transparent;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pin-box:focus {
          border-color: rgba(200,170,100,0.55);
          box-shadow: 0 0 0 3px rgba(200,170,100,0.12);
        }
        .pin-box.filled {
          border-color: rgba(200,170,100,0.45);
        }
        .pin-box.err {
          border-color: rgba(224,85,85,0.5);
          background: rgba(224,85,85,0.06);
        }

        .pin-error {
          font-family: 'Raleway', sans-serif;
          font-size: 0.8rem;
          color: #e05555;
          margin-top: 10px;
          min-height: 1em;
        }

        .pin-cancel {
          display: block;
          margin: 20px auto 0;
          background: none;
          border: none;
          color: #6b635a;
          font-family: 'Raleway', sans-serif;
          font-size: 0.82rem;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .pin-cancel:hover { color: #9a9088; }
      `}</style>
    </div>
  );
}
