import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
    return (
        <div className="min-h-screen bg-white -m-6 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div>
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>

                {/* Profile Settings Card Skeleton */}
                <Card className="border border-[#E5E7EB]">
                    <div className="p-6">
                        <div className="mb-6">
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-56" />
                        </div>

                        {/* Avatar Skeleton */}
                        <div className="flex items-center gap-4 mb-6">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div>
                                <Skeleton className="h-4 w-28 mb-1" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>

                        {/* Form Fields Skeleton - 2 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>

                        {/* Button Skeleton */}
                        <div className="flex justify-end mt-6">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </Card>

                {/* Security Settings Card Skeleton */}
                <Card className="border border-[#E5E7EB]">
                    <div className="p-6">
                        <div className="mb-6">
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>

                        {/* Password Fields Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2 md:col-span-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>

                        {/* Button Skeleton */}
                        <div className="flex justify-end mt-6">
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
