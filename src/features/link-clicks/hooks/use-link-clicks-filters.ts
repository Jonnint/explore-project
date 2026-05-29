import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { SortField, SortOrder } from '../utils/products-helper';

export function useLinkClicksFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);

    function setFilter(key: string, value: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1 when filtering
        router.push(`${pathname}?${params.toString()}`);
        setIsModalOpen(false);
    }

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        router.push(`${pathname}?${params.toString()}`);
    }

    function setSort(field: SortField) {
        const params = new URLSearchParams(searchParams.toString());
        const currentSort = params.get('sort') as SortField | null;
        const currentOrder = (params.get('order') as SortOrder) || 'desc';

        // Toggle order if same field, otherwise default to desc
        if (currentSort === field) {
            params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
        } else {
            params.set('sort', field);
            params.set('order', 'desc');
        }

        router.push(`${pathname}?${params.toString()}`);
    }

    return {
        isModalOpen,
        setIsModalOpen,
        setFilter,
        goToPage,
        setSort,
    };
}
