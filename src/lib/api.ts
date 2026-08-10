export type FormSource = 'hero' | 'mid' | 'detail';

export interface ConsultationInput {
  name: string;
  phone: string;
  agreed: boolean;
  interest?: string | null;
  debtRange?: string | null;
  source: FormSource;
  /** 허니팟 — 사람은 채우지 않는다 */
  website?: string;
}

export interface Consultation {
  id: number;
  name: string;
  phone: string;
  interest: string | null;
  debtRange: string | null;
  source: string;
  sourceLabel: string;
  status: string;
  statusLabel: string;
  memo: string;
  smsStatus: 'pending' | 'sent' | 'failed' | 'skipped';
  smsDetail: string;
  createdAt: string;
}

export interface ConsultationPage {
  items: Consultation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: Record<string, number>;
}

export interface NotifySettings {
  notifyPhones: string[];
  senderPhone: string;
  notifyEnabled: boolean;
  solapiConfigured: boolean;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      ...options,
    });
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? '요청을 처리하지 못했습니다.', response.status);
  }
  return payload as T;
}

/* ── 방문자용 ─────────────────────────────────────────────────────── */

export function submitConsultation(input: ConsultationInput) {
  return request<{ ok: true; duplicated?: boolean }>('/api/consultations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/* ── 관리자용 ─────────────────────────────────────────────────────── */

export function getSession() {
  return request<{ authenticated: boolean; passwordIsInitial?: boolean }>('/api/admin/session');
}

export function login(password: string) {
  return request<{ ok: true; passwordIsInitial: boolean }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  return request<{ ok: true }>('/api/admin/logout', { method: 'POST' });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ ok: true }>('/api/admin/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function listConsultations(params: { page?: number; q?: string; status?: string } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.q) search.set('q', params.q);
  if (params.status) search.set('status', params.status);

  const qs = search.toString();
  return request<ConsultationPage>(`/api/admin/consultations${qs ? `?${qs}` : ''}`);
}

export function updateConsultation(id: number, patch: { status?: string; memo?: string }) {
  return request<{ ok: true; item: Consultation }>(`/api/admin/consultations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function deleteConsultation(id: number) {
  return request<{ ok: true }>(`/api/admin/consultations/${id}`, { method: 'DELETE' });
}

export function resendSms(id: number) {
  return request<{ ok: boolean; sms: { status: string; detail: string }; item: Consultation }>(
    `/api/admin/consultations/${id}/resend`,
    { method: 'POST' }
  );
}

export function getNotifySettings() {
  return request<NotifySettings>('/api/admin/settings');
}

export function saveNotifySettings(settings: {
  notifyPhones: string[];
  senderPhone: string;
  notifyEnabled: boolean;
}) {
  return request<{ ok: true; notifyPhones: string[]; senderPhone: string }>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function sendTestSms() {
  return request<{ ok: true; message: string }>('/api/admin/settings/test', { method: 'POST' });
}

export { ApiError };
