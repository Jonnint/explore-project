import { generatePageNumbers } from '../utils/pagination-helper';

interface Props {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, onPageChange }: Props) {
    const pageNumbers = generatePageNumbers(currentPage, lastPage);

    return (
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1 sm:gap-2 px-2 sm:px-6 py-3 border-t border-[#F0EEE8] dark:border-[#374151]">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="text-[11px] sm:text-[12px] border border-[#D3D1C7] dark:border-[#4B5563] rounded-md px-2 sm:px-2.5 py-1 bg-white dark:bg-[#1F2937] text-[#1a1a18] dark:text-[#F9FAFB] hover:bg-[#F8F7F4] dark:hover:bg-[#374151] disabled:opacity-40 transition-colors"
            >
                ← Prev
            </button>

            {pageNumbers.map((p, idx) =>
                p === '...' ? (
                    <span key={`dots-${idx}`} className="text-[11px] sm:text-[12px] text-[#B4B2A9] dark:text-[#6B7280] px-1 sm:px-1.5">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p as number)}
                        className={`text-[11px] sm:text-[12px] border rounded-md px-2 sm:px-2.5 py-1 transition-colors ${p === currentPage
                            ? 'bg-[#185FA5] text-white border-[#185FA5]'
                            : 'bg-white dark:bg-[#1F2937] text-[#1a1a18] dark:text-[#F9FAFB] border-[#D3D1C7] dark:border-[#4B5563] hover:bg-[#F8F7F4] dark:hover:bg-[#374151]'
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                disabled={currentPage === lastPage}
                onClick={() => onPageChange(currentPage + 1)}
                className="text-[11px] sm:text-[12px] border border-[#D3D1C7] dark:border-[#4B5563] rounded-md px-2 sm:px-2.5 py-1 bg-white dark:bg-[#1F2937] text-[#1a1a18] dark:text-[#F9FAFB] hover:bg-[#F8F7F4] dark:hover:bg-[#374151] disabled:opacity-40 transition-colors"
            >
                Next →
            </button>
        </div>
    );
}
