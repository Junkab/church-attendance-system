/* ================================================
   Shared validation helpers
   ================================================ */

const VALID_SERVICES = [
  'Sunday Morning Service',
  'Sunday Mid Service',
  'Mid-Week Service',
  'Lunch-Hour Service',
  'Special Service',
];

const VALID_GENDERS = ['Male', 'Female', 'Other'];

/* Strip leading/trailing whitespace; collapse inner runs */
function sanitise(val) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/\s+/g, ' ');
}

/* Validate member-search query params */
function validateMemberSearch(query) {
  const { searchBy, query: q } = query;
  const errors = [];

  if (!searchBy || !['phone', 'member_id', 'name'].includes(searchBy)) {
    errors.push('searchBy must be one of: phone, member_id, name');
  }
  if (!q || sanitise(q).length === 0) {
    errors.push('query is required and cannot be empty');
  }
  if (sanitise(q).length > 200) {
    errors.push('query must be under 200 characters');
  }

  return errors;
}

/* Validate attendance registration body */
function validateAttendance(body) {
  const errors = [];
  const { member_id, service } = body;

  if (!member_id || typeof member_id !== 'number' || !Number.isInteger(member_id) || member_id < 1) {
    errors.push('member_id must be a positive integer');
  }
  if (!service || !VALID_SERVICES.includes(service)) {
    errors.push(`service must be one of: ${VALID_SERVICES.join(', ')}`);
  }

  return errors;
}

/* Validate visitor registration body */
function validateVisitor(body) {
  const errors = [];
  const fullName = sanitise(body.full_name);
  const phone   = sanitise(body.phone);
  const gender  = sanitise(body.gender);
  const service = body.service;

  if (!fullName || fullName.length < 2) {
    errors.push('full_name is required (min 2 characters)');
  }
  if (fullName.length > 200) {
    errors.push('full_name must be under 200 characters');
  }
  if (phone && !/^[\d\s\-+()]{6,20}$/.test(phone)) {
    errors.push('phone must be a valid phone number (6–20 characters, digits only)');
  }
  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.push(`gender must be one of: ${VALID_GENDERS.join(', ')}`);
  }
  if (body.first_time !== true && body.first_time !== false) {
    errors.push('first_time must be a boolean (true or false)');
  }
  if (!service || !VALID_SERVICES.includes(service)) {
    errors.push(`service must be one of: ${VALID_SERVICES.join(', ')}`);
  }

  return errors;
}

/* Validate unified smart-search query param */
function validateSmartSearch(query) {
  const errors = [];
  const q = query.q;

  if (q === undefined || q === null || String(q).trim().length === 0) {
    errors.push('q is required and cannot be empty');
  }
  if (q && String(q).trim().length > 200) {
    errors.push('q must be under 200 characters');
  }

  return errors;
}

module.exports = {
  VALID_SERVICES,
  VALID_GENDERS,
  sanitise,
  validateMemberSearch,
  validateSmartSearch,
  validateAttendance,
  validateVisitor,
};
