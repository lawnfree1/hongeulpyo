import { useEffect, useState } from 'react';
import ConsultationList from '../components/admin/ConsultationList';
import NotifySettingsPanel from '../components/admin/NotifySettingsPanel';
import PasswordPanel from '../components/admin/PasswordPanel';
import AdminLogin from './AdminLogin';
import { getSession, logout } from '../lib/api';

type Tab = 'list' | 'settings' | 'password';

const TABS: { id: Tab; label: string }[] = [
  { id: 'list', label: '상담 신청 내역' },
  { id: 'settings', label: '알림 설정' },
  { id: 'password', label: '비밀번호 변경' },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passwordIsInitial, setPasswordIsInitial] = useState(false);
  const [tab, setTab] = useState<Tab>('list');

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        setAuthenticated(session.authenticated);
        setPasswordIsInitial(Boolean(session.passwordIsInitial));
      } catch {
        setAuthenticated(false);
      }
    })();
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAuthenticated(false);
      setTab('list');
    }
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#969696] font-['Pretendard'] text-[14px]">불러오는 중...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminLogin
        onSuccess={(initial) => {
          setPasswordIsInitial(initial);
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black font-['Pretendard'] pb-16">
      <header className="border-b border-[#333] px-4 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="font-['SCoreDream'] font-bold text-[18px] md:text-[22px] text-white">
              법무사 홍을표 사무소
            </h1>
            <p className="text-[#969696] text-[12px]">관리자 페이지</p>
          </div>
          <div className="flex gap-2 items-center">
            <a
              href="/"
              className="px-3 py-2 text-[#969696] text-[13px] hover:text-white whitespace-nowrap"
            >
              홈페이지
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 border border-[#333] text-white rounded text-[13px] hover:border-[#e14140] whitespace-nowrap"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {passwordIsInitial && tab !== 'password' && (
          <div className="bg-[#2a2414] border border-[#f3a600] rounded px-4 py-3 flex flex-col md:flex-row md:items-center gap-2 justify-between">
            <p className="text-[#f3a600] text-[13px] leading-[20px]">
              초기 비밀번호를 사용 중입니다. 보안을 위해 비밀번호를 변경해 주세요.
            </p>
            <button
              type="button"
              onClick={() => setTab('password')}
              className="px-3 py-2 bg-[#f3a600] text-[#1a1a1a] rounded text-[13px] font-semibold whitespace-nowrap"
            >
              지금 변경하기
            </button>
          </div>
        )}

        <nav className="flex gap-1 border-b border-[#333] overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-3 text-[14px] border-b-2 -mb-px whitespace-nowrap transition-colors ${
                tab === item.id
                  ? 'border-[#e14140] text-[#e14140] font-semibold'
                  : 'border-transparent text-[#969696] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === 'list' && <ConsultationList />}
        {tab === 'settings' && <NotifySettingsPanel />}
        {tab === 'password' && (
          <PasswordPanel
            onChanged={() => {
              setAuthenticated(false);
              setPasswordIsInitial(false);
              setTab('list');
            }}
          />
        )}
      </main>
    </div>
  );
}
