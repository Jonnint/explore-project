export function TableSkeleton() {
    return (
        <div className="bg-white border border-[#E2E0D8] rounded-xl overflow-hidden">
            {/* Header Skeleton */}
            <div className="px-4 sm:px-6 py-3 border-b border-[#F0EEE8]">
                <div className="h-10 bg-[#F0EEE8] rounded-lg w-48 animate-pulse" />
            </div>

            {/* Table Header Skeleton */}
            <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-[#F0EEE8]">
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-[#F0EEE8] rounded w-32 animate-pulse" />
                    <div className="h-4 bg-[#F0EEE8] rounded w-40 animate-pulse" />
                </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-[#FAFAF8]">
                            {[...Array(4)].map((_, i) => (
                                <th key={i} className="px-4 sm:px-6 py-3">
                                    <div className="h-3 bg-[#E2E0D8] rounded w-20 animate-pulse" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(15)].map((_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-t border-[#F0EEE8] animate-pulse"
                                style={{ animationDelay: `${rowIndex * 50}ms` }}
                            >
                                {[...Array(4)].map((_, colIndex) => (
                                    <td key={colIndex} className="px-4 sm:px-6 py-3">
                                        <div
                                            className="h-4 bg-[#F0EEE8] rounded animate-pulse"
                                            style={{
                                                width: `${60 + Math.random() * 40}%`,
                                                animationDelay: `${(rowIndex * 4 + colIndex) * 30}ms`,
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function StatsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5 w-full">
            {[...Array(4)].map((_, index) => (
                <div
                    key={index}
                    className="bg-white border border-[#E2E0D8] rounded-xl p-4 min-w-0 animate-pulse"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="h-3 bg-[#F0EEE8] rounded w-24 mb-3" />
                    <div className="h-8 bg-[#E2E0D8] rounded w-20 mb-2" />
                    <div className="h-2 bg-[#F0EEE8] rounded w-32" />
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white border border-[#E2E0D8] rounded-xl mb-5 animate-pulse">
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-[#F0EEE8]">
                <div className="h-5 bg-[#F0EEE8] rounded w-48" />
                <div className="h-4 bg-[#F0EEE8] rounded w-20" />
            </div>
            <div className="px-4 sm:px-6 py-6">
                <div className="h-[400px] bg-[#F8F7F4] rounded-lg flex items-end justify-around gap-2 p-4">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-[#E2E0D8] rounded-t animate-pulse"
                            style={{
                                height: `${30 + Math.random() * 70}%`,
                                width: '8%',
                                animationDelay: `${i * 100}ms`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
