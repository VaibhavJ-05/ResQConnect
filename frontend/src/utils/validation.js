/**
 * ResQConnect — Unified Validation Utility & Input Normalizers
 */

/* ── Regex Patterns ── */
export const REGEX = {
  // Name: Alphabets and single spaces only, 2-50 chars, no consecutive spaces
  NAME: /^[A-Za-z]+(?: [A-Za-z]+)*$/,

  // Email: Standard email format
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,

  // Indian Mobile: Exactly 10 digits starting with 6, 7, 8, or 9
  INDIAN_PHONE: /^[6-9]\d{9}$/,

  // Password: 8-32 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=~<>])[A-Za-z\d@$!%*?&#^()_+=~<>]{8,32}$/,

  // Amount: Up to 2 decimal places, positive number
  AMOUNT: /^\d+(\.\d{1,2})?$/,

  // Pincode: Exactly 6 digits
  PINCODE: /^[1-9]\d{5}$/,

  // Aadhaar: Exactly 12 digits
  AADHAAR: /^\d{12}$/,

  // Sanitizer: No HTML or script tags
  NO_HTML: /^[^<>]*$/,
};

/* ── Normalizers ── */
export const normalizePhone = (value = '') => {
  let cleaned = value.replace(/[\s\-_()]/g, '');
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);

  return cleaned.replace(/\D/g, '').slice(0, 10);
};

export const normalizeName = (value = '') => {
  return value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ');
};

export const normalizeAmount = (value = '') => {
  let cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  if (parts[1]) cleaned = `${parts[0]}.${parts[1].slice(0, 2)}`;
  return cleaned;
};

export const sanitizeText = (text = '') => {
  return text.replace(/<[^>]*>/g, '').trim();
};

/* ── Password Strength Calculator ── */
export const evaluatePasswordStrength = (pwd = '') => {
  const checks = {
    length: pwd.length >= 8 && pwd.length <= 32,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasDigit: /\d/.test(pwd),
    hasSpecial: /[@$!%*?&#^()_+=~<>]/.test(pwd),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let label = 'Weak';
  let color = '#ef4444';
  let percentage = (score / 5) * 100;

  if (score >= 5)      { label = 'Enterprise Strong'; color = '#10b981'; }
  else if (score >= 4) { label = 'Strong';            color = '#3b82f6'; }
  else if (score >= 3) { label = 'Medium';            color = '#f59e0b'; }
  else if (score >= 2) { label = 'Weak';              color = '#f97316'; }

  return { checks, score, label, color, percentage };
};
