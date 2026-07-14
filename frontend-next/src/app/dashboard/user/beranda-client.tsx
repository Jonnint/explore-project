'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BoltIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    SignalIcon,
    SignalSlashIcon,
    SparklesIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import type { AuthUser } from '@/lib/auth';
import type { UserDashboardData, TokenUsage, ChatHistoryItem, ChatLogItem } from '@/types/user-dashboard';

interface Props {
    user: AuthUser | null;
    data: UserDashboardData | null;
}

// ─── Token Usage Panel ────────────────────────────────────────────────────────

function TokenUsagePanel({ usage }: { usage: TokenUsage }) {
    if (usage.status === 'unlimited') {
        return (
            <Card className="border-[#E5E7EB] dark:border-[#374151]">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                            <BoltIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-[15px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Penggunaan Token AI
                            </CardTitle>
                            <CardDescription className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                Kuota harian Anda
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 py-2">
                        <CheckCircleIcon className="w-8 h-8 text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-[14px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">Kuota Tidak Terbatas</p>
                            <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                Token terpakai hari ini:{' '}
                                <span className="font-medium text-[#1a1a18] dark:text-[#F9FAFB]">
                                    {usage.used.toLocaleString('id-ID')}
                                </span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { used, remaining, limit, percentage, status, reset_at } = usage;
    const resetDate = reset_at ? new Date(reset_at) : null;
    const resetLabel = resetDate
        ? resetDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' besok'
        : null;

    const barColor =
        status === 'critical'
            ? 'bg-red-500'
            : status === 'warning'
                ? 'bg-amber-400'
                : 'bg-emerald-500';

    const statusBadgeColor =
        status === 'critical'
            ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            : status === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';

    const statusLabel =
        status === 'critical' ? 'Hampir Habis' : status === 'warning' ? 'Perlu Perhatian' : 'Aman';

    return (
        <Card className="border-[#E5E7EB] dark:border-[#374151]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${status === 'critical' ? 'bg-red-50 dark:bg-red-950' : status === 'warning' ? 'bg-amber-50 dark:bg-amber-950' : 'bg-emerald-50 dark:bg-emerald-950'}`}>
                            {status === 'critical' ? (
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                            ) : status === 'warning' ? (
                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                            ) : (
                                <BoltIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-[15px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Penggunaan Token AI
                            </CardTitle>
                            <CardDescription className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                Kuota harian Anda
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-[11px] font-medium ${statusBadgeColor}`}>
                        {statusLabel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress bar */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">
                                {used.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF] ml-1">
                                / {limit?.toLocaleString('id-ID')} token
                            </span>
                        </div>
                        <span className="text-[13px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                            {percentage}%
                        </span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] dark:bg-[#374151] rounded-full h-3">
                        <div
                            className={`${barColor} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F9FAFB] dark:bg-[#111827] rounded-lg p-3">
                        <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mb-1">Terpakai Hari Ini</p>
                        <p className="text-[15px] font-bold text-[#1a1a18] dark:text-[#F9FAFB]">
                            {used.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="bg-[#F9FAFB] dark:bg-[#111827] rounded-lg p-3">
                        <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mb-1">Sisa Token</p>
                        <p className={`text-[15px] font-bold ${status === 'critical' ? 'text-red-600 dark:text-red-400' : status === 'warning' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {(remaining ?? 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {resetLabel && (
                    <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280]">
                        Kuota direset pada {resetLabel}
                    </p>
                )}

                {status === 'critical' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-600 dark:text-red-400">
                            Kuota Anda hampir habis. Bot AI mungkin tidak dapat membalas pesan setelah kuota habis.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Chat History Snippet Panel ───────────────────────────────────────────────

const ACTIVITY_DOT: Record<ChatHistoryItem['status'], string> = {
    hot: 'bg-emerald-400',
    warm: 'bg-amber-400',
    cold: 'bg-slate-300 dark:bg-slate-600',
};

const ACTIVITY_LABEL: Record<ChatHistoryItem['status'], string> = {
    hot: 'Aktif',
    warm: 'Baru Saja',
    cold: 'Tidak Aktif',
};

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

function ChatHistoryPanel({ items }: { items: ChatHistoryItem[] }) {
    return (
        <Card className="border-[#E5E7EB] dark:border-[#374151]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-[15px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Chat Pelanggan Terbaru
                            </CardTitle>
                            <CardDescription className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                Percakapan terbaru yang masuk ke bot WA Anda
                            </CardDescription>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/user/history-chat"
                        className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                        Lihat Semua
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {items.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-[#D1D5DB] dark:text-[#374151] mx-auto mb-2" />
                        <p className="text-[13px] text-[#9CA3AF]">Belum ada percakapan masuk</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                href="/dashboard/user/history-chat"
                                className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0 text-[13px] font-bold text-emerald-700 dark:text-emerald-300">
                                    {item.name.charAt(0).toUpperCase()}
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[13px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB] truncate">
                                                {item.name}
                                            </span>
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTIVITY_DOT[item.status] ?? 'bg-slate-300'}`} />
                                            <span className="text-[10px] text-[#9CA3AF] shrink-0">{ACTIVITY_LABEL[item.status] ?? item.status}</span>
                                        </div>
                                        <span className="text-[11px] text-[#9CA3AF] shrink-0">{item.last_message_at_human ?? '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <SenderChip sender={item.last_sender} />
                                        <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                                            {item.last_message}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── AI Log Chat Panel ────────────────────────────────────────────────────────

const intentColors: Record<string, string> = {
    tanya_produk: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    komplain: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
    minat_beli: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    tanya_pengiriman: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    salam: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    follow_up: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    lainnya: 'bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF]',
};

function ApiStatusBadge({ apiStatus, status }: { apiStatus: string; status: ChatLogItem['status'] }) {
    const isOk = status === 'done';
    const isError = status === 'failed';
    return (
        <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded ${isOk
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : isError
                        ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
        >
            {isOk ? (
                <CheckCircleIcon className="w-3 h-3" />
            ) : isError ? (
                <XCircleIcon className="w-3 h-3" />
            ) : null}
            {apiStatus}
        </span>
    );
}

function ChatLogPanel({ logs }: { logs: ChatLogItem[] }) {
    return (
        <Card className="border-[#E5E7EB] dark:border-[#374151]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950">
                            <ClockIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <CardTitle className="text-[15px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                Log Chat AI Terbaru
                            </CardTitle>
                            <CardDescription className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                                Performa teknis balasan AI — 5 aktivitas terakhir
                            </CardDescription>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/user/log-chat"
                        className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                        Lihat Semua
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {logs.length === 0 ? (
                    <div className="py-8 text-center">
                        <ClockIcon className="w-10 h-10 text-[#D1D5DB] dark:text-[#374151] mx-auto mb-2" />
                        <p className="text-[13px] text-[#9CA3AF]">Belum ada log chat</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#E5E7EB] dark:border-[#374151]">
                                    <th className="pb-2 pr-4 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap">ID Pesan</th>
                                    <th className="pb-2 pr-4 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Intent AI</th>
                                    <th className="pb-2 pr-4 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Status API</th>
                                    <th className="pb-2 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide text-right">Token</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition-colors">
                                        <td className="py-2.5 pr-4">
                                            <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                                                #{log.id}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-4">
                                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${intentColors[log.intent] ?? intentColors.lainnya}`}>
                                                {log.intent}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-4">
                                            <ApiStatusBadge apiStatus={log.api_status} status={log.status} />
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <span className="text-[12px] font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                                {log.estimated_tokens.toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BerandaClient({ user, data }: Props) {
    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 17) return 'Selamat Siang';
        return 'Selamat Malam';
    })();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#1a1a18] dark:text-[#F9FAFB]">Dashboard User</h1>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    {greeting}, <span className="font-medium text-[#1a1a18] dark:text-[#F9FAFB]">{user?.name ?? 'Pengguna'}</span>.
                    Selamat datang di dashboard k-link Anda.
                </p>
            </div>

            {!data ? (
                <div className="rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] p-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">Tidak dapat memuat data dashboard. Coba muat ulang halaman.</p>
                </div>
            ) : (
                <>
                    {/* Token Usage — full width on top */}
                    <TokenUsagePanel usage={data.token_usage} />

                    {/* Chat History + Log Chat side by side on large screens */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <ChatHistoryPanel items={data.recent_chat_history} />
                        <ChatLogPanel logs={data.recent_chat_logs} />
                    </div>
                </>
            )}
        </div>
    );
}
