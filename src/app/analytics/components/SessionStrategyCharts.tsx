'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsData } from '../actions'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Clock, Tag, Calendar, Flame } from 'lucide-react'

const SESSION_COLORS: Record<string, string> = {
    'Asian': '#f472b6',
    'London': '#60a5fa',
    'New York': '#ccf381',
    'Off-hours': '#9ca3af'
}

const DAY_COLORS = ['#facc15', '#f472b6', '#4ade80', '#fb923c', '#60a5fa']

export function SessionStrategyCharts({ data, dict }: { data: AnalyticsData, dict: any }) {
    const { sessionPerformance, strategyPerformance, dayOfWeekPerformance, streaks } = data

    if (data.stats.totalTrades === 0) return null

    return (
        <div className="space-y-6">
            {/* Row 1: Streaks + Day of Week */}
            <div className="grid grid-cols-12 gap-6">
                {/* Streak Cards — Col 4 */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    {/* Win Streak */}
                    <Card className="relative border-0 shadow-2xl overflow-hidden group flex-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-[#ccf381]/20 transition-colors duration-300" />
                        <CardContent className="p-5 relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center flex-shrink-0">
                                <Flame className="w-6 h-6 text-[#ccf381]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{dict?.analytics?.maxWinStreak || 'Best Win Streak'}</p>
                                <h3 className="text-3xl font-black text-[#ccf381]">{streaks?.maxWinStreak || 0}</h3>
                                <p className="text-[10px] text-gray-600">{dict?.analytics?.consecutiveWins || 'consecutive wins'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Loss Streak */}
                    <Card className="relative border-0 shadow-2xl overflow-hidden group flex-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-red-500/20 transition-colors duration-300" />
                        <CardContent className="p-5 relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                <Flame className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{dict?.analytics?.maxLossStreak || 'Worst Loss Streak'}</p>
                                <h3 className="text-3xl font-black text-red-400">{streaks?.maxLossStreak || 0}</h3>
                                <p className="text-[10px] text-gray-600">{dict?.analytics?.consecutiveLosses || 'consecutive losses'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Day of Week — Col 8 */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-amber-500/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-amber-500 rounded-full inline-block" />
                                {dict?.analytics?.dayOfWeekTitle || 'Day of Week Performance'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 h-[220px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dayOfWeekPerformance || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                                    <XAxis dataKey="day" stroke="#fff" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        formatter={(val: any, name: any) => [`$${Number(val).toFixed(2)}`, 'P&L']}
                                    />
                                    <Bar dataKey="profit" radius={[6, 6, 0, 0]} barSize={32}>
                                        {(dayOfWeekPerformance || []).map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={DAY_COLORS[index % DAY_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Row 2: Session Performance + Strategy Performance */}
            <div className="grid grid-cols-12 gap-6">
                {/* Session Performance — Col 6 */}
                <div className="col-span-12 lg:col-span-6">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-pink-500/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-pink-500 rounded-full inline-block" />
                                <Clock className="w-4 h-4 text-pink-400" />
                                {dict?.analytics?.sessionTitle || 'Session Performance'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-6">
                            {/* Session Bars */}
                            <div className="space-y-3">
                                {(sessionPerformance || []).map((s) => {
                                    const maxProfit = Math.max(...(sessionPerformance || []).map(x => Math.abs(x.profit)), 1)
                                    const barWidth = Math.min(Math.abs(s.profit) / maxProfit * 100, 100)
                                    return (
                                        <div key={s.session} className="group/bar">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SESSION_COLORS[s.session] || '#9ca3af' }} />
                                                    <span className="text-sm font-bold text-white">{s.session}</span>
                                                    <span className="text-[10px] text-gray-600">{s.count} trades</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-bold ${s.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}`}>{s.winRate}% WR</span>
                                                    <span className={`text-sm font-black ${s.profit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                                        {s.profit >= 0 ? '+' : ''}${s.profit.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${barWidth}%`,
                                                        backgroundColor: s.profit >= 0 ? (SESSION_COLORS[s.session] || '#ccf381') : '#ef4444'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                {(!sessionPerformance || sessionPerformance.length === 0) && (
                                    <p className="text-gray-600 text-sm text-center py-8">No session data</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Strategy Performance — Col 6 */}
                <div className="col-span-12 lg:col-span-6">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-[#ccf381]/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                                <Tag className="w-4 h-4 text-[#ccf381]" />
                                {dict?.analytics?.strategyTitle || 'Strategy Performance'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-6">
                            {(strategyPerformance && strategyPerformance.length > 0) ? (
                                <div className="space-y-3">
                                    {strategyPerformance.map((s, i) => {
                                        const maxProfit = Math.max(...strategyPerformance.map(x => Math.abs(x.profit)), 1)
                                        const barWidth = Math.min(Math.abs(s.profit) / maxProfit * 100, 100)
                                        return (
                                            <div key={s.strategy}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#ccf381]/10 border border-[#ccf381]/25 text-[#ccf381]">#{s.strategy}</span>
                                                        <span className="text-[10px] text-gray-600">{s.count} trades</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-bold ${s.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}`}>{s.winRate}% WR</span>
                                                        <span className={`text-sm font-black ${s.profit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                                            {s.profit >= 0 ? '+' : ''}${s.profit.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${barWidth}%`,
                                                            backgroundColor: s.profit >= 0 ? '#ccf381' : '#ef4444'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                                    <Tag className="w-8 h-8 mb-2 text-gray-700" />
                                    <p className="text-sm">{dict?.analytics?.noStrategyData || 'No strategy tags yet'}</p>
                                    <p className="text-[10px] text-gray-700 mt-1">Add #tags when logging trades</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
