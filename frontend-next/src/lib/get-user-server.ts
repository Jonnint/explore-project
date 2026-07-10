import type { AuthUser } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Server-side function to get user from Laravel using Bearer token
 * Used in Server Components (dashboard layout)
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store', // Always fetch fresh data
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        // Laravel return { user: { id, name, email } }
        return data.user as AuthUser;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}
