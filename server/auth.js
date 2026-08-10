import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { getSetting, getSettings, query, setSetting } from './db.js';

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE = 'hep_admin';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12시간

/* ── 비밀번호 해싱 (scrypt, 외부 의존성 없음) ───────────────────────── */

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored).split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;

  const actual = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * 비밀번호 규칙: 8자 이상, 영문/숫자/특수문자 중 2종류 이상.
 * @returns {string|null} 문제가 있으면 사유, 없으면 null
 */
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }
  if (password.length > 100) {
    return '비밀번호가 너무 깁니다.';
  }
  const kinds = [/[a-zA-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
  if (kinds < 2) {
    return '비밀번호는 영문·숫자·특수문자 중 2종류 이상을 포함해야 합니다.';
  }
  return null;
}

/* ── 세션 (서명된 쿠키, 서버리스에서도 동작) ────────────────────────── */

async function getSessionSecret() {
  return process.env.SESSION_SECRET || (await getSetting('session_secret'));
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export async function issueSessionCookie(res) {
  const [secret, passwordVersion] = await Promise.all([
    getSessionSecret(),
    getSetting('password_version', '1'),
  ]);

  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + SESSION_MAX_AGE_MS,
      pv: passwordVersion,
      jti: randomBytes(8).toString('hex'),
    })
  ).toString('base64url');

  res.cookie(SESSION_COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function readSession(req) {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (!raw || !raw.includes('.')) return null;

  const [payload, signature] = raw.split('.');
  const { session_secret, password_version } = await getSettings([
    'session_secret',
    'password_version',
  ]);
  const secret = process.env.SESSION_SECRET || session_secret;
  if (!secret) return null;

  const expected = Buffer.from(sign(payload, secret));
  const provided = Buffer.from(signature ?? '');
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!data?.exp || data.exp < Date.now()) return null;
  // 비밀번호가 바뀌면 이전에 발급된 세션은 전부 무효
  if (String(data.pv) !== String(password_version ?? '1')) return null;

  return data;
}

export async function requireAuth(req, res, next) {
  try {
    const session = await readSession(req);
    if (!session) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    req.session = session;
    next();
  } catch (err) {
    next(err);
  }
}

/* ── 로그인 시도 제한 ──────────────────────────────────────────────── */

const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MINUTES = 15;

export async function countRecentFailures(ip) {
  const row = await query(
    'SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND created_at > (UTC_TIMESTAMP() - INTERVAL ? MINUTE)',
    [ip, ATTEMPT_WINDOW_MINUTES]
  );
  return Number(row[0]?.n ?? 0);
}

export async function recordFailure(ip) {
  await query('INSERT INTO login_attempts (ip, created_at) VALUES (?, UTC_TIMESTAMP())', [ip]);
  // 오래된 기록은 정리
  await query('DELETE FROM login_attempts WHERE created_at < (UTC_TIMESTAMP() - INTERVAL 1 DAY)');
}

export async function clearFailures(ip) {
  await query('DELETE FROM login_attempts WHERE ip = ?', [ip]);
}

export const loginLimit = { MAX_ATTEMPTS, ATTEMPT_WINDOW_MINUTES };

/** 비밀번호 변경 — 기존 세션을 모두 무효화한다. */
export async function changePassword(newPassword) {
  const current = Number(await getSetting('password_version', '1'));
  await setSetting('admin_password_hash', hashPassword(newPassword));
  await setSetting('password_version', String(current + 1));
  await setSetting('password_is_initial', '0');
}
