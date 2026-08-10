import { useState } from 'react';
import { login } from '../lib/api';

interface AdminLoginProps {
  onSuccess: (passwordIsInitial: boolean) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);
    try {
      const result = await login(password);
      onSuccess(result.passwordIsInitial);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-['Pretendard']">
      <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-['SCoreDream'] font-bold text-[28px] text-white">
            법무사 홍을표 사무소
          </h1>
          <p className="text-[#969696] text-[14px]">관리자 페이지</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="admin-password" className="block text-white text-[14px]">
            비밀번호
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full bg-white rounded-[5px] px-[14px] py-[12px] text-[#333] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#e14140]"
          />
        </div>

        {error && (
          <p role="alert" className="text-[#e14140] text-[14px] leading-[22px]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#e14140] text-white font-semibold text-[18px] py-[12px] rounded-[5px] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? '확인 중...' : '로그인'}
        </button>

        <a href="/" className="block text-center text-[#969696] text-[13px] hover:text-white">
          ← 홈페이지로 돌아가기
        </a>
      </form>
    </div>
  );
}
