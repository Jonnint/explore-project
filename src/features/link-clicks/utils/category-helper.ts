import type { Category } from '@/types/link-clicks';

export function sortCategories(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}
