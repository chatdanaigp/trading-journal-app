'use client'

import { useHistoryData } from '@/hooks/usePageData'
import { TradeList } from '@/app/dashboard/TradeList'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useEffect, useState } from 'react'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'
import { History, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subMonths, addMonths, isThisMonth } from 'date-fns'

// Hook to load locale dictionary safely on client
function useLang() {
    const [dict, setDict] = useState<any>(null)
    useEffect(() => {
        const lang = (document.cookie.match(/tj_language=(\w+)/)?.[1] || 'EN') as 'EN' | 'TH'
        import('@/utils/dictionaries').then(mod => setDict(mod.dictionaries[lang]))
    }, [])
    return dict
}

export default function HistoryPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    const { data, isLoading } = useHistoryData(month, year)
    const dict = useLang()

    if (isLoading || !data || !dict) return <PageSkeleton />

    const { trades, username } = data

    return (
        <StaggerContainer className="space-y-8 h-full flex flex-col">
            {/* Header */}
            <StaggerItem className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                            <History className="w-8 h-8 text-[#ccf381]" />
                            {dict?.sidebar?.history || 'History'}
                        </h1>
                        <p className="text-gray-500 text-sm lg:text-base">
                            {dict?.analytics?.allTimeView || 'All of your executed trades.'}
                        </p>
                    </div>

                    {/* Month Selector */}
                    <div className="flex items-center gap-4 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 mt-2 md:mt-0">
                        <button 
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
                            className="p-1 hover:text-[#ccf381] transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="font-bold min-w-[120px] text-center text-sm md:text-base text-gray-200">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button 
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
                            disabled={isThisMonth(currentDate)}
                            className={`p-1 transition-colors ${isThisMonth(currentDate) ? 'text-gray-600 cursor-not-allowed' : 'hover:text-[#ccf381]'}`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                <TopNavigation />
            </StaggerItem>

            {/* Full screen TradeList */}
            <StaggerItem className="flex-grow pb-4">
                <div className="w-full h-full">
                    <TradeList 
                        trades={trades} 
                        username={username} 
                        dict={dict} 
                        hideHeader={true}
                        className="max-h-[calc(100vh-160px)] h-full"
                    />
                </div>
            </StaggerItem>
        </StaggerContainer>
    )
}
