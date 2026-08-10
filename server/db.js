import mysql from 'mysql2/promise';

const DATABASE_TYPE = process.env.DATABASE_TYPE ?? 'mysql';

if (DATABASE_TYPE !== 'mysql') {
  throw new Error(`지원하지 않는 DATABASE_TYPE 입니다: ${DATABASE_TYPE} (mysql만 지원)`);
}

/**
 * 서버리스(Vercel)에서는 인스턴스가 재사용되므로 풀을 모듈 스코프에 한 번만 만든다.
 * connectionLimit을 낮게 잡아야 인스턴스가 늘어나도 DB 최대 커넥션을 넘지 않는다.
 */
let pool;

/**
 * AWS RDS는 자체 CA로 서명한 인증서를 쓰기 때문에 Node 기본 신뢰 저장소로는 검증이 실패한다.
 * mysql2에 내장된 'Amazon RDS' 프리셋이 해당 CA를 갖고 있어 그대로 쓴다.
 */
function sslOption() {
  if (process.env.DATABASE_SSL !== 'true') return {};

  const host = process.env.DATABASE_HOST || '';
  return host.endsWith('.rds.amazonaws.com')
    ? { ssl: 'Amazon RDS' }
    : { ssl: { rejectUnauthorized: true, minVersion: 'TLSv1.2' } };
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST || '127.0.0.1',
      port: Number(process.env.DATABASE_PORT || 3306),
      user: process.env.DATABASE_USERNAME || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'hongeulpyo',
      waitForConnections: true,
      connectionLimit: Number(process.env.DATABASE_POOL_SIZE || 4),
      queueLimit: 0,
      charset: 'utf8mb4_general_ci',
      timezone: 'Z',
      enableKeepAlive: true,
      ...sslOption(),
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS consultations (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     name        VARCHAR(100)  NOT NULL,
     phone       VARCHAR(20)   NOT NULL,
     interest    VARCHAR(50)   NULL,
     debt_range  VARCHAR(50)   NULL,
     source      VARCHAR(50)   NULL,
     status      VARCHAR(20)   NOT NULL DEFAULT 'new',
     memo        TEXT          NULL,
     sms_status  VARCHAR(20)   NOT NULL DEFAULT 'pending',
     sms_detail  TEXT          NULL,
     ip          VARCHAR(64)   NULL,
     user_agent  VARCHAR(500)  NULL,
     created_at  DATETIME      NOT NULL,
     INDEX idx_consultations_created_at (created_at DESC),
     INDEX idx_consultations_status (status)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS settings (
     \`key\`  VARCHAR(100) PRIMARY KEY,
     value  TEXT NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE IF NOT EXISTS login_attempts (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     ip         VARCHAR(64) NOT NULL,
     created_at DATETIME    NOT NULL,
     INDEX idx_login_attempts_ip (ip, created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
];

/** 초기 비밀번호. 관리자 페이지에서 반드시 변경하도록 안내한다. */
export const INITIAL_PASSWORD = 'password@@';

let schemaPromise;

/** 프로세스당 한 번만 실행된다. 서버리스 콜드스타트마다 1회. */
export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const statement of SCHEMA) {
        await getPool().query(statement);
      }
      await seedDefaults();
    })().catch((err) => {
      schemaPromise = undefined; // 실패하면 다음 요청에서 다시 시도
      throw err;
    });
  }
  return schemaPromise;
}

async function seedDefaults() {
  const { hashPassword } = await import('./auth.js');
  const { randomBytes } = await import('node:crypto');

  const defaults = {
    admin_password_hash: () => hashPassword(INITIAL_PASSWORD),
    /** 비밀번호가 바뀌면 올라간다. 기존 로그인 세션을 모두 무효화하는 용도. */
    password_version: () => '1',
    /** 초기 비밀번호를 아직 바꾸지 않았으면 '1' */
    password_is_initial: () => '1',
    /** 상담 신청 알림을 받을 번호 목록 (JSON 배열) */
    notify_phones: () => JSON.stringify([]),
    /** 솔라피에 사전 등록된 발신번호 */
    sender_phone: () => process.env.SOLAPI_SENDER || '',
    notify_enabled: () => '1',
    /** 세션 쿠키 서명 키. 환경변수가 없으면 생성해서 보관한다. */
    session_secret: () => process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  };

  for (const [key, makeValue] of Object.entries(defaults)) {
    await query('INSERT IGNORE INTO settings (`key`, value) VALUES (?, ?)', [key, makeValue()]);
  }
}

export async function getSetting(key, fallback = '') {
  const row = await queryOne('SELECT value FROM settings WHERE `key` = ?', [key]);
  return row?.value ?? fallback;
}

export async function getSettings(keys) {
  const placeholders = keys.map(() => '?').join(', ');
  const rows = await query(
    `SELECT \`key\`, value FROM settings WHERE \`key\` IN (${placeholders})`,
    keys
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSetting(key, value) {
  await query(
    'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
    [key, String(value)]
  );
}

export async function getNotifyPhones() {
  try {
    const parsed = JSON.parse(await getSetting('notify_phones', '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setNotifyPhones(phones) {
  await setSetting('notify_phones', JSON.stringify(phones));
}
