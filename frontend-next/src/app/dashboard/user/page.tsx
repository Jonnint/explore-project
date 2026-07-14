import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/get-user-server';
import type { UserDashboardData } from '@/types/user-dashboard';
import BerandaClient from './beranda-client';

export const metadata = {
    title: 'Beranda — Dashboard User',
};

async function fetchUserDashboard(token: string): Promise<UserDashboardData | null> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    try {
        const res = await fetch(`${API_URL}/api/user/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json() as Promise<UserDashboardData>;
    } catch {
        return null;
    }
}

export default async function UserBerandaPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value ?? '';

    const [user, dashboardData] = await Promise.all([
        getUserFromToken(token),
        fetchUserDashboard(token),
    ]);

    return <BerandaClient user={user} data={dashboardData} />;
}
