import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';


/* ─── Members ────────────────────────────────────── */
export async function smartSearch(q) {
  const { data } = await axios.get(`${BASE}/members/search`, {
    params: { q },
  });
  return data;
}

/* ─── Attendance ─────────────────────────────────── */
export async function registerAttendance(memberId, service) {
  const { data } = await axios.post(`${BASE}/attendance/register`, {
    member_id: memberId,
    service,
  });
  return data;
}

/* ─── Visitors ───────────────────────────────────── */
export async function registerVisitor({ fullName, phone, gender, firstTime, service }) {
  const { data } = await axios.post(`${BASE}/visitors/register`, {
    full_name:  fullName,
    phone:      phone || '',
    gender,
    first_time: firstTime,
    service,
  });
  return data;
}

/* ─── History ────────────────────────────────────── */
export async function fetchHistory(pin) {
  const { data } = await axios.get(`${BASE}/history`, { params: { pin } });
  return data;
}

export async function downloadHistoryPdf(pin) {
  const response = await axios.get(`${BASE}/history/pdf`, {
    params:       { pin },
    responseType: 'blob',
  });
  // trigger browser download
  const url  = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'RFP_Attendance_History.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function deleteHistory(pin) {
  const { data } = await axios.delete(`${BASE}/history`, { params: { pin } });
  return data;
}
