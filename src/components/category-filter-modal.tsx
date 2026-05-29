'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import type { Category } from '@/types/link-clicks';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    selectedCategoryId: string | null;
    onApply: (categorySlug: string | null) => void;
}

export default function CategoryFilterModal({
    isOpen,
    onClose,
    categories,
    selectedCategoryId,
    onApply,
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleApply = (categorySlug: string | null) => {
        onApply(categorySlug);
        setSearchQuery(''); // Reset search on apply
    };

    return (
        <Transition show={isOpen} as="div">
            <Dialog onClose={onClose} className="relative z-50">
                {/* Backdrop with animation */}
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

                {/* Full-screen container */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-md bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl border border-[#E2E0D8] dark:border-[#374151] transform transition-all">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E0D8] dark:border-[#374151]">
                                <DialogTitle className="text-base font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                                    Filter Kategori
                                </DialogTitle>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-[#F8F7F4] dark:hover:bg-[#374151] transition-all active:scale-95"
                                    aria-label="Close"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                        <path d="M5 5L15 15M5 15L15 5" stroke="#888780" className="dark:stroke-[#9CA3AF]" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="px-4 sm:px-6 pt-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari kategori..."
                                        className="text-black dark:text-white w-full pl-10 pr-10 py-2.5 text-sm border border-[#E2E0D8] dark:border-[#4B5563] rounded-lg focus:ring-2 focus:ring-[#378ADD] focus:border-[#378ADD] transition-all outline-none bg-white dark:bg-[#111827]"
                                    />
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888780] dark:text-[#9CA3AF]"
                                    >
                                        <path
                                            d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM14 14l-3-3"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F8F7F4] dark:hover:bg-[#374151] rounded transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path
                                                    d="M3 3L11 11M3 11L11 3"
                                                    stroke="#888780"
                                                    className="dark:stroke-[#9CA3AF]"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-4 sm:px-6 py-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#E2E0D8] dark:scrollbar-thumb-[#4B5563] scrollbar-track-transparent">
                                <div className="space-y-2">
                                    {/* All option */}
                                    <button
                                        onClick={() => handleApply(null)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedCategoryId === null
                                                ? 'bg-[#1a1a18] dark:bg-[#10B981] text-white shadow-sm'
                                                : 'bg-[#F8F7F4] dark:bg-[#374151] text-[#5F5E5A] dark:text-[#D1D5DB] hover:bg-[#E8E5DC] dark:hover:bg-[#4B5563] hover:shadow-sm'
                                            } active:scale-98`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>Semua Kategori</span>
                                            {selectedCategoryId === null && (
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    className="animate-in zoom-in-50 duration-200"
                                                >
                                                    <path
                                                        d="M3 8L6 11L13 4"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>

                                    {/* Category options */}
                                    {filteredCategories.length === 0 ? (
                                        <div className="text-center py-8 text-sm text-[#888780] dark:text-[#9CA3AF] animate-in fade-in duration-300">
                                            <div className="animate-pulse">Tidak ada kategori ditemukan</div>
                                        </div>
                                    ) : (
                                        filteredCategories.map((cat, index) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleApply(cat.slug)}
                                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-left-2 ${selectedCategoryId === cat.slug
                                                        ? 'bg-[#1a1a18] dark:bg-[#10B981] text-white shadow-sm'
                                                        : 'bg-[#F8F7F4] dark:bg-[#374151] text-[#5F5E5A] dark:text-[#D1D5DB] hover:bg-[#E8E5DC] dark:hover:bg-[#4B5563] hover:shadow-sm'
                                                    } active:scale-98`}
                                                style={{ animationDelay: `${index * 30}ms` }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{cat.name}</span>
                                                    {selectedCategoryId === cat.slug && (
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 16 16"
                                                            fill="none"
                                                            className="animate-in zoom-in-50 duration-200"
                                                        >
                                                            <path
                                                                d="M3 8L6 11L13 4"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-[#E2E0D8] dark:border-[#374151]">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-[#5F5E5A] dark:text-[#D1D5DB] hover:text-[#1a1a18] dark:hover:text-[#F9FAFB] transition-colors"
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
