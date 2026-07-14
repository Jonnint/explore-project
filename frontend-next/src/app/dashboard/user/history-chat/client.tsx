'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ChatBubbleLeftRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SignalIcon,
    SignalSlashIcon,
    UserIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import type { PaginatedChatHistory, ChatHistoryItem } from '@/types/user-dashboard';

interface Props {
    data: PaginatedChatHistory | null;
    currentPage: number;
}

// ─── Activity status derived from last_message_at ────────────────────────────
// hot  = chat dalam 24 jam terakhir  → Aktif
// warm = chat dalam 24–48 jam        → Baru Saja
// cold = lebih dari 48 jam           → Tidak Aktif

const ACTIVITY_CONFIG: Record<
    ChatHistoryItem['status'],
    { label: string; dotCls: string; badgeCls: string; icon: React.ReactNode }
> = {
    hot: {
        label: 'Aktif',
        dotCls: 'bg-emerald-400',
        badgeCls: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <SignalIcon className="w-3 h-3" />,
    },
    warm: {
        label: 'Baru Saja',
        dotCls: 'bg-amber-400',
        badgeCls: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: <SignalIcon className="w-3 h-3" />,
    },
    cold: {
        label: 'Tidak Aktif',
        dotCls: 'bg-slate-300 dark:bg-slate-600',
        badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        icon: <SignalSlashIcon className="w-3 h-3" />,
    },
};

const FILTER_OPTIONS = [
    { value: '', label: 'Semua' },
    { value: 'hot', label: 'Aktif' },
    { value: 'warm', label: 'Baru Saja' },
    { value: 'cold', label: 'Tidak Aktif' },
];

// ─── Avatar helpers ───────────────────────────────────────────────────────────

function avatarInitial(name: string): string {
    return name.charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
    'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
    'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300',
    'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
    'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
];

