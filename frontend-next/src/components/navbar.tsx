'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BellIcon,
    MoonIcon,
    SunIcon,
} from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import type { AuthUser } from '@/lib/auth';

interface NavbarProps {
    title?: string;
    iconName?: 'home' | 'products' | 'analytics' | 'knowledge' | 'settings' | 'leads';
    showUserSection?: boolean;
    user?: AuthUser | null;
}

const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const getCreditDisplay = (user: AuthUser | null) => {
    if (!user) return '0';
    if (user.role === 'superadmin' || user.role === 'admin' || user.token_limit === null) {
        return '∞';
    }
    const remaining = (user.token_limit || 0) - (user.tokens_used || 0);
    return new Intl.NumberFormat('id-ID').format(remaining);
};

export default function Navbar({ title, showUserSection = false, user = null }: NavbarProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load dark mode preference from localStorage
    useEffect(() => {
        setMounted(true);
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedMode === 'true' || (!savedMode && prefersDark);

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 sm:gap-3 ml-12 lg:ml-0">
                            <Link href="/" className="flex items-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo.png"
                                    alt="Logo"
                                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151] transition-colors">
            <div className="w-full px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo + Optional Title */}
                    <div className="flex items-center gap-2 sm:gap-3 ml-12 lg:ml-0">
                        <Link href="/" className="flex items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                            />
                        </Link>
                        {title && (
                            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1">
                                <span className="text-[14px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">{title}</span>
                            </div>
                        )}
                    </div>

                    {/* Right side - User Section (only show when logged in) */}
                    {showUserSection && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Credit Badge - Hidden on mobile */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] dark:bg-[#065F46] rounded-lg border border-[#A7F3D0] dark:border-[#047857]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <div className="flex flex-col -space-y-0.5">
                                    <span className="text-[9px] text-[#059669] dark:text-[#6EE7B7] font-medium uppercase tracking-wide">Kredit AI WABA</span>
                                    <span className="text-[13px] text-[#047857] dark:text-[#A7F3D0] font-bold">{getCreditDisplay(user)}</span>
                                </div>
                            </div>

                            {/* Notification Icon with Badge */}
                            <button className="relative p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#374151] rounded-lg transition-colors">
                                <BellIcon className="w-5 h-5 text-[#9CA3AF] dark:text-[#D1D5DB]" />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full"></span>
                            </button>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#374151] rounded-lg transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="w-5 h-5 text-[#F59E0B]" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 text-[#9CA3AF]" />
                                )}
                            </button>

                            {/* User Avatar */}
                            <Avatar className="w-8 h-8 sm:w-9 sm:h-9 bg-[#10B981] cursor-pointer hover:bg-[#059669] transition-colors">
                                <AvatarFallback className="bg-[#10B981] text-white text-[12px] sm:text-[13px] font-semibold">
                                    {user ? getInitials(user.name) : 'SA'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
