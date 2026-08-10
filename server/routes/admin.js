import express from 'express';
import {
  changePassword,
  clearFailures,
  clearSessionCookie,
  countRecentFailures,
  issueSessionCookie,
  loginLimit,
  readSession,
  recordFailure,
  requireAuth,
  validatePassword,
  verifyPassword,
} from '../auth.js';
import {
  getSetting,
  getSettings,
  query,
  queryOne,
  setNotifyPhones,
  setSetting,
} from '../db.js';
import { sendConsultationAlert, sendTestMessage } from '../sms.js';
import {
  formatKst,
  isValidMobilePhone,
  normalizePhone,
  SOURCE_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  trimTo,
} from '../validation.js';

const router = express.Router();

/* ── 인증 ─────────────────────────────────────────────────────────── */

router.get('/session', async (req, res, next) => {
  try {
    const session = await readSession(req);
    if (!session) return res.json({ authenticated: false });

    const passwordIsInitial = (await getSetting('password_is_initial', '0')) === '1';
    res.json({ authenticated: true, passwordIsInitial });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const password = String(req.body?.password ?? '');
    const ip = req.clientIp;

    const failures = await countRecentFailures(ip);
    if (failures >= loginLimit.MAX_ATTEMPTS) {
      return res.status(429).json({
        error: `로그인 시도가 너무 많습니다. ${loginLimit.ATTEMPT_WINDOW_MINUTES}분 후 다시 시도해 주세요.`,
      });
    }

    const stored = await getSetting('admin_password_hash');
    if (!password || !verifyPassword(password, stored)) {
      await recordFailure(ip);
      const left = Math.max(0, loginLimit.MAX_ATTEMPTS - failures - 1);
      return res.status(401).json({
        error: `비밀번호가 올바르지 않습니다. (남은 시도 ${left}회)`,
      });
    }

    await clearFailures(ip);
    await issueSessionCookie(res);

    const passwordIsInitial = (await getSetting('password_is_initial', '0')) === '1';
    res.json({ ok: true, passwordIsInitial });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.post('/password', requireAuth, async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword ?? '');
    const newPassword = String(req.body?.newPassword ?? '');

    const stored = await getSetting('admin_password_hash');
    if (!verifyPassword(currentPassword, stored)) {
      return res.status(400).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    const problem = validatePassword(newPassword);
    if (problem) return res.status(400).json({ error: problem });

    if (verifyPassword(newPassword, stored)) {
      return res.status(400).json({ error: '현재 비밀번호와 다른 비밀번호를 입력해 주세요.' });
    }

    await changePassword(newPassword);
    clearSessionCookie(res); // 모든 기기에서 재로그인 필요
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ── 상담 신청 내역 ────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

router.get('/consultations', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const status = STATUS_OPTIONS.includes(req.query.status) ? req.query.status : null;
    const keyword = trimTo(req.query.q, 50);

    const where = [];
    const params = [];
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (keyword) {
      where.push('(name LIKE ? OR phone LIKE ?)');
      const like = `%${keyword.replace(/[%_\\]/g, '\\$&')}%`;
      params.push(like, normalizePhone(keyword) ? `%${normalizePhone(keyword)}%` : like);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRow = await queryOne(
      `SELECT COUNT(*) AS n FROM consultations ${whereSql}`,
      params
    );
    const total = Number(totalRow?.n ?? 0);
    const offset = (page - 1) * PAGE_SIZE;

    // LIMIT/OFFSET은 정수로 검증했으므로 직접 삽입한다 (prepared 바인딩 미지원)
    const rows = await query(
      `SELECT id, name, phone, interest, debt_range, source, status, memo,
              sms_status, sms_detail, created_at
         FROM consultations
         ${whereSql}
        ORDER BY id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    );

    const stats = await query('SELECT status, COUNT(*) AS n FROM consultations GROUP BY status');

    res.json({
      items: rows.map(serializeConsultation),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      stats: Object.fromEntries(stats.map((s) => [s.status, Number(s.n)])),
    });
  } catch (err) {
    next(err);
  }
});

function serializeConsultation(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    interest: row.interest,
    debtRange: row.debt_range,
    source: row.source,
    sourceLabel: SOURCE_LABELS[row.source] ?? row.source ?? '-',
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] ?? row.status,
    memo: row.memo ?? '',
    smsStatus: row.sms_status,
    smsDetail: row.sms_detail ?? '',
    createdAt: formatKst(row.created_at),
  };
}

router.patch('/consultations/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: '잘못된 요청입니다.' });

    const updates = [];
    const params = [];

    if (req.body?.status !== undefined) {
      if (!STATUS_OPTIONS.includes(req.body.status)) {
        return res.status(400).json({ error: '잘못된 상태값입니다.' });
      }
      updates.push('status = ?');
      params.push(req.body.status);
    }
    if (req.body?.memo !== undefined) {
      updates.push('memo = ?');
      params.push(trimTo(req.body.memo, 1000));
    }
    if (updates.length === 0) return res.status(400).json({ error: '변경할 내용이 없습니다.' });

    params.push(id);
    await query(`UPDATE consultations SET ${updates.join(', ')} WHERE id = ?`, params);

    const row = await queryOne('SELECT * FROM consultations WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: '내역을 찾을 수 없습니다.' });

    res.json({ ok: true, item: serializeConsultation(row) });
  } catch (err) {
    next(err);
  }
});

router.delete('/consultations/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: '잘못된 요청입니다.' });

    await query('DELETE FROM consultations WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/** 문자 발송에 실패한 건을 다시 보낸다. */
router.post('/consultations/:id/resend', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await queryOne('SELECT * FROM consultations WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: '내역을 찾을 수 없습니다.' });

    const sms = await sendConsultationAlert(row);
    await query('UPDATE consultations SET sms_status = ?, sms_detail = ? WHERE id = ?', [
      sms.status,
      sms.detail,
      id,
    ]);

    const updated = await queryOne('SELECT * FROM consultations WHERE id = ?', [id]);
    res.json({ ok: sms.status === 'sent', sms, item: serializeConsultation(updated) });
  } catch (err) {
    next(err);
  }
});

router.get('/consultations.csv', requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, name, phone, interest, debt_range, source, status, memo, sms_status, created_at
         FROM consultations ORDER BY id DESC`
    );

    const header = [
      '번호', '성함', '연락처', '관심분야', '채무범위',
      '접수경로', '상태', '메모', '문자발송', '접수시각',
    ];
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const csv = [
      header.map(escape).join(','),
      ...rows.map((r) =>
        [
          r.id, r.name, r.phone, r.interest ?? '', r.debt_range ?? '',
          SOURCE_LABELS[r.source] ?? r.source ?? '',
          STATUS_LABELS[r.status] ?? r.status,
          r.memo ?? '', r.sms_status, formatKst(r.created_at),
        ].map(escape).join(',')
      ),
    ].join('\r\n');

    const stamp = formatKst(new Date()).replace(/[: ]/g, '-');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="consultations-${stamp}.csv"`);
    res.send(`﻿${csv}`); // Excel 한글 깨짐 방지 BOM
  } catch (err) {
    next(err);
  }
});

/* ── 알림 설정 ─────────────────────────────────────────────────────── */

router.get('/settings', requireAuth, async (req, res, next) => {
  try {
    const settings = await getSettings(['notify_phones', 'sender_phone', 'notify_enabled']);
    let notifyPhones = [];
    try {
      const parsed = JSON.parse(settings.notify_phones ?? '[]');
      if (Array.isArray(parsed)) notifyPhones = parsed;
    } catch {
      notifyPhones = [];
    }

    res.json({
      notifyPhones,
      senderPhone: settings.sender_phone ?? '',
      notifyEnabled: settings.notify_enabled === '1',
      solapiConfigured: Boolean(process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET),
    });
  } catch (err) {
    next(err);
  }
});

router.put('/settings', requireAuth, async (req, res, next) => {
  try {
    const rawPhones = Array.isArray(req.body?.notifyPhones) ? req.body.notifyPhones : [];
    const notifyPhones = [];

    for (const raw of rawPhones.slice(0, 10)) {
      const digits = normalizePhone(raw);
      if (!digits) continue;
      if (!isValidMobilePhone(digits)) {
        return res.status(400).json({ error: `수신번호 형식이 올바르지 않습니다: ${raw}` });
      }
      if (!notifyPhones.includes(digits)) notifyPhones.push(digits);
    }

    const senderPhone = normalizePhone(req.body?.senderPhone);
    if (senderPhone && !/^0\d{8,10}$/.test(senderPhone)) {
      return res.status(400).json({ error: '발신번호 형식이 올바르지 않습니다.' });
    }

    await setNotifyPhones(notifyPhones);
    await setSetting('sender_phone', senderPhone);
    await setSetting('notify_enabled', req.body?.notifyEnabled === false ? '0' : '1');

    res.json({ ok: true, notifyPhones, senderPhone });
  } catch (err) {
    next(err);
  }
});

router.post('/settings/test', requireAuth, async (req, res, next) => {
  try {
    const [senderPhone, notifyPhonesJson] = await Promise.all([
      getSetting('sender_phone', ''),
      getSetting('notify_phones', '[]'),
    ]);

    const from = normalizePhone(senderPhone);
    if (!from) return res.status(400).json({ error: '발신번호를 먼저 저장해 주세요.' });

    let to = [];
    try {
      to = JSON.parse(notifyPhonesJson).map(normalizePhone).filter(Boolean);
    } catch {
      to = [];
    }
    if (to.length === 0) return res.status(400).json({ error: '수신번호를 먼저 저장해 주세요.' });

    await sendTestMessage({ from, to });
    res.json({ ok: true, message: `${to.length}개 번호로 테스트 문자를 발송했습니다.` });
  } catch (err) {
    res.status(400).json({ error: err.message || '테스트 발송에 실패했습니다.' });
  }
});

export default router;
