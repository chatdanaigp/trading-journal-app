'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AnalyticsData } from '../actions'
import { TrendingUp, TrendingDown, Activity, Target, Zap, ArrowUpDown } from 'lucide-react'

export function KPIGrid({ stats }: { stats: AnalyticsData['stats'] }) {
    const kpis = [
        {
            label: 'Net Profit',
            tag: 'Net PnL',
            value: `$${stats.netProfit.toLocaleString()}`,
            subtitle: 'Total Net Profit',
            icon: TrendingUp,
            iconColor: 'text-[#ccf381]',
            iconBg: 'bg-[#ccf381]/10 border-[#ccf381]/20',
            hoverGlow: 'from-[#ccf381]/20',
            valueClass: stats.netProfit >= 0
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]'
                : 'text-red-400',
        },
        {
            label: 'Profit Factor',
            tag: 'PF',
            value: stats.profitFactor.toFixed(2),
            subtitle: '> 1.5 is Good',
            icon: Activity,
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-500/10 border-blue-500/20',
            hoverGlow: 'from-blue-500/20',
            valueClass: 'text-white',
        },
        {
            label: 'Win Rate',
            tag: 'WR',
            value: `${stats.winRate.toFixed(1)}%`,
            subtitle: `R:R ${stats.avgLoss > 0 ? (stats.avgWin / stats.avgLoss).toFixed(2) : '-'}`,
            icon: Target,
            iconColor: 'text-purple-400',
            iconBg: 'bg-purple-500/10 border-purple-500/20',
            hoverGlow: 'from-purple-500/20',
            valueClass: 'text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400',
        },
        {
            label: 'Max Drawdown',
            tag: 'Max DD',
            value: `-$${stats.maxDrawdown.toLocaleString()}`,
            subtitle: 'Peak to Trough',
            icon: TrendingDown,
            iconColor: 'text-red-400',
            iconBg: 'bg-red-500/10 border-red-500/20',
            hoverGlow: 'from-red-500/20',
            valueClass: 'text-red-500',
        },
        {
            label: 'Avg Win / Loss',
            tag: 'W/L',
            value: `$${stats.avgWin.toFixed(0)}`,
            subtitle: `Avg Loss: $${stats.avgLoss.toFixed(0)}`,
            icon: ArrowUpDown,
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/10 border-amber-500/20',
            hoverGlow: 'from-amber-500/20',
            valueClass: 'text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-400',
        },
        {
            label: 'Expectancy',
            tag: 'EV',
            value: `$${stats.expectancy.toFixed(2)}`,
            subtitle: 'Per Trade Expected Value',
            icon: Zap,
            iconColor: 'text-cyan-400',
            iconBg: 'bg-cyan-500/10 border-cyan-500/20',
            hoverGlow: 'from-cyan-500/20',
            valueClass: stats.expectancy >= 0
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400'
                : 'text-red-400',
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                    <Card key={kpi.label} className="relative overflow-hidden border-0 shadow-2xl group">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                        <div className={`absolute -inset-[1px] bg-gradient-to-b ${kpi.hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm`} />

                        <CardContent className="p-5 relative z-30">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2.5 rounded-xl border ${kpi.iconBg}`}>
                                    <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#252525] text-gray-500 border border-white/5 uppercase tracking-wider">
                                    {kpi.tag}
                                </span>
                            </div>
                            <h3 className={`text-2xl font-bold tracking-tight ${kpi.valueClass}`}>
                                {kpi.value}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1 truncate">{kpi.subtitle}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
