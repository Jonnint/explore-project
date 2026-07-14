'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import type { PaginatedChatLogs, ChatLogItem } from '@/types/user-dashboard';

interface Props {
    data: PaginatedChatLogs | null;
    currentPage: number;
}

// ─── Intent label styling ─────────────────────────────────────────────────────

const intentColors: Record<string, string> = {
    tanya_produk: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    komplain: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    minat_beli: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    tanya_pengiriman: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    salam: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    follow_up: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    lainnya: 'bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#4B5563]',
};

const intentLabels: Record<string, string> = {
    tanya_produk: 'Tanya Produk',
    komplain: 'Komplain',
    minat_beli: 'Minat Beli',
    tanya_pengiriman: 'Tanya Pengiriman',
    salam: 'Salam',
    follow_up: 'Follow Up',
    lainnya: 'Lainnya',
};

// ─── Status filter options ────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'done', label: 'Selesai' },
    { value: 'failed', label: 'Gagal' },
    { value: 'processing', label: 'Diproses' },
    { value: 'pending', label: 'Menunggu' },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, apiStatus }: { status: ChatLogItem['status']; apiStatus: string }) {
    const config: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
        done: {
            cls: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
            label: apiStatus,
        },
        failed: {
            cls: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            icon: <XCircleIcon className="w-3.5 h-3.5" />,
            label: apiStatus,
        },
        processing: {
            cls: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            icon: <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />,
            label: apiStatus,
        },
        pending: {
            cls: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            icon: <ClockIcon className="w-3.5 h-3.5" />,
            label: apiStatus,
        },
    };
    const c = config[status] ?? config.pending;
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${c.cls}`}>
            {c.icon}
            {c.label}
        </span>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LogChatClient({ data, currentPage }: Props) {
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

    function handleStatusFilter(status: string) {
        pushParams({ status });
    }

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        router.push(`${pathname}?${params.toString()}`);
    }

    const logs = data?.logs ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Log Chat AI</h1>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    Monitoring performa teknis balasan AI — intent, status API, dan estimasi token terpakai.
                </p>
            </div>

            {/* Summary stats */}
            {meta && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Log', value: meta.total, color: 'text-[#1a1a18] dark:text-[#F9FAFB]' },
                        { label: 'Halaman', value: `${meta.current_page} / ${meta.last_page}`, color: 'text-[#6B7280] dark:text-[#9CA3AF]' },
                        { label: 'Per Halaman', value: meta.per_page, color: 'text-[#6B7280] dark:text-[#9CA3AF]' },
                        {
                            label: 'Filter Aktif',
                            value: activeStatus ? STATUS_OPTIONS.find((s) => s.value === activeStatus)?.label ?? activeStatus : '—',
                            color: activeStatus ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-[#9CA3AF]',
                        },
                    ].map((s, i) => (
                        <div key={i} className="rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] px-4 py-3">
                            <p className="text-[11px] text-[#9CA3AF] mb-1">{s.label}</p>
                            <p className={`text-[15px] font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <Card className="border-[#E5E7EB] dark:border-[#374151]">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-[15px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Daftar Log Chat
                            </CardTitle>
                            <CardDescription className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                {meta ? `${meta.total} log ditemukan` : 'Memuat data...'}
                            </CardDescription>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {/* Status filter pills */}
                            <div className="flex items-center gap-1 flex-wrap">
                                <FunnelIcon className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleStatusFilter(opt.value)}
                                        className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${activeStatus === opt.value
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
                                        placeholder="Cari pesan, nama..."
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
                    ) : logs.length === 0 ? (
                        <div className="py-16 text-center">
                            <ClockIcon className="w-12 h-12 text-[#E5E7EB] dark:text-[#374151] mx-auto mb-3" />
                            <p className="text-[14px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">Tidak ada log ditemukan</p>
                            <p className="text-[12px] text-[#9CA3AF] mt-1">Coba ubah filter atau kata kunci pencarian.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[#E5E7EB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#111827]">
                                            {['ID', 'Pengirim', 'Cuplikan Pesan', 'Intent AI', 'Status API', 'Est. Token', 'Waktu'].map((h) => (
                                                <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-[12px] font-mono text-[#9CA3AF]">#{log.id}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-[12px] font-medium text-[#1a1a18] dark:text-[#F9FAFB] truncate max-w-[120px]">
                                                            {log.profile_name}
                                                        </p>
                                                        <p className="text-[11px] text-[#9CA3AF] font-mono">{log.client_phone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] truncate" title={log.body_snippet}>
                                                        {log.body_snippet}
                                                        {log.body_snippet.length >= 60 ? '...' : ''}
                                                    </p>
                                                    {log.response_snippet && (
                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate mt-0.5" title={log.response_snippet}>
                                                            ↳ {log.response_snippet}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[11px] font-medium ${intentColors[log.intent] ?? intentColors.lainnya}`}
                                                    >
                                                        {intentLabels[log.intent] ?? log.intent}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={log.status} apiStatus={log.api_status} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[13px] font-bold text-[#1a1a18] dark:text-[#F9FAFB]">
                                                        {log.estimated_tokens.toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-[10px] text-[#9CA3AF] ml-0.5">tkn</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-[11px] text-[#9CA3AF]">{log.created_at_human ?? '—'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                                {logs.map((log) => (
                                    <div key={log.id} className="px-4 py-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-mono text-[#9CA3AF]">#{log.id}</span>
                                                    <span className="text-[13px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB] truncate">
                                                        {log.profile_name}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#9CA3AF] font-mono">{log.client_phone}</p>
                                            </div>
                                            <StatusBadge status={log.status} apiStatus={log.api_status} />
                                        </div>
                                        <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                            {log.body_snippet}{log.body_snippet.length >= 60 ? '...' : ''}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[11px] ${intentColors[log.intent] ?? intentColors.lainnya}`}>
                                                    {intentLabels[log.intent] ?? log.intent}
                                                </Badge>
                                                <span className="text-[12px] font-bold text-[#1a1a18] dark:text-[#F9FAFB]">
                                                    {log.estimated_tokens.toLocaleString('id-ID')} tkn
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-[#9CA3AF]">{log.created_at_human ?? '—'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <div className="flex items-center justify-between px-4 py-4 border-t border-[#E5E7EB] dark:border-[#374151]">
                                    <p className="text-[12px] text-[#9CA3AF]">
                                        Menampilkan {(meta.current_page - 1) * meta.per_page + 1}–
                                        {Math.min(meta.current_page * meta.per_page, meta.total)} dari {meta.total}
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
                                                    className={`h-8 w-8 p-0 text-[12px] ${page === currentPage
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
