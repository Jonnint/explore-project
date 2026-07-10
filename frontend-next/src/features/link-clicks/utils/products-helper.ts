import type { Product } from '@/types/link-clicks';
import { ITEMS_PER_PAGE } from '../constants';

export type SortField = 'name' | 'price' | 'clicks';
export type SortOrder = 'asc' | 'desc';

export function sortProducts(
    products: Product[],
    sortBy: SortField,
    sortOrder: SortOrder
): Product[] {
    const sorted = [...products].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'clicks':
                comparison = a.total_links_generated - b.total_links_generated;
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
}

export function paginateProducts(products: Product[], page: number): Product[] {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
}

export function getTotalPages(totalItems: number): number {
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
}
