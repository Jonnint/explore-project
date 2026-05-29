const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function laravelLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      err?.errors?.email?.[0] ?? err?.message ?? 'Login gagal.';
    throw new Error(message);
  }
  return res.json();
}

export async function laravelLogout(token: string): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
}

/**
 * Validasi token ke Laravel via /api/auth/me.
 * - Return AuthUser kalau token masih valid.
 * - Return null kalau 401 (expired / invalid) — caller yang decide mau ngapain.
 * - Throw Error kalau ada masalah network atau server error lain.
 */
export async function laravelMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Server error: ${res.status}`);
  }

  return res.json() as Promise<AuthUser>;
}