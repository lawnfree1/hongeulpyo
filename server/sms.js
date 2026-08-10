import { SolapiMessageService } from 'solapi';
import { getNotifyPhones, getSetting } from './db.js';
import { formatKst, formatPhone, normalizePhone, SOURCE_LABELS } from './validation.js';

let service;

function getService() {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  if (!apiKey || !apiSecret) return null;

  if (!service) {
    service = new SolapiMessageService(apiKey, apiSecret);
  }
  return service;
}

export function buildAlertText(consultation) {
  const lines = [
    '[홍을표 법무사] 상담 신청',
    '',
    `성함: ${consultation.name}`,
    `연락처: ${formatPhone(consultation.phone)}`,
  ];

  if (consultation.interest) lines.push(`관심분야: ${consultation.interest}`);
  if (consultation.debt_range) lines.push(`채무범위: ${consultation.debt_range}`);

  lines.push(`접수경로: ${SOURCE_LABELS[consultation.source] ?? consultation.source ?? '-'}`);
  lines.push(`접수시각: ${formatKst(consultation.created_at)}`);

  return lines.join('\n');
}

/**
 * 솔라피 오류 응답에서 사람이 읽을 만한 사유만 뽑아낸다.
 */
function describeError(err) {
  const detail =
    err?.failedMessageList?.[0]?.statusMessage ??
    err?.response?.data?.errorMessage ??
    err?.errorMessage ??
    err?.message ??
    '알 수 없는 오류';
  return String(detail).slice(0, 500);
}

/**
 * 상담 신청 알림 문자를 설정된 수신번호로 발송한다.
 * 발송 실패가 신청 접수를 막으면 안 되므로 예외를 던지지 않는다.
 * @returns {Promise<{status: 'sent'|'failed'|'skipped', detail: string}>}
 */
export async function sendConsultationAlert(consultation) {
  const [enabled, senderRaw, notifyPhones] = await Promise.all([
    getSetting('notify_enabled', '1'),
    getSetting('sender_phone', ''),
    getNotifyPhones(),
  ]);

  if (enabled !== '1') {
    return { status: 'skipped', detail: '알림 발송이 꺼져 있습니다.' };
  }

  const client = getService();
  if (!client) {
    return { status: 'skipped', detail: 'SOLAPI_API_KEY / SOLAPI_API_SECRET 미설정' };
  }

  const from = normalizePhone(senderRaw);
  if (!from) {
    return { status: 'skipped', detail: '발신번호가 설정되지 않았습니다. (/admin → 알림 설정)' };
  }

  const to = notifyPhones.map(normalizePhone).filter(Boolean);
  if (to.length === 0) {
    return { status: 'skipped', detail: '수신번호가 설정되지 않았습니다. (/admin → 알림 설정)' };
  }

  try {
    const result = await client.send({
      to,
      from,
      text: buildAlertText(consultation),
      subject: `[상담신청] ${consultation.name}님`,
    });

    const failed = result?.groupInfo?.count?.registeredFailed ?? 0;
    const succeeded = result?.groupInfo?.count?.registeredSuccess ?? to.length;

    if (failed > 0) {
      return {
        status: succeeded > 0 ? 'sent' : 'failed',
        detail: `성공 ${succeeded}건 / 실패 ${failed}건`,
      };
    }
    return { status: 'sent', detail: `${to.length}개 번호로 발송` };
  } catch (err) {
    return { status: 'failed', detail: describeError(err) };
  }
}

/**
 * 설정 화면의 "테스트 발송" 용. 여기서는 실패를 그대로 알려야 하므로 예외를 던진다.
 */
export async function sendTestMessage({ from, to }) {
  const client = getService();
  if (!client) {
    throw new Error('SOLAPI_API_KEY / SOLAPI_API_SECRET 환경변수가 설정되지 않았습니다.');
  }

  const sample = buildAlertText({
    name: '테스트',
    phone: '01000000000',
    interest: '개인회생',
    debt_range: '2,000만원 이하',
    source: 'detail',
    created_at: new Date(),
  });

  try {
    return await client.send({
      to,
      from,
      text: `${sample}\n\n※ 설정 확인용 테스트 발송입니다.`,
      subject: '[상담신청] 테스트 발송',
    });
  } catch (err) {
    throw new Error(describeError(err));
  }
}
