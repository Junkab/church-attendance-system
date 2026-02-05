import React, { useState } from 'react';
import { registerVisitor } from '../api/api';
import SuccessPopup from './SuccessPopup';

/* ────────────────────────── styles ──────────────── */
const S = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  input: {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(14,14,22,0.7)',
    border: '1px solid rgba(200,170,100,0.2)',
    borderRadius: '10px',
    color: '#f0ead6',
    fontSize: '1rem',
    fontFamily: "'Raleway', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputErr: {
    borderColor: 'rgba(224,85,85,0.5)',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(14,14,22,0.7)',
    border: '1px solid rgba(200,170,100,0.2)',
    borderRadius: '10px',
    color: '#f0ead6',
    fontSize: '0.95rem',
    fontFamily: "'Raleway', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a9088' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
  },
  toggleRow: {
    display: 'flex',
    gap: '10px',
  },
  toggleBtn: (active) => ({
    flex: 1,
    padding: '11px',
    background: active ? 'rgba(200,170,100,0.15)' : 'rgba(14,14,22,0.5)',
    border: active ? '1px solid rgba(200,170,100,0.45)' : '1px solid rgba(200,170,100,0.15)',
    borderRadius: '10px',
    color: active ? '#c8aa64' : '#9a9088',
    fontSize: '0.92rem',
    fontWeight: 600,
    fontFamily: "'Raleway', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
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
    transition: 'opacity 0.2s',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  error: {
    background: 'rgba(224,85,85,0.1)',
    border: '1px solid rgba(224,85,85,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#e05555',
    fontSize: '0.88rem',
    lineHeight: 1.6,
  },
  fieldErr: {
    color: '#e05555',
    fontSize: '0.76rem',
    marginTop: '4px',
  },
};

/* ────────────────────────── component ───────────── */
const EMPTY = { fullName: '', phone: '', gender: '', firstTime: null };

export default function VisitorFlow({ service }) {
  const [form, setForm]           = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const change = (key) => (e) => {
    const val = e.target ? e.target.value : e;
    setForm(prev => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }));
  };

  /* client-side validation */
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errs.fullName = 'Full name is required (min 2 characters)';
    if (form.phone && !/^[\d\s\-+()]{6,20}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid phone number';
    if (!form.gender)
      errs.gender = 'Please select a gender';
    if (form.firstTime === null)
      errs.firstTime = 'Please indicate if this is your first visit';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      await registerVisitor({
        fullName:  form.fullName.trim(),
        phone:     form.phone.trim(),
        gender:    form.gender,
        firstTime: form.firstTime,
        service,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setForm(EMPTY);
        setFieldErrors({});
        setShowSuccess(false);
      }, 2200);
    } catch (err) {
      if (err.response?.data?.errors) {
        setServerError(err.response.data.errors.join(' '));
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.fullName.trim().length >= 2 && form.gender && form.firstTime !== null;

  return (
    <div style={S.wrap}>
      {showSuccess && <SuccessPopup message="Visitor registered successfully" onClose={() => setShowSuccess(false)} />}

      {/* Full Name */}
      <div>
        <div style={S.label}>Full Name <span style={{ color: '#e05555' }}>*</span></div>
        <input
          style={{ ...S.input, ...(fieldErrors.fullName ? S.inputErr : {}) }}
          type="text"
          placeholder="John Smith"
          value={form.fullName}
          onChange={change('fullName')}
          autoFocus
          autoComplete="off"
        />
        {fieldErrors.fullName && <div style={S.fieldErr}>{fieldErrors.fullName}</div>}
      </div>

      {/* Phone */}
      <div>
        <div style={S.label}>Phone Number</div>
        <input
          style={{ ...S.input, ...(fieldErrors.phone ? S.inputErr : {}) }}
          type="tel"
          placeholder="0881234567 (optional)"
          value={form.phone}
          onChange={change('phone')}
          autoComplete="off"
        />
        {fieldErrors.phone && <div style={S.fieldErr}>{fieldErrors.phone}</div>}
      </div>

      {/* Gender */}
      <div>
        <div style={S.label}>Gender <span style={{ color: '#e05555' }}>*</span></div>
        <select
          style={{ ...S.select, ...(fieldErrors.gender ? { borderColor: 'rgba(224,85,85,0.5)' } : {}) }}
          value={form.gender}
          onChange={change('gender')}
        >
          <option value="" disabled>Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {fieldErrors.gender && <div style={S.fieldErr}>{fieldErrors.gender}</div>}
      </div>

      {/* First-time visitor */}
      <div>
        <div style={S.label}>First-Time Visitor? <span style={{ color: '#e05555' }}>*</span></div>
        <div style={S.toggleRow}>
          <button style={S.toggleBtn(form.firstTime === true)}  onClick={() => change('firstTime')(true)}>Yes</button>
          <button style={S.toggleBtn(form.firstTime === false)} onClick={() => change('firstTime')(false)}>No</button>
        </div>
        {fieldErrors.firstTime && <div style={S.fieldErr}>{fieldErrors.firstTime}</div>}
      </div>

      {/* Submit */}
      <button
        style={{ ...S.btn, ...(loading || !isValid ? S.btnDisabled : {}) }}
        onClick={handleSubmit}
        disabled={loading || !isValid}
      >
        {loading ? 'Registering…' : 'Register Visitor'}
      </button>

      {serverError && <div style={S.error}>{serverError}</div>}
    </div>
  );
}
