'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

export function MonthlyInsight({ dict }: { dict?: any }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        fetch('/api/ai-insights')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading || !data || !data.hasData) return null

    return (
        <Card className="relative border-0 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0d0d0d] to-[#000000] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-purple-500/20 transition-colors duration-500" />

            <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between"
                >
                    <CardTitle className="text-white flex items-center gap-2 text-sm">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <span>{dict?.analytics?.aiInsightsTitle || 'AI Monthly Review'}</span>
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/25">{data.month}</span>
                    </CardTitle>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
            </CardHeader>

            {expanded && (
                <CardContent className="relative z-10 pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#0d0d0d] rounded-lg p-2.5 text-center border border-white/5">
                            <p className="text-[9px] text-gray-600 uppercase font-bold">Trades</p>
                            <p className="text-lg font-black text-white">{data.summary.totalTrades}</p>
                        </div>
                        <div className="bg-[#0d0d0d] rounded-lg p-2.5 text-center border border-white/5">
                            <p className="text-[9px] text-gray-600 uppercase font-bold">Win Rate</p>
                            <p className={`text-lg font-black ${data.summary.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}`}>{data.summary.winRate}%</p>
                        </div>
                        <div className="bg-[#0d0d0d] rounded-lg p-2.5 text-center border border-white/5">
                            <p className="text-[9px] text-gray-600 uppercase font-bold">Net P&L</p>
                            <p className={`text-lg font-black ${data.summary.netProfit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                {data.summary.netProfit >= 0 ? '+' : ''}${data.summary.netProfit}
                            </p>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400">
                            <Sparkles size={10} />
                            AI COACH INSIGHTS
                        </div>
                        {data.insights.map((insight: string, i: number) => (
                            <div key={i} className="text-xs text-gray-300 bg-[#0d0d0d] rounded-lg p-3 border border-white/5 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                            />
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
