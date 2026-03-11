'use client'

import { useAnalyticsData } from '@/hooks/usePageData'
import { KPIGrid } from './components/KPIGrid'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { SessionStrategyCharts } from './components/SessionStrategyCharts'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'
import { CardSkeleton, ChartSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { useEffect, useState } from 'react'

function useLang() {
    const [dict, setDict] = useState<any>(null)
    useEffect(() => {
        const lang = (document.cookie.match(/tj_language=(\w+)/)?.[1] || 'EN') as 'EN' | 'TH'
        import('@/utils/dictionaries').then(mod => setDict(mod.dictionaries[lang]))
    }, [])
    return dict
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <ChartSkeleton />
            <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <ChartSkeleton />
        </div>
    )
}

export default function AnalyticsPage() {
    const { data, isLoading } = useAnalyticsData()
    const dict = useLang()
    const now = new Date()

    if (isLoading || !data || !dict) return <AnalyticsSkeleton />

    const { monthlyData, yearlyData } = data

    return (
        <div className="space-y-8">
            <TopNavigation />

            <StaggerContainer className="space-y-8">
                <StaggerItem>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{(dict as any)?.analytics?.monthlyTitle || 'Monthly Analytics'} ({now.toLocaleString('default', { month: 'long' })})</h1>
                            <p className="text-gray-500">{(dict as any)?.analytics?.monthlySubtitle || 'Performance for the current month'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-[#ccf381] font-bold shadow-[0_0_10px_rgba(204,243,129,0.1)]">
                            Month-To-Date (MTD)
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem>
                    <KPIGrid stats={monthlyData.stats} dict={dict} />
                </StaggerItem>
                <StaggerItem>
                    <AnalyticsCharts data={monthlyData} dict={dict} />
                </StaggerItem>

                <StaggerItem className="pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{(dict as any)?.analytics?.yearlyTitle || 'Yearly Overview'} ({now.getFullYear()})</h1>
                            <p className="text-gray-500">{(dict as any)?.analytics?.yearlySubtitle || 'Comprehensive performance for the current year'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400 font-bold">
                            Year-To-Date (YTD)
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem>
                    <KPIGrid stats={yearlyData.stats} dict={dict} />
                </StaggerItem>
                <StaggerItem>
                    <AnalyticsCharts data={yearlyData} dict={dict} />
                </StaggerItem>

                {/* Session & Strategy Insights */}
                <StaggerItem className="pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{(dict as any)?.analytics?.insightsTitle || 'Trading Insights'}</h1>
                            <p className="text-gray-500">{(dict as any)?.analytics?.insightsSubtitle || 'Session, Strategy & Pattern Analysis'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-amber-400 font-bold">
                            Deep Analysis
                        </div>
                    </div>
                </StaggerItem>
                <StaggerItem>
                    <SessionStrategyCharts data={yearlyData} dict={dict} />
                </StaggerItem>
            </StaggerContainer>
        </div>
    )
}
