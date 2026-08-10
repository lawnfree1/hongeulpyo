import { useEffect, useState } from 'react';
import { getNotifySettings, saveNotifySettings, sendTestSms } from '../../lib/api';

const MAX_PHONES = 10;

export default function NotifySettingsPanel() {
  const [phones, setPhones] = useState<string[]>(['']);
  const [senderPhone, setSenderPhone] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [solapiConfigured, setSolapiConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getNotifySettings();
        setPhones(settings.notifyPhones.length > 0 ? settings.notifyPhones : ['']);
        setSenderPhone(settings.senderPhone);
        setNotifyEnabled(settings.notifyEnabled);
        setSolapiConfigured(settings.solapiConfigured);
      } catch (err) {
        setMessage({
          ok: false,
          text: err instanceof Error ? err.message : '설정을 불러오지 못했습니다.',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function updatePhone(index: number, value: string) {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhones((prev) => prev.map((p, i) => (i === index ? digits : p)));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    setMessage(null);
    const cleaned = phones.map((p) => p.trim()).filter(Boolean);

    const invalid = cleaned.find((p) => !/^01[016789]\d{7,8}$/.test(p));
    if (invalid) {
      setMessage({ ok: false, text: `수신번호 형식이 올바르지 않습니다: ${invalid}` });
      return;
    }
    if (senderPhone && !/^0\d{8,10}$/.test(senderPhone)) {
      setMessage({ ok: false, text: '발신번호 형식이 올바르지 않습니다.' });
      return;
    }

    setSaving(true);
    try {
      const result = await saveNotifySettings({
        notifyPhones: cleaned,
        senderPhone,
        notifyEnabled,
      });
      setPhones(result.notifyPhones.length > 0 ? result.notifyPhones : ['']);
      setMessage({ ok: true, text: '설정을 저장했습니다.' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : '저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setMessage(null);
    setTesting(true);
    try {
      const result = await sendTestSms();
      setMessage({ ok: true, text: result.message });
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : '테스트 발송에 실패했습니다.',
      });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return <p className="text-[#969696] py-12 text-center text-[14px]">불러오는 중...</p>;
  }

  return (
    <form onSubmit={handleSave} className="max-w-[600px] space-y-6">
      {!solapiConfigured && (
        <p className="bg-[#2a2414] border border-[#f3a600] rounded px-3 py-2 text-[#f3a600] text-[13px] leading-[20px]">
          솔라피 API 키가 서버에 설정되지 않았습니다. 배포 환경의 <code>SOLAPI_API_KEY</code>,{' '}
          <code>SOLAPI_API_SECRET</code> 환경변수를 확인해 주세요. 설정 전까지 신청 내역은 저장되지만
          문자는 발송되지 않습니다.
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="sender-phone" className="block text-white text-[15px] font-semibold">
          발신번호
        </label>
        <p className="text-[#969696] text-[13px] leading-[20px]">
          솔라피 계정에 <strong className="text-[#c8c8c8]">사전 등록된 번호</strong>만 사용할 수
          있습니다. 하이픈 없이 숫자만 입력하세요.
        </p>
        <input
          id="sender-phone"
          type="tel"
          inputMode="numeric"
          value={senderPhone}
          onChange={(e) => setSenderPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
          placeholder="예: 0517170592"
          className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white text-[14px] placeholder:text-[#555] focus:outline-none focus:border-[#e14140]"
        />
      </div>

      <div className="space-y-2">
        <span className="block text-white text-[15px] font-semibold">알림 수신번호</span>
        <p className="text-[#969696] text-[13px] leading-[20px]">
          상담 신청이 접수되면 아래 번호로 신청 내용이 문자로 발송됩니다. 휴대폰 번호만 가능하며 최대{' '}
          {MAX_PHONES}개까지 등록할 수 있습니다.
        </p>

        <div className="space-y-2">
          {phones.map((phone, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => updatePhone(index, e.target.value)}
                placeholder="예: 01012345678"
                aria-label={`수신번호 ${index + 1}`}
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white text-[14px] placeholder:text-[#555] focus:outline-none focus:border-[#e14140]"
              />
              <button
                type="button"
                onClick={() => setPhones((prev) => (prev.length === 1 ? [''] : prev.filter((_, i) => i !== index)))}
                className="px-3 py-2 border border-[#333] text-[#969696] rounded text-[13px] hover:border-[#e14140] hover:text-[#e14140]"
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        {phones.length < MAX_PHONES && (
          <button
            type="button"
            onClick={() => setPhones((prev) => [...prev, ''])}
            className="text-[#fc0] text-[13px] hover:underline"
          >
            + 번호 추가
          </button>
        )}
      </div>

      <label className="flex gap-2 items-center cursor-pointer">
        <input
          type="checkbox"
          checked={notifyEnabled}
          onChange={(e) => setNotifyEnabled(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-white text-[14px]">상담 신청 시 문자 알림 발송</span>
      </label>

      {message && (
        <p
          role="status"
          className={`rounded px-3 py-2 text-[14px] leading-[22px] border ${
            message.ok
              ? 'border-[#08c41e] bg-[#14240f] text-[#08c41e]'
              : 'border-[#e14140] bg-[#2a1414] text-[#e14140]'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-[#e14140] text-white rounded text-[15px] font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="px-5 py-2 bg-[#333] text-white rounded text-[15px] hover:bg-[#444] disabled:opacity-60"
        >
          {testing ? '발송 중...' : '테스트 문자 발송'}
        </button>
      </div>
      <p className="text-[#666] text-[12px] leading-[18px]">
        테스트 발송은 저장된 설정을 사용합니다. 변경한 내용을 먼저 저장한 뒤 눌러 주세요. 실제 문자가
        발송되어 요금이 부과됩니다.
      </p>
    </form>
  );
}
