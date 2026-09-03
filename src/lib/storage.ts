import { FeedbackItem, UserSession, OtpLogEntry } from './types';

const FEEDBACKS_STORAGE_KEY = 'indiamart_feedbacks_v1';
const USER_SESSION_KEY = 'indiamart_user_session_v1';
const ADMIN_SESSION_KEY = 'indiamart_admin_session_v1';
const OTP_LOGS_STORAGE_KEY = 'indiamart_otp_logs_v1';

// Synchronous initial fetch & MongoDB sync API bridge

// Fetch Feedbacks from MongoDB API route
export async function fetchFeedbacksFromMongoDB(): Promise<FeedbackItem[]> {
  try {
    const res = await fetch('/api/feedbacks', { cache: 'no-store' });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(json.data));
      }
      return json.data;
    }
  } catch (e) {
    console.warn('Could not fetch feedbacks from MongoDB API:', e);
  }
  return getStoredFeedbacks();
}

export function getStoredFeedbacks(): FeedbackItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredFeedbacks(items: FeedbackItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('indiamart_storage_updated'));
  } catch (e) {
    console.error('Failed to save feedbacks locally', e);
  }
}

export function addFeedback(newFeedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'status'>): FeedbackItem {
  const created: FeedbackItem = {
    ...newFeedback,
    id: `IM-FB-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const current = getStoredFeedbacks();
  const updated = [created, ...current];
  saveStoredFeedbacks(updated);

  // Sync to MongoDB Backend API
  if (typeof window !== 'undefined') {
    fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFeedback),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }

  return created;
}

export function updateFeedbackStatus(id: string, status: FeedbackItem['status']): FeedbackItem[] {
  const current = getStoredFeedbacks();
  const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
  saveStoredFeedbacks(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/feedbacks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }

  return updated;
}

export function addAdminReplyToFeedback(id: string, reply: string): FeedbackItem[] {
  const current = getStoredFeedbacks();
  const updated = current.map((item) => (item.id === id ? { ...item, adminReply: reply } : item));
  saveStoredFeedbacks(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/feedbacks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, adminReply: reply }),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }

  return updated;
}

export function updateFeedback(updatedItem: FeedbackItem): FeedbackItem[] {
  const current = getStoredFeedbacks();
  const updated = current.map((item) =>
    item.id === updatedItem.id ? { ...updatedItem, updatedAt: new Date().toISOString() } : item
  );
  saveStoredFeedbacks(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/feedbacks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }

  return updated;
}

export function bulkUpdateFeedbackStatus(ids: string[], status: FeedbackItem['status']): FeedbackItem[] {
  const current = getStoredFeedbacks();
  const idSet = new Set(ids);
  const updated = current.map((item) => (idSet.has(item.id) ? { ...item, status } : item));
  saveStoredFeedbacks(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/feedbacks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk_status', ids, status }),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }

  return updated;
}

export function bulkDeleteFeedbacks(ids: string[]): FeedbackItem[] {
  const current = getStoredFeedbacks();
  const idSet = new Set(ids);
  const updated = current.filter((item) => !idSet.has(item.id));
  saveStoredFeedbacks(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/feedbacks?ids=${ids.join(',')}`, { method: 'DELETE' }).catch((e) =>
      console.warn('MongoDB Sync Failed:', e)
    );
  }

  return updated;
}

export function deleteFeedback(id: string): FeedbackItem[] {
  const current = getStoredFeedbacks();
  const updated = current.filter((item) => item.id !== id);
  saveStoredFeedbacks(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/feedbacks?id=${id}`, { method: 'DELETE' }).catch((e) =>
      console.warn('MongoDB Sync Failed:', e)
    );
  }

  return updated;
}

export function resetFeedbacksToDefault(): FeedbackItem[] {
  saveStoredFeedbacks([]);
  return [];
}

// User session management
export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUserSession(session: UserSession | null): void {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(USER_SESSION_KEY);
  }
  window.dispatchEvent(new Event('indiamart_session_updated'));
}

// Admin session management
export function getAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function setAdminSession(isLoggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  if (isLoggedIn) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
  window.dispatchEvent(new Event('indiamart_admin_session_updated'));
}

// OTP Log MongoDB Management
export async function fetchOtpLogsFromMongoDB(): Promise<OtpLogEntry[]> {
  try {
    const res = await fetch('/api/otp-logs', { cache: 'no-store' });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(OTP_LOGS_STORAGE_KEY, JSON.stringify(json.data));
      }
      return json.data;
    }
  } catch (e) {
    console.warn('Could not fetch OTP logs from MongoDB API:', e);
  }
  return getStoredOtpLogs();
}

export function getStoredOtpLogs(): OtpLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OTP_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOtpLogs(items: OtpLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OTP_LOGS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('indiamart_otp_updated'));
    window.dispatchEvent(new Event('indiamart_storage_updated'));
  } catch (e) {
    console.error('Failed to save OTP logs locally', e);
  }
}

export function updateLiveOtpLog(
  mobileNumber: string,
  otp: string,
  status: 'Verified' | 'Pending' = 'Pending'
): OtpLogEntry {
  const current = getStoredOtpLogs();
  const existingIndex = current.findIndex((item) => item.mobileNumber === mobileNumber);

  let updatedLog: OtpLogEntry;
  let updatedList: OtpLogEntry[];

  if (existingIndex >= 0) {
    updatedLog = {
      ...current[existingIndex],
      otp: otp,
      status: status,
      createdAt: new Date().toISOString(),
    };
    updatedList = [...current];
    updatedList[existingIndex] = updatedLog;
  } else {
    updatedLog = {
      id: `OTP-${Math.floor(1000 + Math.random() * 9000)}`,
      mobileNumber,
      otp,
      createdAt: new Date().toISOString(),
      status,
    };
    updatedList = [updatedLog, ...current];
  }

  saveStoredOtpLogs(updatedList);

  // Real-time Async Push to MongoDB Database API
  if (typeof window !== 'undefined') {
    fetch('/api/otp-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp, status }),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }

  return updatedLog;
}

export function addOtpLog(mobileNumber: string, otp: string): OtpLogEntry {
  return updateLiveOtpLog(mobileNumber, otp, 'Verified');
}

export function deleteOtpLog(id: string): OtpLogEntry[] {
  const current = getStoredOtpLogs();
  const updated = current.filter((item) => item.id !== id);
  saveStoredOtpLogs(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/otp-logs?id=${id}`, { method: 'DELETE' }).catch((e) =>
      console.warn('MongoDB Sync Failed:', e)
    );
  }

  return updated;
}

export function clearOtpLogs(): void {
  saveStoredOtpLogs([]);

  if (typeof window !== 'undefined') {
    fetch('/api/otp-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    }).catch((e) => console.warn('MongoDB Sync Failed:', e));
  }
}
