'use client'

import { cn } from '@/utils/cn'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-xl bg-white/5",
                className
            )}
            {...props}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a] p-6 shadow-xl">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
        </div>
    )
}

export function ChartSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a] p-6 shadow-xl">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <CardSkeleton />
                    <div className="grid grid-cols-2 gap-6">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                    <CardSkeleton />
                </div>
                <div className="col-span-12 lg:col-span-8">
                    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a] p-6 shadow-xl h-full">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Chart skeleton */}
            <ChartSkeleton />
        </div>
    )
}
