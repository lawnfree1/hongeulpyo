import { useCallback, useEffect, useState } from 'react';
import {
  deleteConsultation,
  listConsultations,
  resendSms,
  updateConsultation,
  type Consultation,
  type ConsultationPage,
} from '../../lib/api';

const STATUS_OPTIONS = [
  { value: 'new', label: '신규' },
  { value: 'contacted', label: '연락완료' },
  { value: 'done', label: '상담완료' },
  { value: 'canceled', label: '취소' },
];

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-[#0051ff]',
  contacted: 'bg-[#f3a600]',
  done: 'bg-[#08c41e]',
  canceled: 'bg-[#969696]',
};

const SMS_LABELS: Record<string, string> = {
  sent: '발송됨',
  failed: '실패',
  skipped: '건너뜀',
  pending: '대기',
};

function formatPhone(digits: string) {
  if (/^01\d{9}$/.test(digits)) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (/^01\d{8}$/.test(digits)) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return digits;
}

export default function ConsultationList() {
  const [data, setData] = useState<ConsultationPage | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await listConsultations({ page, q: keyword, status }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, keyword, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function patchItem(updated: Consultation) {
    setData((prev) =>
      prev ? { ...prev, items: prev.items.map((i) => (i.id === updated.id ? updated : i)) } : prev
    );
  }

  async function handleStatusChange(item: Consultation, next: string) {
    setBusyId(item.id);
    try {
      const result = await updateConsultation(item.id, { status: next });
      patchItem(result.item);
    } catch (err) {
      setToast(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMemoSave(item: Consultation, memo: string) {
    if (memo === item.memo) return;
    setBusyId(item.id);
    try {
      const result = await updateConsultation(item.id, { memo });
      patchItem(result.item);
      setToast('메모를 저장했습니다.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : '메모 저장에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleResend(item: Consultation) {
    setBusyId(item.id);
    try {
      const result = await resendSms(item.id);
      patchItem(result.item);
      setToast(result.ok ? '문자를 재발송했습니다.' : `재발송 실패: ${result.sms.detail}`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : '재발송에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: Consultation) {
    if (!confirm(`${item.name}님의 신청 내역을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusyId(item.id);
    try {
      await deleteConsultation(item.id);
      setToast('삭제했습니다.');
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  }

  const stats = data?.stats ?? {};

  return (
    <div className="space-y-4">
      {/* 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <SummaryCard label="전체" value={data?.total ?? 0} active={status === ''} onClick={() => { setStatus(''); setPage(1); }} />
        {STATUS_OPTIONS.map((option) => (
          <SummaryCard
            key={option.value}
            label={option.label}
            value={stats[option.value] ?? 0}
            active={status === option.value}
            onClick={() => { setStatus(option.value); setPage(1); }}
          />
        ))}
      </div>

      {/* 검색 */}
      <div className="flex flex-col md:flex-row gap-2">
        <form
          className="flex gap-2 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setKeyword(searchInput.trim());
            setPage(1);
          }}
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="성함 또는 연락처 검색"
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white text-[14px] focus:outline-none focus:border-[#e14140]"
          />
          <button type="submit" className="px-4 py-2 bg-[#333] text-white rounded text-[14px] hover:bg-[#444]">
            검색
          </button>
        </form>
        <a
          href="/api/admin/consultations.csv"
          className="px-4 py-2 bg-[#333] text-white rounded text-[14px] hover:bg-[#444] text-center whitespace-nowrap"
        >
          CSV 내려받기
        </a>
      </div>

      {toast && (
        <p role="status" className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-[#fc0] text-[14px]">
          {toast}
        </p>
      )}
      {error && (
        <p role="alert" className="bg-[#2a1414] border border-[#e14140] rounded px-3 py-2 text-[#e14140] text-[14px]">
          {error}
        </p>
      )}

      {/* 목록 */}
      {loading && !data ? (
        <p className="text-[#969696] py-12 text-center text-[14px]">불러오는 중...</p>
      ) : data && data.items.length === 0 ? (
        <p className="text-[#969696] py-12 text-center text-[14px]">
          {keyword || status ? '조건에 맞는 내역이 없습니다.' : '아직 접수된 상담 신청이 없습니다.'}
        </p>
      ) : (
        <div className="border border-[#333] rounded overflow-hidden">
          {/* 헤더 (데스크톱) */}
          <div className="hidden md:grid grid-cols-[64px_100px_140px_100px_1fr_110px_100px] gap-2 bg-[#1a1a1a] px-4 py-3 text-[#969696] text-[13px] font-semibold">
            <div>번호</div>
            <div>성함</div>
            <div>연락처</div>
            <div>관심분야</div>
            <div>접수시각 / 경로</div>
            <div>상태</div>
            <div>문자</div>
          </div>

          {data?.items.map((item) => (
            <div key={item.id} className="border-t border-[#333] first:border-t-0">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full text-left grid grid-cols-2 md:grid-cols-[64px_100px_140px_100px_1fr_110px_100px] gap-2 px-4 py-3 hover:bg-[#141414] transition-colors items-center"
              >
                <div className="text-[#969696] text-[13px]">#{item.id}</div>
                <div className="text-white text-[14px] font-semibold">{item.name}</div>
                <div className="text-white text-[14px]">{formatPhone(item.phone)}</div>
                <div className="text-[#c8c8c8] text-[13px]">{item.interest ?? '-'}</div>
                <div className="text-[#969696] text-[13px]">
                  {item.createdAt}
                  <span className="hidden md:inline"> · {item.sourceLabel}</span>
                </div>
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-white text-[12px] ${
                      STATUS_COLORS[item.status] ?? 'bg-[#969696]'
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                </div>
                <div
                  className={`text-[12px] ${
                    item.smsStatus === 'sent'
                      ? 'text-[#08c41e]'
                      : item.smsStatus === 'failed'
                        ? 'text-[#e14140]'
                        : 'text-[#969696]'
                  }`}
                >
                  {SMS_LABELS[item.smsStatus] ?? item.smsStatus}
                </div>
              </button>

              {expandedId === item.id && (
                <ExpandedRow
                  item={item}
                  busy={busyId === item.id}
                  onStatusChange={(next) => handleStatusChange(item, next)}
                  onMemoSave={(memo) => handleMemoSave(item, memo)}
                  onResend={() => handleResend(item)}
                  onDelete={() => handleDelete(item)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 bg-[#333] text-white rounded text-[14px] disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-[#969696] text-[14px]">
            {data.page} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1 bg-[#333] text-white rounded text-[14px] disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-3 py-3 text-left border transition-colors ${
        active ? 'border-[#e14140] bg-[#2a1414]' : 'border-[#333] bg-[#1a1a1a] hover:border-[#555]'
      }`}
    >
      <div className="text-[#969696] text-[12px]">{label}</div>
      <div className="text-white text-[20px] font-bold">{value}</div>
    </button>
  );
}

function ExpandedRow({
  item,
  busy,
  onStatusChange,
  onMemoSave,
  onResend,
  onDelete,
}: {
  item: Consultation;
  busy: boolean;
  onStatusChange: (next: string) => void;
  onMemoSave: (memo: string) => void;
  onResend: () => void;
  onDelete: () => void;
}) {
  const [memo, setMemo] = useState(item.memo);

  useEffect(() => {
    setMemo(item.memo);
  }, [item.memo]);

  return (
    <div className="bg-[#111] px-4 py-4 space-y-3 border-t border-[#222]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
        <div className="text-[#969696]">
          채무범위: <span className="text-white">{item.debtRange ?? '-'}</span>
        </div>
        <div className="text-[#969696]">
          접수경로: <span className="text-white">{item.sourceLabel}</span>
        </div>
        <div className="text-[#969696] md:col-span-2">
          문자 발송: <span className="text-white">{item.smsStatus}</span>
          {item.smsDetail && <span className="text-[#666]"> — {item.smsDetail}</span>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor={`memo-${item.id}`} className="block text-[#969696] text-[12px]">
            메모
          </label>
          <textarea
            id={`memo-${item.id}`}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={() => onMemoSave(memo)}
            rows={2}
            maxLength={1000}
            placeholder="상담 내용을 기록해 두세요 (입력 후 다른 곳을 클릭하면 저장됩니다)"
            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#e14140] resize-y"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`status-${item.id}`} className="block text-[#969696] text-[12px]">
            상태
          </label>
          <select
            id={`status-${item.id}`}
            value={item.status}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={busy}
            className="bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#e14140] disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <a
          href={`tel:${item.phone}`}
          className="px-3 py-2 bg-[#0051ff] text-white rounded text-[13px] hover:opacity-90"
        >
          전화 걸기
        </a>
        <button
          type="button"
          onClick={onResend}
          disabled={busy}
          className="px-3 py-2 bg-[#333] text-white rounded text-[13px] hover:bg-[#444] disabled:opacity-50"
        >
          알림 문자 재발송
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="px-3 py-2 border border-[#e14140] text-[#e14140] rounded text-[13px] hover:bg-[#2a1414] disabled:opacity-50 ml-auto"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
