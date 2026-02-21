import React from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart3, Scale } from 'lucide-react'

interface AdvancedStatsProps {
    stats: {
        totalTrades: number
        winRate: string
        netProfit: string
        profitFactor: string
        averageWin: string
        averageLoss: string
        totalLots: string
        longStats: {
            count: number
            winRate: string
            profit: string
        }
        shortStats: {
            count: number
            winRate: string
            profit: string
        }
    }
    dict?: any
}

export function AdvancedStats({ stats, dict }: AdvancedStatsProps) {
    const pf = Number(stats.profitFactor)
    const pfColor = pf >= 2.0 ? 'text-[#ccf381]' : pf >= 1.0 ? 'text-gray-200' : 'text-red-400'

    // Bar widths for avg win/loss explanation
    const avgWin = Number(stats.averageWin)
    const avgLoss = Number(stats.averageLoss)
    const totalAvg = avgWin + avgLoss
    const winBarPercent = totalAvg > 0 ? (avgWin / totalAvg) * 100 : 50

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Profit Factor Card */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333] relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{dict?.dashboard?.profitFactorCard || 'Profit Factor'}</p>
                        <h3 className={`text-4xl font-bold mt-2 ${pfColor} tracking-tight`}>
                            {stats.profitFactor}
                        </h3>
                    </div>
                    <div className="p-2 bg-[#2a2a2a] rounded-lg border border-[#333]">
                        <Scale size={18} className="text-gray-400" />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 relative z-10">
                    {dict?.dashboard?.pfTarget || 'Target: > 1.5'}
                </p>
                {/* Background Decoration */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 
                    ${pf >= 1.5 ? 'bg-[#ccf381]' : 'bg-red-500'}`} />
            </div>

            {/* 2. Avg Win vs Avg Loss */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333] relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{dict?.dashboard?.avgTradeResult || 'Avg Trade Result'}</p>
                    <Activity size={18} className="text-gray-400" />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-xs text-gray-500 block mb-0.5">{dict?.dashboard?.avgWin || 'Avg Win'}</span>
                            <span className="text-lg font-bold text-[#ccf381]">+${stats.averageWin}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-500 block mb-0.5">{dict?.dashboard?.avgLoss || 'Avg Loss'}</span>
                            <span className="text-lg font-bold text-red-400">-${stats.averageLoss}</span>
                        </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden flex">
                        <div style={{ width: `${winBarPercent}%` }} className="h-full bg-[#ccf381]" />
                        <div style={{ width: `${100 - winBarPercent}%` }} className="h-full bg-red-500/80" />
                    </div>
                </div>
            </div>

            {/* 3. Long vs Short Performance */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333] relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{dict?.dashboard?.sideAnalysis || 'Side Analysis'}</p>
                    <BarChart3 size={18} className="text-gray-400" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Long Stats */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs font-bold text-gray-300">BUY</span>
                        </div>
                        <p className={`text-lg font-bold ${Number(stats.longStats.profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.longStats.winRate}%
                        </p>
                        <p className="text-[10px] text-gray-600">{dict?.dashboard?.winRate || 'Win Rate'} ({stats.longStats.count})</p>
                    </div>

                    {/* Short Stats */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="text-xs font-bold text-gray-300">SELL</span>
                        </div>
                        <p className={`text-lg font-bold ${Number(stats.shortStats.profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.shortStats.winRate}%
                        </p>
                        <p className="text-[10px] text-gray-600">{dict?.dashboard?.winRate || 'Win Rate'} ({stats.shortStats.count})</p>
                    </div>
                </div>
            </div>

            {/* 4. Volume / Lots */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333] relative overflow-hidden flex flex-col justify-center items-center text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#1a1a1a] opacity-40" />

                <div className="relative z-10">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">{dict?.dashboard?.totalVolume || 'Total Volume'}</p>
                    <h3 className="text-4xl font-black text-white tracking-tighter">
                        {stats.totalLots} <span className="text-lg font-medium text-gray-600">{dict?.dashboard?.lots || 'Lots'}</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-2">
                        {dict?.dashboard?.across || 'Across'} {stats.totalTrades} {dict?.dashboard?.tradesPlural || 'trades'}
                    </p>
                </div>
            </div>
        </div>
    )
}
