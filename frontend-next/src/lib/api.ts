import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { laravelMe } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value ?? null;
}

/**
 * Base fetch — otomatis inject Bearer token kalau ada.
 * Kalau token expired (401), redirect ke route handler auto-logout.
 * Untuk Server Component dan Server Action.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getToken();

  // Kalau gak ada token sama sekali, langsung ke login
  if (!token) redirect('/login');

  // Validasi token ke Laravel sebelum request utama
  const user = await laravelMe(token);
  if (!user) redirect('/api/auth/auto-logout');

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    // Fallback — harusnya udah ketangkep laravelMe, tapi jaga-jaga
    redirect('/api/auth/auto-logout');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error?.message ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = params
    ? `${path}?${new URLSearchParams(params).toString()}`
    : path;
  return apiFetch<T>(url, { method: 'GET' });
}

export async function apiPut<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiPost<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}