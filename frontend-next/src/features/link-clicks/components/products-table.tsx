import type { Product, Category } from '@/types/link-clicks';
import { TABLE_HEADERS } from '../constants';

interface Props {
    products: Product[];
    categories: Category[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    onProductClick: (product: Product) => void;
    onFilterClick: () => void;
    selectedCategory?: Category;
    onClearFilter: () => void;
    sortBy: 'name' | 'price' | 'clicks';
    sortOrder: 'asc' | 'desc';
    onSort: (field: 'name' | 'price' | 'clicks') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

function SortIcon({
    field,
    sortBy,
    sortOrder,
}: {
    field: 'name' | 'price' | 'clicks';
    sortBy: 'name' | 'price' | 'clicks';
    sortOrder: 'asc' | 'desc';
}) {
    if (sortBy !== field) {
        return (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-30">
                <path d="M6 3L8 5H4L6 3Z" fill="currentColor" />
                <path d="M6 9L4 7H8L6 9Z" fill="currentColor" />
            </svg>
        );
    }
    return sortOrder === 'asc' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 3L8 5H4L6 3Z" fill="currentColor" />
        </svg>
    ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 9L4 7H8L6 9Z" fill="currentColor" />
        </svg>
    );
}

export function ProductsTable({
    products,
    categories,
    totalProducts,
    currentPage,
    totalPages,
    onProductClick,
    onFilterClick,
    selectedCategory,
    onClearFilter,
    sortBy,
    sortOrder,
    onSort,
    searchQuery,
    onSearchChange,
}: Props) {
    // Helper function to get category name by id
    const getCategoryName = (categoryId: number | null): string => {
        if (!categoryId) return '—';
        const category = categories.find((cat) => cat.id === categoryId);
        return category?.name ?? '—';
    };

    return (
        <div className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 sm:px-6 py-3 border-b border-[#E5E7EB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#111827]">
                {/* Category Filter Button */}
                <button
                    onClick={onFilterClick}
                    className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#374151] dark:text-[#D1D5DB] bg-white dark:bg-[#1F2937] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] border border-[#D1D5DB] dark:border-[#4B5563] rounded-lg px-4 py-2 transition-all hover:shadow-sm active:scale-95"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className="transition-transform group-hover:rotate-180"
                    >
                        <path
                            d="M2 4h12M4 8h8M6 12h4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                    Filter Kategori
                    {selectedCategory && (
                        <span className="inline-flex items-center gap-1 bg-[#047857] text-white text-xs rounded-full px-2 py-0.5 animate-in fade-in zoom-in-95 duration-300">
                            {selectedCategory.name}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClearFilter();
                                }}
                                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path
                                        d="M2 2L8 8M2 8L8 2"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </span>
                    )}
                </button>

                {/* Search Bar */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari produk..."
                        className="w-full pl-10 pr-10 py-2 text-sm border border-[#D1D5DB] dark:border-[#4B5563] rounded-lg focus:ring-2 focus:ring-[#047857] focus:border-[#047857] transition-all outline-none bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB]"
                    />
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
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
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F3F4F6] rounded transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M3 3L11 11M3 11L11 3"
                                    stroke="#6B7280"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Table header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-[#E5E7EB] dark:border-[#374151] gap-2">
                <h2 className="text-sm font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Daftar Produk</h2>
                <span className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                    {totalProducts.toLocaleString()} produk · halaman {currentPage} dari {totalPages}
                </span>
            </div>

            {/* Table - Internal Scroll Only */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#D1D5DB] scrollbar-track-transparent">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="text-left text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider px-4 sm:px-6 py-3 bg-[#F9FAFB] dark:bg-[#111827]">
                                <button
                                    onClick={() => onSort('name')}
                                    className="inline-flex items-center gap-1 hover:text-[#1F2937] dark:hover:text-[#F9FAFB] transition-colors"
                                >
                                    {TABLE_HEADERS[0]}
                                    <SortIcon field="name" sortBy={sortBy} sortOrder={sortOrder} />
                                </button>
                            </th>
                            <th className="text-left text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-4 sm:px-6 py-3 bg-[#F9FAFB] dark:bg-[#111827]">
                                {TABLE_HEADERS[1]}
                            </th>
                            <th className="text-left text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-4 sm:px-6 py-3 bg-[#F9FAFB] dark:bg-[#111827]">
                                <button
                                    onClick={() => onSort('price')}
                                    className="inline-flex items-center gap-1 hover:text-[#1F2937] dark:hover:text-[#F9FAFB] transition-colors"
                                >
                                    {TABLE_HEADERS[2]}
                                    <SortIcon field="price" sortBy={sortBy} sortOrder={sortOrder} />
                                </button>
                            </th>
                            <th className="text-left text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-4 sm:px-6 py-3 bg-[#F9FAFB] dark:bg-[#111827]">
                                <button
                                    onClick={() => onSort('clicks')}
                                    className="inline-flex items-center gap-1 hover:text-[#1F2937] dark:hover:text-[#F9FAFB] transition-colors"
                                >
                                    {TABLE_HEADERS[3]}
                                    <SortIcon field="clicks" sortBy={sortBy} sortOrder={sortOrder} />
                                </button>
                            </th>
                            <th className="text-left text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-4 sm:px-6 py-3 bg-[#F9FAFB] dark:bg-[#111827]">
                                {TABLE_HEADERS[4]}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={TABLE_HEADERS.length}
                                    className="text-center py-12 text-sm text-[#9CA3AF]"
                                >
                                    <div className="animate-pulse">Tidak ada data produk.</div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product, index) => (
                                <tr
                                    key={product.id}
                                    onClick={() => onProductClick(product)}
                                    className="border-t border-[#F0EEE8] dark:border-[#374151] hover:bg-[#FAFAF8] dark:hover:bg-[#374151] transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-left-4"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animationDuration: '400ms',
                                    }}
                                >
                                    <td className="px-4 sm:px-6 py-3 text-[13px] font-medium text-[#1a1a18] dark:text-[#F9FAFB]">
                                        {product.name}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3">
                                        <span className="text-[11px] font-medium text-[#5F5E5A] dark:text-[#D1D5DB] bg-[#F0EEE8] dark:bg-[#374151] rounded-full px-2.5 py-0.5 whitespace-nowrap transition-colors hover:bg-[#E8E5DC] dark:hover:bg-[#4B5563]">
                                            {getCategoryName(product.category_id)}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 text-[13px] text-[#888780] dark:text-[#9CA3AF]">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 sm:px-6 py-3">
                                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1a1a18] dark:text-[#F9FAFB]">
                                            {product.total_links_generated.toLocaleString()}
                                            {product.total_links_generated > 0 && (
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 14 14"
                                                    fill="none"
                                                    className="text-[#888780] dark:text-[#9CA3AF]"
                                                >
                                                    <path
                                                        d="M5 9L9 5M9 5H6M9 5V8"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3">
                                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1a1a18] dark:text-[#F9FAFB]">
                                            {product.total_recommendations.toLocaleString()}
                                            {product.total_recommendations > 0 && (
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 14 14"
                                                    fill="none"
                                                    className="text-[#888780] dark:text-[#9CA3AF]"
                                                >
                                                    <path
                                                        d="M5 9L9 5M9 5H6M9 5V8"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
