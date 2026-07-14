import { cookies } from 'next/headers';
import type { PaginatedChatHistory } from '@/types/user-dashboard';
import HistoryChatClient from './client';

export const metadata = {
    title: 'History Chat — Dashboard User',
};

async function fetchChatHistory(
    token: string,
    params: Record<string, string>,
): Promise<PaginatedChatHistory | null> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const qs = new URLSearchParams(params).toString();
    try {
        const res = await fetch(`${API_URL}/api/user/chat-history?${qs}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json() as Promise<PaginatedChatHistory>;
    } catch {
        return null;
    }
}

interface PageProps {
    searchParams: Promise<Record<string, string>>;
}

export default async function HistoryChatPage({ searchParams }: PageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value ?? '';
    const params = await searchParams;

    const queryParams: Record<string, string> = {
        page: params.page ?? '1',
        per_page: '15',
    };
    if (params.status) queryParams.status = params.status;
    if (params.search) queryParams.search = params.search;

    const data = await fetchChatHistory(token, queryParams);

    return <HistoryChatClient data={data} currentPage={Number(params.page ?? 1)} />;
}
