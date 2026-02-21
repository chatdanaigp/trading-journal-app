'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AnalyticsData } from '../actions'
import { TrendingUp, TrendingDown, Activity, Target, Zap, ArrowUpDown } from 'lucide-react'

export function KPIGrid({ stats, dict }: { stats: AnalyticsData['stats'], dict: any }) {
    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Hero Card: Net Profit — Col 4 */}
            <div className="col-span-12 lg:col-span-4">
                <Card className="relative overflow-hidden group border-0 shadow-2xl h-full">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                    <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ccf381]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />
                    <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 z-10">
                        <TrendingUp className="w-32 h-32 text-[#ccf381]" />
                    </div>

                    <CardContent className="p-6 relative z-30 flex flex-col justify-center h-full">
                        <p className="text-gray-500 font-medium mb-1 tracking-wide text-xs uppercase">{dict.analytics.netProfit}</p>
                        <h3 className={`text-5xl font-bold tracking-tight ${stats.netProfit >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                            ${stats.netProfit.toLocaleString()}
                        </h3>
                        <div className="flex items-center gap-2 mt-4">
                            <span className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1 font-medium ${stats.netProfit >= 0 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {stats.netProfit >= 0 ? '↗' : '↘'} {stats.winRate.toFixed(1)}% {dict.analytics.winRate}
                            </span>
                            <span className="text-xs text-gray-600">{dict.analytics.allTimeView}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Grid: 4 compact KPIs — Col 8 */}
            <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                    {/* Profit Factor */}
                    <Card className="relative overflow-hidden group border-0 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-blue-500/20 transition-colors duration-300" />

                        <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Activity className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.analytics.profitFactor}</p>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{stats.profitFactor.toFixed(2)}</h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">{dict.analytics.pfGood}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Win Rate */}
                    <Card className="relative overflow-hidden group border-0 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-purple-500/20 transition-colors duration-300" />
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full group-hover:bg-purple-500/10 transition-colors duration-500" />

                        <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Target className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.analytics.winRate}</p>
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">{stats.winRate.toFixed(1)}%</h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">R:R {stats.avgLoss > 0 ? (stats.avgWin / stats.avgLoss).toFixed(2) : '-'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Max Drawdown */}
                    <Card className="relative overflow-hidden group border-0 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-red-500/20 transition-colors duration-300" />

                        <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.analytics.maxDrawdown}</p>
                                <h3 className="text-2xl font-bold text-red-500 tracking-tight">-${stats.maxDrawdown.toLocaleString()}</h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">{dict.analytics.peakToTrough}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expectancy */}
                    <Card className="relative overflow-hidden group border-0 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-cyan-500/20 transition-colors duration-300" />
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-500/5 blur-2xl rounded-full group-hover:bg-cyan-500/10 transition-colors duration-500" />

                        <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Zap className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.analytics.expectancy}</p>
                                <h3 className={`text-2xl font-bold tracking-tight ${stats.expectancy >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400' : 'text-red-400'}`}>
                                    ${stats.expectancy.toFixed(2)}
                                </h3>
                                <p className="text-[10px] text-gray-600 mt-0.5">{dict.analytics.perTradeEV}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Avg Win & Avg Loss — Small accent cards */}
            <div className="col-span-12">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 flex items-center gap-4 group hover:border-[#ccf381]/20 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center flex-shrink-0">
                            <ArrowUpDown className="w-5 h-5 text-[#ccf381]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{dict.analytics.avgWin}</p>
                            <p className="text-xl font-bold text-[#ccf381]">${stats.avgWin.toFixed(0)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{dict.analytics.avgLoss}</p>
                            <p className="text-xl font-bold text-red-400">${stats.avgLoss.toFixed(0)}</p>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 flex items-center gap-4 group hover:border-[#ccf381]/20 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-5 h-5 text-[#ccf381]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{dict.analytics.totalTrades}</p>
                            <p className="text-xl font-bold text-white">{stats.totalTrades}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{dict.analytics.profitFactor}</p>
                            <p className={`text-xl font-bold ${stats.profitFactor >= 1.5 ? 'text-[#ccf381]' : 'text-amber-400'}`}>{stats.profitFactor.toFixed(2)}x</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
