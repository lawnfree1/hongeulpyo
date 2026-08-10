import { useState } from 'react';
import { changePassword } from '../../lib/api';

interface PasswordPanelProps {
  /** 비밀번호 변경 성공 시 — 기존 세션이 만료되므로 재로그인시킨다 */
  onChanged: () => void;
}

export default function PasswordPanel({ onChanged }: PasswordPanelProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setError('');

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    const kinds = [/[a-zA-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(newPassword)).length;
    if (kinds < 2) {
      setError('비밀번호는 영문·숫자·특수문자 중 2종류 이상을 포함해야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      alert('비밀번호를 변경했습니다. 보안을 위해 다시 로그인해 주세요.');
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white text-[14px] focus:outline-none focus:border-[#e14140]';

  return (
    <form onSubmit={handleSubmit} className="max-w-[440px] space-y-5">
      <p className="text-[#969696] text-[13px] leading-[20px]">
        비밀번호를 변경하면 로그인되어 있던 모든 기기에서 자동으로 로그아웃됩니다.
      </p>

      <div className="space-y-2">
        <label htmlFor="current-password" className="block text-white text-[14px]">
          현재 비밀번호
        </label>
        <input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="new-password" className="block text-white text-[14px]">
          새 비밀번호
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="text-[#666] text-[12px]">
          8자 이상, 영문·숫자·특수문자 중 2종류 이상 포함
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="block text-white text-[14px]">
          새 비밀번호 확인
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="bg-[#2a1414] border border-[#e14140] rounded px-3 py-2 text-[#e14140] text-[14px]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2 bg-[#e14140] text-white rounded text-[15px] font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  );
}