function avatarColor(id: number): string {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ─── Sender label ─────────────────────────────────────────────────────────────

function SenderChip({ sender }: { sender: string }) {
    const isAi = sender === 'AI Gemini';
    return (
        <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                isAi
                    ? 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400'
                    : 'bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
            }`}
        >
            {isAi ? <SparklesIcon className="w-2.5 h-2.5" /> : <UserIcon className="w-2.5 h-2.5" />}
            {isAi ? 'Bot AI' : 'Pelanggan'}
        </span>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HistoryChatClient({ data, currentPage }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
    const activeStatus = searchParams.get('status') ?? '';

    const pushParams = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([k, v]) => {
                if (v) params.set(k, v);
                else params.delete(k);
            });
            params.set('page', '1');
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams],
    );

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        pushParams({ search: searchInput });
    }

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        router.push(`${pathname}?${params.toString()}`);
    }

    const items = data?.history ?? [];
    const meta = data?.meta;

    const activeCount = items.filter((i) => i.status === 'hot').length;
    const recentCount = items.filter((i) => i.status === 'warm').length;
    const inactiveCount = items.filter((i) => i.status === 'cold').length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">History Chat</h1>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    Semua percakapan pelanggan yang masuk ke bot WhatsApp Anda.
                </p>
            </div>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151]">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">Total pelanggan:</span>
                    <span className="text-[13px] font-bold text-[#1a1a18] dark:text-[#F9FAFB]">{meta?.total ?? 0}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <SignalIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">Aktif: {activeCount}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <SignalIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[12px] font-medium text-amber-600 dark:text-amber-400">Baru Saja: {recentCount}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <SignalSlashIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Tidak Aktif: {inactiveCount}</span>
                </div>
            </div>

            <Card className="border-[#E5E7EB] dark:border-[#374151]">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-[15px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Daftar Percakapan Pelanggan
                            </CardTitle>
                            <CardDescription className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                {meta ? `${meta.total} pelanggan telah berinteraksi dengan bot Anda` : 'Memuat data...'}
                            </CardDescription>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {/* Activity filter pills */}
                            <div className="flex items-center gap-1 flex-wrap">
                                <FunnelIcon className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                {FILTER_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => pushParams({ status: opt.value })}
                                        className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                                            activeStatus === opt.value
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#374151] hover:border-emerald-400 dark:hover:border-emerald-700'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                                    <Input
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Nama atau nomor WA..."
                                        className="pl-8 h-8 text-[12px] w-44 border-[#E5E7EB] dark:border-[#374151] dark:bg-[#111827]"
                                    />
                                </div>
                                <Button type="submit" size="sm" className="h-8 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Cari
                                </Button>
                            </form>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {!data ? (
                        <div className="py-16 text-center">
                            <p className="text-sm text-[#9CA3AF]">Tidak dapat memuat data. Coba muat ulang halaman.</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-16 text-center">
                            <ChatBubbleLeftRightIcon className="w-12 h-12 text-[#E5E7EB] dark:text-[#374151] mx-auto mb-3" />
                            <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">Belum ada percakapan</p>
                            <p className="text-[12px] text-[#9CA3AF] mt-1">
                                Percakapan pelanggan dengan bot WA Anda akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[#E5E7EB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#111827]">
                                            {[
                                                'Pelanggan',
                                                'Nomor WA',
                                                'Pesan Terakhir',
                                                'Dibalas Oleh',
                                                'Jml. Pesan',
                                                'Status',
                                                'Terakhir Chat',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                                        {items.map((item) => {
                                            const ac = ACTIVITY_CONFIG[item.status] ?? ACTIVITY_CONFIG.cold;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition-colors"
                                                >
                                                    {/* Pelanggan */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold ${avatarColor(item.id)}`}
                                                            >
                                                                {avatarInitial(item.name)}
                                                            </div>
                                                            <span className="text-[13px] font-medium text-[#1a1a18] dark:text-[#F9FAFB] truncate max-w-[140px]">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Nomor WA */}
                                                    <td className="px-4 py-3">
                                                        <span className="text-[12px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                                                            {item.phone_number}
                                                        </span>
                                                    </td>
                                                    {/* Pesan Terakhir */}
                                                    <td className="px-4 py-3 max-w-[220px]">
                                                        <p
                                                            className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] truncate"
                                                            title={item.last_message}
                                                        >
                                                            {item.last_message}
                                                        </p>
                                                    </td>
                                                    {/* Dibalas Oleh */}
                                                    <td className="px-4 py-3">
                                                        <SenderChip sender={item.last_sender} />
                                                    </td>
                                                    {/* Jml. Pesan */}
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-[13px] font-bold text-[#1a1a18] dark:text-[#F9FAFB]">
                                                            {item.message_count}
                                                        </span>
                                                    </td>
                                                    {/* Status */}
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${ac.badgeCls}`}
                                                        >
                                                            {ac.icon}
                                                            {ac.label}
                                                        </span>
                                                    </td>
                                                    {/* Terakhir Chat */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-[11px] text-[#9CA3AF]">
                                                            {item.last_message_at_human ?? '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile inbox-style cards */}
                            <div className="md:hidden divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                                {items.map((item) => {
                                    const ac = ACTIVITY_CONFIG[item.status] ?? ACTIVITY_CONFIG.cold;
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3 px-4 py-4 hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition-colors"
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[14px] font-bold ${avatarColor(item.id)}`}
                                            >
                                                {avatarInitial(item.name)}
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="text-[13px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB] truncate">
                                                            {item.name}
                                                        </span>
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dotCls}`} />
                                                    </div>
                                                    <span className="text-[11px] text-[#9CA3AF] shrink-0">
                                                        {item.last_message_at_human ?? '—'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#9CA3AF] font-mono mb-1">{item.phone_number}</p>
                                                <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] truncate mb-1.5">
                                                    {item.last_message}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <SenderChip sender={item.last_sender} />
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${ac.badgeCls}`}
                                                    >
                                                        {ac.icon}
                                                        {ac.label}
                                                    </span>
                                                    <span className="text-[11px] text-[#9CA3AF]">
                                                        {item.message_count} pesan
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <div className="flex items-center justify-between px-4 py-4 border-t border-[#E5E7EB] dark:border-[#374151]">
                                    <p className="text-[12px] text-[#9CA3AF]">
                                        Menampilkan{' '}
                                        {(meta.current_page - 1) * meta.per_page + 1}–
                                        {Math.min(meta.current_page * meta.per_page, meta.total)} dari{' '}
                                        {meta.total}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0 border-[#E5E7EB] dark:border-[#374151]"
                                            disabled={currentPage <= 1}
                                            onClick={() => goToPage(currentPage - 1)}
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </Button>
                                        {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                                            const page = i + 1;
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={page === currentPage ? 'default' : 'outline'}
                                                    size="sm"
                                                    className={`h-8 w-8 p-0 text-[12px] ${
                                                        page === currentPage
                                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                                            : 'border-[#E5E7EB] dark:border-[#374151]'
                                                    }`}
                                                    onClick={() => goToPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0 border-[#E5E7EB] dark:border-[#374151]"
                                            disabled={currentPage >= meta.last_page}
                                            onClick={() => goToPage(currentPage + 1)}
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
