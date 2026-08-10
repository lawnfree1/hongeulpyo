import { useId, useState } from 'react';
import { submitConsultation, type FormSource } from '../lib/api';

const BUTTON_STYLES = {
  red: {
    backgroundImage:
      'linear-gradient(-72.67098334790725deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 51.166%), linear-gradient(90deg, rgb(225, 65, 64) 0%, rgb(225, 65, 64) 100%)',
    textClass: 'text-white',
  },
  yellow: {
    backgroundImage:
      'linear-gradient(-72.67098334790725deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 51.166%), linear-gradient(90deg, rgb(255, 204, 0) 0%, rgb(255, 204, 0) 100%)',
    textClass: 'text-[#333]',
  },
} as const;

interface QuickConsultFormProps {
  source: FormSource;
  variant: keyof typeof BUTTON_STYLES;
}

/** 상단·중단의 가로형 빠른 상담 신청 바 */
export default function QuickConsultForm({ source, variant }: QuickConsultFormProps) {
  const agreeId = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const button = BUTTON_STYLES[variant];

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
      await submitConsultation({ name: name.trim(), phone, agreed, source });
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-[8px] w-full lg:w-auto lg:items-center flex-1 min-w-0"
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

      <div className="flex flex-col gap-[8px] flex-1 min-w-0">
        <div className="flex flex-col md:flex-row gap-[8px] w-full">
          <input
            type="text"
            placeholder="성함"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            autoComplete="name"
            className="flex-1 min-w-0 bg-white px-[12px] py-[8px] rounded-[5px] text-[#333] placeholder:text-[#d8d8d8] font-['Pretendard'] text-[16px] leading-[26px] focus:outline-none focus:ring-2 focus:ring-[#fc0]"
          />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="연락처(- 없이 숫자만 입력)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
            autoComplete="tel"
            className="flex-1 min-w-0 bg-white px-[12px] py-[8px] rounded-[5px] text-[#333] placeholder:text-[#d8d8d8] font-['Pretendard'] text-[16px] leading-[26px] focus:outline-none focus:ring-2 focus:ring-[#fc0]"
          />
        </div>

        <div className="flex gap-[4px] items-center">
          <input
            type="checkbox"
            id={agreeId}
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-[11px] h-[11px] rounded-[2px] flex-shrink-0"
          />
          <label
            htmlFor={agreeId}
            className="text-white text-[12px] md:text-[14px] leading-[24px] font-['Pretendard'] font-light cursor-pointer"
          >
            개인정보 수집 및 이용에 동의합니다.
          </label>
        </div>

        {feedback && (
          <p
            role="status"
            className={`font-['Pretendard'] text-[13px] md:text-[14px] leading-[20px] ${
              feedback.ok ? 'text-[#fc0]' : 'text-white'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full lg:w-[269px] lg:self-stretch px-[24px] py-[8px] rounded-[5px] flex-shrink-0 flex items-center justify-center drop-shadow-[0px_0px_9.25px_rgba(255,255,255,0.53)] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        style={{ backgroundImage: button.backgroundImage }}
      >
        <p
          className={`font-['SCoreDream'] font-bold text-[26px] leading-[36px] tracking-[-1.3px] whitespace-nowrap ${button.textClass}`}
        >
          {submitting ? '접수 중...' : '무료 상담 신청'}
        </p>
      </button>
    </form>
  );
}
