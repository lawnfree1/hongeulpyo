import express from 'express';
import { query, queryOne } from '../db.js';
import { sendConsultationAlert } from '../sms.js';
import {
  DEBT_OPTIONS,
  INTEREST_OPTIONS,
  isValidContactPhone,
  normalizePhone,
  SOURCE_LABELS,
  trimTo,
} from '../validation.js';

const router = express.Router();

/** IP당 제출 제한 (인스턴스 로컬 — DB 중복 검사와 함께 쓴다) */
const submitLog = new Map();
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;
const SUBMIT_MAX = 8;

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (submitLog.get(ip) ?? []).filter((t) => now - t < SUBMIT_WINDOW_MS);
  recent.push(now);
  submitLog.set(ip, recent);

  if (submitLog.size > 5000) submitLog.clear();
  return recent.length > SUBMIT_MAX;
}

router.post('/consultations', async (req, res, next) => {
  try {
    const body = req.body ?? {};

    // 허니팟 — 사람은 채우지 않는 필드
    if (trimTo(body.website, 200)) {
      return res.json({ ok: true });
    }

    const name = trimTo(body.name, 50);
    const phone = normalizePhone(body.phone);
    const agreed = body.agreed === true || body.agreed === 'true';

    if (!name) {
      return res.status(400).json({ error: '성함을 입력해 주세요.' });
    }
    if (!isValidContactPhone(phone)) {
      return res.status(400).json({ error: '연락처를 정확히 입력해 주세요. (숫자만)' });
    }
    if (!agreed) {
      return res.status(400).json({ error: '개인정보 수집 및 이용에 동의해 주세요.' });
    }

    const ip = req.clientIp;
    if (isRateLimited(ip)) {
      return res
        .status(429)
        .json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
    }

    const interest = INTEREST_OPTIONS.includes(body.interest) ? body.interest : null;
    const debtRange = DEBT_OPTIONS.includes(body.debtRange) ? body.debtRange : null;
    const source = Object.keys(SOURCE_LABELS).includes(body.source) ? body.source : 'detail';

    // 같은 번호가 1분 내 중복 접수되면 새로 만들지 않는다 (더블 클릭/새로고침 방지)
    const duplicate = await queryOne(
      `SELECT id FROM consultations
       WHERE phone = ? AND created_at > (UTC_TIMESTAMP() - INTERVAL 1 MINUTE)
       ORDER BY id DESC LIMIT 1`,
      [phone]
    );
    if (duplicate) {
      return res.json({ ok: true, duplicated: true });
    }

    const result = await query(
      // DB 서버 타임존에 의존하지 않도록 항상 UTC로 저장하고, 표시할 때 KST로 바꾼다.
      `INSERT INTO consultations
         (name, phone, interest, debt_range, source, ip, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        name,
        phone,
        interest,
        debtRange,
        source,
        trimTo(ip, 64) || null,
        trimTo(req.get('user-agent'), 500) || null,
      ]
    );

    const id = result.insertId;
    const consultation = await queryOne('SELECT * FROM consultations WHERE id = ?', [id]);

    // 문자 발송이 실패해도 접수는 성공으로 처리한다.
    const sms = await sendConsultationAlert(consultation);
    await query('UPDATE consultations SET sms_status = ?, sms_detail = ? WHERE id = ?', [
      sms.status,
      sms.detail,
      id,
    ]);

    if (sms.status !== 'sent') {
      console.warn(`[consultation #${id}] 알림 문자 ${sms.status}: ${sms.detail}`);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
