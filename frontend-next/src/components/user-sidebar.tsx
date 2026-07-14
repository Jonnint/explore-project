'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import type { AuthUser } from '@/lib/auth';

interface Props {
    user: AuthUser | null;
}

const menuItems = [
    {
        name: 'Beranda',
        href: '/dashboard/user',
        icon: HomeIcon,
        exact: true,
    },
    {
        name: 'Log Chat',
        href: '/dashboard/user/log-chat',
        icon: ChatBubbleLeftRightIcon,
        exact: false,
    },
    {
        name: 'History Chat',
        href: '/dashboard/user/history-chat',
        icon: ClockIcon,
        exact: false,
    },
];

export default function UserSidebar({ user }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch {
            setLoggingOut(false);
        }
    }

    function isActive(href: string, exact: boolean): boolean {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    }

    return (
        <>
            {/* Mobile Hamburger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-[18px] left-4 z-50 p-2 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg shadow-sm hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <XMarkIcon className="w-5 h-5 text-[#1F2937] dark:text-[#F9FAFB]" />
                ) : (
                    <Bars3Icon className="w-5 h-5 text-[#1F2937] dark:text-[#F9FAFB]" />
                )}
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-[#1F2937] z-40
                    transition-transform duration-300 ease-in-out
                    w-56 flex flex-col border-r border-[#E5E7EB] dark:border-[#374151]
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* User info strip */}
                {user && (
                    <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#374151] bg-[#F0FDF4] dark:bg-[#052e16]">
                        <p className="text-[12px] font-semibold text-[#047857] dark:text-[#6EE7B7] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate mt-0.5">{user.email}</p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                                    ${active
                                        ? 'bg-[#D1FAE5] dark:bg-[#065F46] text-[#047857] dark:text-[#A7F3D0]'
                                        : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#374151] dark:hover:text-[#F9FAFB]'
                                    }
                                `}
                            >
                                <Icon className="w-[18px] h-[18px] shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="px-2 py-3 border-t border-[#E5E7EB] dark:border-[#374151] space-y-0.5">
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setIsOpen(false)}
                        className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                            ${pathname === '/dashboard/settings'
                                ? 'bg-[#D1FAE5] dark:bg-[#065F46] text-[#047857] dark:text-[#A7F3D0]'
                                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#374151] dark:hover:text-[#F9FAFB]'
                            }
                        `}
                    >
                        <Cog6ToothIcon className="w-[18px] h-[18px] shrink-0" />
                        Pengaturan
                    </Link>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#374151] dark:hover:text-[#F9FAFB] transition-colors disabled:opacity-50"
                    >
                        <ArrowRightOnRectangleIcon className="w-[18px] h-[18px] shrink-0" />
                        {loggingOut ? 'Keluar...' : 'Keluar'}
                    </button>
                </div>
            </aside>
        </>
    );
}
