export function generatePageNumbers(
    currentPage: number,
    lastPage: number
): (number | '...')[] {
    const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

    const filtered = pages.filter(
        (p) =>
            p === 1 ||
            p === lastPage ||
            Math.abs(p - currentPage) <= 1
    );

    return filtered.reduce<(number | '...')[]>((acc, p, idx, arr) => {
        if (idx > 0 && (arr[idx - 1] as number) + 1 < p) {
            acc.push('...');
        }
        acc.push(p);
        return acc;
    }, []);
}
