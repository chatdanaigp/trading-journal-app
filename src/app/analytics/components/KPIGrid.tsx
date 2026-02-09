'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AnalyticsData } from '../actions'
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'

export function KPIGrid({ stats }: { stats: AnalyticsData['stats'] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Net Profit */}
            <Card className="relative overflow-hidden border-0 shadow-2xl group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ccf381]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />

                <CardContent className="p-6 relative z-30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#ccf381]/10 rounded-xl border border-[#ccf381]/20">
                            <TrendingUp className="w-5 h-5 text-[#ccf381]" />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded bg-[#252525] text-gray-400 border border-white/5`}>
                            Net PnL
                        </span>
                    </div>
                    <h3 className={`text-3xl font-bold tracking-tight ${stats.netProfit >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                        ${stats.netProfit.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Total Net Profit</p>
                </CardContent>
            </Card>

            {/* Profit Factor */}
            <Card className="relative overflow-hidden border-0 shadow-2xl group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />

                <CardContent className="p-6 relative z-30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-[#252525] text-gray-400 border border-white/5">
                            PF
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                        {stats.profitFactor.toFixed(2)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Profit Factor (&gt; 1.5 is Good)</p>
                </CardContent>
            </Card>

            {/* Win Rate & R:R */}
            <Card className="relative overflow-hidden border-0 shadow-2xl group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />

                <CardContent className="p-6 relative z-30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-[#252525] text-gray-400 border border-white/5">
                            Win Rate
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
                            {stats.winRate.toFixed(1)}%
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Avg R:R <span className="text-white font-bold">{stats.avgLoss > 0 ? (stats.avgWin / stats.avgLoss).toFixed(2) : '-'}</span>
                    </p>
                </CardContent>
            </Card>

            {/* Max Drawdown */}
            <Card className="relative overflow-hidden border-0 shadow-2xl group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                <div className="absolute -inset-[1px] bg-gradient-to-b from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />

                <CardContent className="p-6 relative z-30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-[#252525] text-gray-400 border border-white/5">
                            Max DD
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-red-500 tracking-tight">
                        -${stats.maxDrawdown.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Peak to Trough Decline</p>
                </CardContent>
            </Card>
        </div>
    )
}
