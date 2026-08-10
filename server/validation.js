/** 솔라피는 하이픈 없는 숫자 형식만 받는다. (예: 01012345678) */
export function normalizePhone(input) {
  return String(input ?? '').replace(/[^0-9]/g, '');
}

/** 신청자 연락처 — 휴대폰/일반전화 모두 허용 */
export function isValidContactPhone(digits) {
  return /^0\d{8,10}$/.test(digits);
}

/** 문자 수신 번호 — 휴대폰만 가능 */
export function isValidMobilePhone(digits) {
  return /^01[016789]\d{7,8}$/.test(digits);
}

export function formatPhone(digits) {
  const d = normalizePhone(digits);
  if (/^01\d{9}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (/^01\d{8}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (/^02\d{7,8}$/.test(d)) return `02-${d.slice(2, -4)}-${d.slice(-4)}`;
  if (/^0\d{9,10}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, -4)}-${d.slice(-4)}`;
  return d;
}

export function trimTo(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

export const INTEREST_OPTIONS = ['개인회생', '개인파산'];

export const DEBT_OPTIONS = [
  '2,000만원 이하',
  '2,000만원 ~ 5,000만원',
  '5,000만원 ~ 1억 이하',
  '1억 이상',
];

export const SOURCE_LABELS = {
  hero: '상단 빠른상담',
  mid: '중단 빠른상담',
  detail: '하단 상담폼',
};

export const STATUS_OPTIONS = ['new', 'contacted', 'done', 'canceled'];

export const STATUS_LABELS = {
  new: '신규',
  contacted: '연락완료',
  done: '상담완료',
  canceled: '취소',
};

/** KST 기준 'YYYY-MM-DD HH:mm' */
export function formatKst(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return parts.replace('T', ' ');
}
