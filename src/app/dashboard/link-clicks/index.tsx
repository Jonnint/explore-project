'use client';

import { useState, useMemo } from 'react';
import type { LinkClicksResponse, Product } from '@/types/link-clicks';
import { useLinkClicksFilters } from '@/features/link-clicks/hooks/use-link-clicks-filters';
import { sortCategories } from '@/features/link-clicks/utils/category-helper';
import {
    sortProducts,
    paginateProducts,
    getTotalPages,
    type SortField,
    type SortOrder,
} from '@/features/link-clicks/utils/products-helper';
import { StatsCards } from '@/features/link-clicks/components/stats-cards';
import { TopProductsChart } from '@/features/link-clicks/components/top-products-chart';
import { ProductsTable } from '@/features/link-clicks/components/products-table';
import { Pagination } from '@/features/link-clicks/components/pagination';
import CategoryFilterModal from '@/components/category-filter-modal';
import LinkDetailsModal from '@/features/link-clicks/components/link-details-modal';

interface Props {
    data: LinkClicksResponse;
    filters: { category?: string; page?: string; sort?: string; order?: string };
}

export default function LinkClicksClient({ data, filters }: Props) {
    const { stats, categories, products } = data;
    const { isModalOpen, setIsModalOpen, setFilter, goToPage, setSort } = useLinkClicksFilters();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

    const selectedCategory = sortedCategories.find((cat) => cat.slug === filters.category);

    // Filter products by category
    const filteredProducts = useMemo(() => {
        if (!filters.category) return products;
        return products.filter((p) => p.category_id === selectedCategory?.id);
    }, [products, filters.category, selectedCategory]);

    // Filter by search query
    const searchedProducts = useMemo(() => {
        if (!searchQuery.trim()) return filteredProducts;
        const query = searchQuery.toLowerCase();
        return filteredProducts.filter((p) => p.name.toLowerCase().includes(query));
    }, [filteredProducts, searchQuery]);

    // Sort products
    const sortBy = (filters.sort as SortField) || 'clicks';
    const sortOrder = (filters.order as SortOrder) || 'desc';
    const sortedProducts = useMemo(
        () => sortProducts(searchedProducts, sortBy, sortOrder),
        [searchedProducts, sortBy, sortOrder]
    );

    // Paginate products
    const currentPage = parseInt(filters.page || '1', 10);
    const totalPages = getTotalPages(sortedProducts.length);
    const paginatedProducts = useMemo(
        () => paginateProducts(sortedProducts, currentPage),
        [sortedProducts, currentPage]
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-screen-2xl mx-auto">
                {/* Page Header */}
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a18] dark:text-[#F9FAFB]">
                        Link Click Tracking
                    </h1>
                    <p className="text-sm text-[#888780] dark:text-[#9CA3AF] mt-1">
                        Monitor dan analisis performa tracking link per produk
                    </p>
                </div>

                {/* Stats Cards */}
                <StatsCards stats={stats} />

                {/* Top Products Chart */}
                <TopProductsChart products={products} />

                {/* Products Table */}
                <ProductsTable
                    products={paginatedProducts}
                    categories={sortedCategories}
                    totalProducts={sortedProducts.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onProductClick={setSelectedProduct}
                    onFilterClick={() => setIsModalOpen(true)}
                    selectedCategory={selectedCategory}
                    onClearFilter={() => setFilter('category', null)}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={setSort}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} lastPage={totalPages} onPageChange={goToPage} />
                )}

                {/* Category Filter Modal */}
                <CategoryFilterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    categories={sortedCategories}
                    selectedCategoryId={filters.category ?? null}
                    onApply={(categorySlug) => setFilter('category', categorySlug)}
                />

                {/* Link Details Modal */}
                <LinkDetailsModal
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    product={selectedProduct}
                    categories={sortedCategories}
                />
            </div>
        </div>
    );
}
