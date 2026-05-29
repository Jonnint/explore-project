import {
    StatsCardsSkeleton,
    ChartSkeleton,
    TableSkeleton,
} from '@/features/link-clicks/components/table-skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header Skeleton */}
                <div className="mb-6 animate-pulse">
                    <div className="h-8 bg-[#E2E0D8] rounded w-64 mb-2" />
                    <div className="h-4 bg-[#F0EEE8] rounded w-96" />
                </div>

                {/* Stats Cards Skeleton */}
                <StatsCardsSkeleton />

                {/* Chart Skeleton */}
                <ChartSkeleton />

                {/* Products Table Skeleton */}
                <TableSkeleton />
            </div>
        </div>
    );
}
