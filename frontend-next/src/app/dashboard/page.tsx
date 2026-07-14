import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/get-user-server';
import { redirect } from 'next/navigation';
import DashboardClient from './client';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
        const user = await getUserFromToken(token);
        if (user?.role === 'user') {
            redirect('/dashboard/user');
        }
    }

    return <DashboardClient />;
}
