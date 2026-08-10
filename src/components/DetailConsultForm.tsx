import { useId, useState } from 'react';
import { submitConsultation } from '../lib/api';

const INTEREST_OPTIONS = ['개인회생', '개인파산'] as const;

const DEBT_OPTIONS = [
  '2,000만원 이하',
  '2,000만원 ~ 5,000만원',
  '5,000만원 ~ 1억 이하',
  '1억 이상',
] as const;

/** 하단 CTA 섹션의 흰색 카드형 상담 신청 폼 */
export default function DetailConsultForm() {
  const agreeId = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState<string>(INTEREST_OPTIONS[0]);
  const [debtRange, setDebtRange] = useState<string>(DEBT_OPTIONS[0]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ ok: false, text: '성함을 입력해 주세요.' });
      return;
    }
    if (!/^0\d{8,10}$/.test(phone)) {
      setFeedback({ ok: false, text: '연락처를 정확히 입력해 주세요. (숫자만)' });
      return;
    }
    if (!agreed) {
      setFeedback({ ok: false, text: '개인정보 수집 및 이용에 동의해 주세요.' });
      return;
    }

    setSubmitting(true);
    try {
      await submitConsultation({
        name: name.trim(),
        phone,
        agreed,
        interest,
        debtRange,
        source: 'detail',
      });
      setFeedback({ ok: true, text: '상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.' });
      setName('');
      setPhone('');
      setAgreed(false);
    } catch (error) {
      setFeedback({
        ok: false,
        text: error instanceof Error ? error.message : '접수에 실패했습니다.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const optionClass = (selected: boolean) =>
    selected
      ? 'bg-[#ffeded] border border-[#e14140] text-[#e14140]'
      : 'bg-white border border-[#ebebeb] text-[#333]';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[20px] p-6 md:p-8 xl:p-12 space-y-6 w-full xl:w-auto"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        onChange={() => {}}
      />

      <div className="space-y-2">
        <label htmlFor={`${agreeId}-name`} className="font-['Pretendard'] font-semibold text-lg text-[#333] block">
          성함 <span className="text-[#e14140]">*</span>
        </label>
        <input
          id={`${agreeId}-name`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          autoComplete="name"
          className="w-full border-b border-[#ebebeb] pb-2 font-['Pretendard'] text-[#333] focus:outline-none focus:border-[#e14140]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${agreeId}-phone`} className="font-['Pretendard'] font-semibold text-lg text-[#333] block">
          연락처 <span className="text-[#e14140]">*</span>
        </label>
        <input
          id={`${agreeId}-phone`}
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
          placeholder="- 없이 숫자만 입력"
          autoComplete="tel"
          className="w-full border-b border-[#ebebeb] pb-2 font-['Pretendard'] text-[#333] placeholder:text-[#d8d8d8] focus:outline-none focus:border-[#e14140]"
        />
      </div>

      <div className="space-y-2">
        <span className="font-['Pretendard'] font-semibold text-lg text-[#333] block">관심 분야</span>
        <div className="flex gap-2">
          {INTEREST_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setInterest(option)}
              aria-pressed={interest === option}
              className={`flex-1 px-3 py-2 rounded font-['Pretendard'] transition-colors ${optionClass(
                interest === option
              )}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="font-['Pretendard'] font-semibold text-lg text-[#333] block">채무 범위</span>
        <div className="grid grid-cols-2 gap-2">
          {DEBT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDebtRange(option)}
              aria-pressed={debtRange === option}
              className={`px-3 py-2 rounded font-['Pretendard'] text-sm transition-colors ${optionClass(
                debtRange === option
              )}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="font-['Pretendard'] font-semibold text-lg text-[#333] block">
          개인정보 수집 및 이용 동의 <span className="text-[#e14140]">*</span>
        </span>
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            id={agreeId}
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-3 h-3 rounded"
          />
          <label
            htmlFor={agreeId}
            className="text-[#b4b4b4] text-[12px] md:text-sm font-['Pretendard'] cursor-pointer"
          >
            개인정보 수집 및 이용에 동의합니다.
          </label>
        </div>
      </div>

      {feedback && (
        <p
          role="status"
          className={`font-['Pretendard'] text-[14px] leading-[22px] ${
            feedback.ok ? 'text-[#0051ff]' : 'text-[#e14140]'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#e14140] text-white font-['Pretendard'] font-semibold text-[16px] md:text-[18px] xl:text-xl py-2 md:py-3 xl:py-3 rounded hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
      >
        {submitting ? '접수 중...' : '무료 상담 신청'}
      </button>
    </form>
  );
}
