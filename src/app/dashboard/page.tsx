'use client'

import { useDashboardData } from '@/hooks/usePageData'
import { TradeForm } from './TradeForm'
import { Card, CardContent } from '@/components/ui/card'
import { EquityChart } from './EquityChart'
import { CalendarWidget } from './CalendarWidget'
import { ProfitTree } from './ProfitTree'
import { TrendingUp, Activity, BarChart2, Upload } from 'lucide-react'
import { TradeList } from './TradeList'
import { AdvancedStats } from './AdvancedStats'
import { ImportModal } from './ImportModal'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { CelebrationModal } from '@/components/ui/CelebrationModal'
import { TopNavigation } from '@/components/TopNavigation'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function useLang() {
    const [dict, setDict] = useState<any>(null)
    useEffect(() => {
        const lang = (document.cookie.match(/tj_language=(\w+)/)?.[1] || 'EN') as 'EN' | 'TH'
        import('@/utils/dictionaries').then(mod => setDict(mod.dictionaries[lang]))
    }, [])
    return dict
}

export default function DashboardPage() {
    const searchParams = useSearchParams()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined

    const { data, isLoading } = useDashboardData(month, year)
    const dict = useLang()
    const [importOpen, setImportOpen] = useState(false)

    if (isLoading || !data || !dict) return <PageSkeleton />

    const { trades, allTrades, stats, username, points, dailyTargetAmount, isQuestActive, portSize, goalPercent } = data
    const { monthlyPoints, weeklyPoints, dailyPoints, dailyProfit } = points

    return (
        <StaggerContainer className="space-y-8">
            <CelebrationModal dailyTarget={dailyTargetAmount} netToday={dailyProfit} isQuestActive={isQuestActive} dict={dict} />
            {/* Header */}
            <StaggerItem>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{dict.dashboard.overview}</h1>
                        <p className="text-gray-500 text-sm lg:text-base">{dict.dashboard.welcome}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setImportOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#1a1a1a] border border-[#333] text-gray-400 hover:border-[#ccf381]/40 hover:text-[#ccf381] transition-all"
                        >
                            <Upload size={14} />
                            {dict?.import?.csvBtn || 'Import CSV'}
                        </button>
                        <TopNavigation />
                    </div>
                </div>
            </StaggerItem>

            <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} dict={dict} />

            {/* Top Grid: Stats & Profit Tree */}
            <div className="grid grid-cols-12 gap-6">
                <StaggerItem className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Net Revenue */}
                    <Card className="relative overflow-hidden group border-0 shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                        <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ccf381]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 z-10">
                            <TrendingUp className="w-32 h-32 text-[#ccf381]" />
                        </div>
                        <CardContent className="p-6 relative z-30">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-gray-500 font-medium tracking-wide text-xs uppercase">{dict.dashboard.netProfit}</p>
                                {portSize > 0 && (
                                    <p className="text-gray-500 font-medium tracking-wide text-[10px] uppercase text-right opacity-90 mt-0.5">
                                        {dict.dashboard?.totalEquity || 'Total Balance'}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-between items-baseline mb-4">
                                <h3 className={`text-5xl font-bold tracking-tight ${Number(stats.netProfit) >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                                    ${Number(stats.netProfit).toLocaleString()}
                                </h3>
                                {portSize > 0 && (
                                    <div className="text-right opacity-90">
                                        <span className="text-2xl font-bold text-white tracking-tight">
                                            ${(portSize + Number(stats.netProfit)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1 font-medium ${Number(stats.netProfit) >= 0 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {Number(stats.netProfit) >= 0 ? '↗' : '↘'} {stats.winRate}% {dict.dashboard.winRate}
                                </span>
                                <span className="text-xs text-gray-600">{dict.dashboard.vsLastPeriod}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Trades & Win Rate */}
                    <div className="grid grid-cols-2 gap-3 lg:gap-6">
                        <Card className="relative overflow-hidden group border-0 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/20 transition-colors duration-300" />
                            <CardContent className="p-4 lg:p-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                                    <Activity className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.dashboard.totalTrades}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.totalTrades}</h3>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group border-0 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/30 transition-colors duration-300" />
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#ccf381]/5 blur-2xl rounded-full group-hover:bg-[#ccf381]/10 transition-colors duration-500" />
                            <CardContent className="p-4 lg:p-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ccf381]/20 to-[#ccf381]/5 border border-[#ccf381]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(204,243,129,0.1)]">
                                    <BarChart2 className="w-5 h-5 text-[#ccf381]" />
                                </div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.dashboard.winRate}</p>
                                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]">{stats.winRate}%</h3>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Points */}
                    <Card className="flex-1 relative overflow-hidden group border-0 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/20 transition-colors duration-300" />
                        <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">{dict.dashboard.pointsThisMonth}</p>
                            <h3 className={`text-5xl font-bold tracking-tight mb-4 ${monthlyPoints >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                                {monthlyPoints > 0 ? '+' : ''}{monthlyPoints.toLocaleString()} <span className="text-lg text-gray-400 font-normal">pts</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{dict.dashboard.today}</p>
                                    <p className={`text-lg font-bold ${dailyPoints > 0 ? 'text-[#ccf381]' : dailyPoints < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                        {dailyPoints > 0 ? '+' : ''}{dailyPoints.toLocaleString()} pts
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{dict.dashboard.thisWeek}</p>
                                    <p className={`text-lg font-bold ${weeklyPoints > 0 ? 'text-[#ccf381]' : weeklyPoints < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                        {weeklyPoints > 0 ? '+' : ''}{weeklyPoints.toLocaleString()} pts
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </StaggerItem>

                <StaggerItem className="col-span-12 lg:col-span-8 h-full">
                    <ProfitTree netProfit={Number(stats.netProfit)} portSize={Number(portSize)} goalPercent={Number(goalPercent)} dict={dict} />
                </StaggerItem>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-12 gap-6">
                <StaggerItem className="col-span-12">
                    <AdvancedStats stats={stats as any} dict={dict} />
                </StaggerItem>
                <StaggerItem className="col-span-12">
                    <EquityChart trades={trades} dict={dict} />
                </StaggerItem>
            </div>

            {/* Bottom: Trade Form + Calendar */}
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <StaggerItem className="col-span-1 lg:col-span-6 h-full">
                        <div className="w-full h-full flex flex-col">
                            <h2 className="text-xl font-bold text-white mb-4 shrink-0">{dict.dashboard.quickTrade}</h2>
                            <div className="flex-grow">
                                <TradeForm trades={trades} portSize={portSize} goalPercent={goalPercent} dict={dict} />
                            </div>
                        </div>
                    </StaggerItem>
                    <StaggerItem className="col-span-1 lg:col-span-6 h-full">
                        <div className="w-full h-full flex flex-col">
                            <div className="h-[44px] hidden lg:block shrink-0" aria-hidden="true"></div>
                            <div className="flex-grow">
                                <CalendarWidget trades={allTrades} dict={dict} />
                            </div>
                        </div>
                    </StaggerItem>
                </div>

                <StaggerItem className="w-full">
                    <div className="w-full">
                        <TradeList trades={trades} username={username} dict={dict} />
                    </div>
                </StaggerItem>
            </div>
        </StaggerContainer>
    )
}
