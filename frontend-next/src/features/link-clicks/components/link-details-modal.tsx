'use client';

import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { useState } from 'react';
import type { Product, Category } from '@/types/link-clicks';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    categories: Category[];
}

export default function LinkDetailsModal({ isOpen, onClose, product, categories }: Props) {
    const [visibleCount, setVisibleCount] = useState(10);

    if (!product) return null;

    const categoryName = product.category_id
        ? categories.find((cat) => cat.id === product.category_id)?.name
        : null;

    const visibleLinks = product.links.slice(0, visibleCount);
    const hasMore = visibleCount < product.links.length;
    const remainingCount = product.links.length - visibleCount;

    const handleShowMore = () => {
        setVisibleCount((prev) => Math.min(prev + 10, product.links.length));
    };

    const handleShowAll = () => {
        setVisibleCount(product.links.length);
    };

    return (
        <Transition show={isOpen} as="div">
            <Dialog onClose={onClose} className="relative z-50">
                {/* Backdrop */}
                <Transition.Child
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                </Transition.Child>

                {/* Modal Container */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel
                            key={product.id}
                            className="w-full max-w-5xl bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl border border-[#E2E0D8] dark:border-[#374151] transform transition-all max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-[#E2E0D8] dark:border-[#374151]">
                                <div>
                                    <DialogTitle className="text-base sm:text-lg font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                        {product.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                                        {categoryName && (
                                            <span className="text-xs font-medium text-[#5F5E5A] dark:text-[#D1D5DB] bg-[#F0EEE8] dark:bg-[#374151] rounded-full px-2.5 py-0.5">
                                                {categoryName}
                                            </span>
                                        )}
                                        <span className="text-xs sm:text-sm text-[#888780] dark:text-[#9CA3AF]">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-xs sm:text-sm text-[#888780] dark:text-[#9CA3AF]">
                                            • {product.total_links_generated} link
                                            {product.total_links_generated !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-[#F8F7F4] dark:hover:bg-[#374151] transition-all active:scale-95"
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M5 5L15 15M5 15L15 5"
                                            stroke="#888780"
                                            className="dark:stroke-[#9CA3AF]"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin">
                                {product.links.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-[#B4B2A9] dark:text-[#6B7280]">
                                        <div className="animate-pulse">
                                            Belum ada link yang di-generate untuk produk ini.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {visibleLinks.map((link, index) => (
                                            <div
                                                key={link.id}
                                                className="bg-[#FAFAF8] dark:bg-[#111827] border border-[#E2E0D8] dark:border-[#374151] rounded-lg p-3 sm:p-4 hover:shadow-sm transition-all animate-in fade-in slide-in-from-left-2"
                                                style={{
                                                    animationDelay: `${index * 30}ms`,
                                                    animationDuration: '300ms',
                                                }}
                                            >
                                                {/* Header Row */}
                                                <div className="flex items-start justify-between mb-3 pb-3 border-b border-[#E2E0D8] dark:border-[#374151]">
                                                    <div>
                                                        <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                            Track Code
                                                        </span>
                                                        <p className="font-mono text-[12px] sm:text-[13px] text-[#1a1a18] dark:text-[#F9FAFB] mt-1 font-medium break-all">
                                                            {link.track_code}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-2">
                                                        {link.clicked_at ? (
                                                            <span className="inline-flex items-center gap-1 bg-[#EAF3DE] dark:bg-[#065F46] text-[#3B6D11] dark:text-[#A7F3D0] text-[11px] font-medium rounded-full px-2.5 py-0.5">
                                                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                                                    <path
                                                                        d="M1.5 4.5L3.5 6.5L7.5 2.5"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                                Clicked
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center bg-[#F1EFE8] dark:bg-[#374151] text-[#5F5E5A] dark:text-[#D1D5DB] text-[11px] font-medium rounded-full px-2.5 py-0.5">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div>
                                                        <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                            IP Address
                                                        </span>
                                                        <p className="text-[12px] text-[#1a1a18] dark:text-[#F9FAFB] mt-1">
                                                            {link.ip_address ?? '—'}
                                                        </p>
                                                    </div>
                                                    {link.agent_phone && (
                                                        <div>
                                                            <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                                Agent Phone
                                                            </span>
                                                            <p className="text-[12px] text-[#1a1a18] dark:text-[#F9FAFB] mt-1">
                                                                {link.agent_phone}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {link.client_phone && (
                                                        <div>
                                                            <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                                Client Phone
                                                            </span>
                                                            <p className="text-[12px] text-[#1a1a18] dark:text-[#F9FAFB] mt-1">
                                                                {link.client_phone}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {link.profile_name && (
                                                        <div>
                                                            <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                                Client Name
                                                            </span>
                                                            <p className="text-[12px] text-[#1a1a18] dark:text-[#F9FAFB] mt-1">
                                                                {link.profile_name}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {link.clicked_at && (
                                                        <div>
                                                            <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                                Clicked At
                                                            </span>
                                                            <p className="text-[12px] text-[#1a1a18] dark:text-[#F9FAFB] mt-1">
                                                                {format(new Date(link.clicked_at), 'dd MMM yyyy HH:mm')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Browser Agent */}
                                                {link.browser_agent && (
                                                    <div className="mt-3 pt-3 border-t border-[#E2E0D8] dark:border-[#374151]">
                                                        <span className="text-[10px] font-medium text-[#888780] dark:text-[#9CA3AF] uppercase tracking-wider">
                                                            Browser
                                                        </span>
                                                        <p
                                                            className="text-[11px] text-[#888780] dark:text-[#9CA3AF] mt-1 break-all"
                                                            title={link.browser_agent}
                                                        >
                                                            {link.browser_agent}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {hasMore && (
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                                                <button
                                                    onClick={handleShowMore}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#1a1a18] dark:text-[#F9FAFB] bg-[#F8F7F4] dark:bg-[#374151] hover:bg-[#E8E5DC] dark:hover:bg-[#4B5563] border border-[#E2E0D8] dark:border-[#4B5563] rounded-lg transition-all hover:shadow-sm active:scale-95"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                    Show 10 More ({remainingCount} remaining)
                                                </button>
                                                {remainingCount > 10 && (
                                                    <button
                                                        onClick={handleShowAll}
                                                        className="text-sm text-[#378ADD] hover:text-[#2a6bb0] font-medium transition-colors"
                                                    >
                                                        Show All
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-[#E2E0D8] dark:border-[#374151] gap-3">
                                <span className="text-xs text-[#888780] dark:text-[#9CA3AF]">
                                    Showing {visibleLinks.length} of {product.links.length} link{product.links.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#1a1a18] dark:bg-[#10B981] hover:bg-[#2a2a28] dark:hover:bg-[#059669] rounded-lg transition-colors active:scale-95"
                                >
                                    Tutup
                                </button>
                            </div>
                        </DialogPanel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
