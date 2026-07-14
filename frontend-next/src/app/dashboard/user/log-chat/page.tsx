import { cookies } from 'next/headers';
import type { PaginatedChatLogs } from '@/types/user-dashboard';
import LogChatClient from './client';

export const metadata = {
    title: 'Log Chat — Dashboard User',
};

async function fetchChatLogs(
    token: string,
    params: Record<string, string>,
): Promise<PaginatedChatLogs | null> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const qs = new URLSearchParams(params).toString();
    try {
        const res = await fetch(`${API_URL}/api/user/chat-logs?${qs}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json() as Promise<PaginatedChatLogs>;
    } catch {
        return null;
    }
}

interface PageProps {
    searchParams: Promise<Record<string, string>>;
}

export default async function LogChatPage({ searchParams }: PageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value ?? '';
    const params = await searchParams;

    const queryParams: Record<string, string> = {
        page: params.page ?? '1',
        per_page: '20',
    };
    if (params.status) queryParams.status = params.status;
    if (params.search) queryParams.search = params.search;

    const data = await fetchChatLogs(token, queryParams);

    return <LogChatClient data={data} currentPage={Number(params.page ?? 1)} />;
}
