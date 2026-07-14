'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    ShoppingBagIcon,
    ChartBarIcon,
    BookOpenIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import type { AuthUser } from '@/lib/auth';

interface Props {
    user: AuthUser | null;
}

export default function Sidebar({ user }: Props) {
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

    const menuItems = [
        {
            name: 'Beranda',
            href: '/dashboard',
            icon: HomeIcon,
        },
        {
            name: 'Link Clicks',
            href: '/dashboard/link-clicks',
            icon: ChartBarIcon,
        },
        {
            name: 'Lead & Percakapan',
            href: '/dashboard/leads',
            icon: ChatBubbleLeftRightIcon,
        },
        {
            name: 'Produk',
            href: '/dashboard/products',
            icon: ShoppingBagIcon,
        },
        {
            name: 'Analitik',
            href: '/dashboard/analytics',
            icon: ChartBarIcon,
        },
        {
            name: 'Basis Pengetahuan',
            href: '/dashboard/knowledge',
            icon: BookOpenIcon,
        },
    ];

    // Show user management for superadmin and admin only
    const canViewUserManagement = user?.role === 'superadmin' || user?.role === 'admin';

    if (canViewUserManagement) {
        menuItems.push({
            name: 'Management Akun',
            href: '/dashboard/user-management',
            icon: UsersIcon,
        });
    }

    const bottomMenuItems = [
        {
            name: 'Pengaturan',
            href: '/dashboard/settings',
            icon: Cog6ToothIcon,
        },
    ];

    return (
        <>
            {/* Mobile Hamburger Button - Positioned in navbar area */}
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

            {/* Overlay for mobile */}
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
                {/* Navigation */}
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                  ${isActive
                                        ? 'bg-[#D1FAE5] dark:bg-[#065F46] text-[#047857] dark:text-[#A7F3D0]'
                                        : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#374151] dark:hover:text-[#F9FAFB]'
                                    }
                `}
                            >
                                <Icon className="w-[18px] h-[18px]" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section - Settings + Logout */}
                <div className="px-2 py-3 border-t border-[#E5E7EB] dark:border-[#374151] space-y-0.5">
                    {bottomMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                  ${isActive
                                        ? 'bg-[#D1FAE5] dark:bg-[#065F46] text-[#047857] dark:text-[#A7F3D0]'
                                        : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#374151] dark:hover:text-[#F9FAFB]'
                                    }
                `}
                            >
                                <Icon className="w-[18px] h-[18px]" />
                                {item.name}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#374151] dark:hover:text-[#F9FAFB] transition-colors disabled:opacity-50"
                    >
                        <ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />
                        {loggingOut ? 'Keluar...' : 'Keluar'}
                    </button>
                </div>
            </aside>
        </>
    );
}
