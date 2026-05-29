import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            {/* Products Table Skeleton */}
            <Card className="border-[#E2E0D8] dark:border-[#374151]">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Charts & Insights Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-[#E2E0D8] dark:border-[#374151]">
                        <CardHeader>
                            <Skeleton className="h-6 w-64" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="border-[#E2E0D8] dark:border-[#374151]">
                                <CardContent className="p-4">
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <Card className="border-[#E2E0D8] dark:border-[#374151]">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
