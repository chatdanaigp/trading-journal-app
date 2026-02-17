'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsData } from '../actions'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { BarChart3 } from 'lucide-react'

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
    if (data.stats.totalTrades === 0) {
        return (
            <Card className="border-0 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />

                <CardContent className="flex flex-col items-center justify-center h-[400px] text-gray-500 relative z-10">
                    <div className="p-6 bg-[#252525] rounded-full mb-4 border border-white/5 shadow-lg">
                        <BarChart3 className="w-12 h-12 text-gray-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-300">No trading data available yet.</p>
                    <p className="text-sm mt-2 text-gray-500">Start logging your trades to see insights here!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Row 1: Equity Curve (8 cols) + Win/Loss Donut (4 cols) — Bento */}
            <div className="grid grid-cols-12 gap-6">
                {/* Equity Curve — Col 8 */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-[#ccf381]/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                                Portfolio Growth
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 h-[320px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.equityCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorProfitAnalytics" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ccf381" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#ccf381" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                                    <XAxis dataKey="date" stroke="#555" fontSize={11} tickLine={false} axisLine={false} minTickGap={50} />
                                    <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#ccf381' }}
                                        formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Equity']}
                                    />
                                    <Area type="monotone" dataKey="profit" stroke="#ccf381" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfitAnalytics)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Win/Loss Donut — Col 4 */}
                <div className="col-span-12 lg:col-span-4">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-purple-500/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
                                Win/Loss Ratio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4 flex flex-col h-[320px]">
                            {/* Donut */}
                            <div className="flex-1 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.winRateDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {data.winRateDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                            formatter={(val: any, name: any) => [`${val} trades`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-white">{data.stats.winRate.toFixed(0)}%</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Win Rate</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex justify-center gap-4 pt-2 border-t border-white/5 mt-2">
                                {data.winRateDistribution.map((entry) => (
                                    <div key={entry.name} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-[11px] text-gray-400">
                                            {entry.name} <span className="text-white font-bold">{entry.value}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Row 2: Drawdown (5 cols) + Asset Performance (7 cols) — Bento */}
            <div className="grid grid-cols-12 gap-6">
                {/* Drawdown Chart — Col 5 */}
                <div className="col-span-12 lg:col-span-5">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-red-500/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
                                Drawdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 h-[280px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.equityCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                                    <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} minTickGap={40} />
                                    <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `-$${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#ef4444' }}
                                        formatter={(val: any) => [`-$${Number(val).toFixed(2)}`, 'Drawdown']}
                                    />
                                    <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDrawdown)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Asset Performance — Col 7 */}
                <div className="col-span-12 lg:col-span-7">
                    <Card className="relative border-0 shadow-2xl overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-blue-500/20 transition-colors duration-500" />

                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
                                Asset Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-6">
                            {/* Bar Chart */}
                            <div className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.assetPerformance} layout="vertical" margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={true} vertical={false} />
                                        <XAxis type="number" stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                        <YAxis dataKey="symbol" type="category" stroke="#fff" fontSize={12} tickLine={false} axisLine={false} width={70} />
                                        <Tooltip
                                            cursor={{ fill: '#252525' }}
                                            contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        />
                                        <Bar dataKey="profit" radius={[0, 6, 6, 0]} barSize={18}>
                                            {data.assetPerformance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#ccf381' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Summary Table */}
                            <div className="mt-4 border-t border-white/5 pt-4">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-gray-500 uppercase tracking-wider">
                                            <th className="text-left pb-2 font-medium">Symbol</th>
                                            <th className="text-right pb-2 font-medium">Trades</th>
                                            <th className="text-right pb-2 font-medium">Win Rate</th>
                                            <th className="text-right pb-2 font-medium">P&L</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.assetPerformance.map((a) => (
                                            <tr key={a.symbol} className="text-gray-300 hover:text-white transition-colors">
                                                <td className="py-2.5 font-bold text-white">{a.symbol}</td>
                                                <td className="py-2.5 text-right">{a.count}</td>
                                                <td className="py-2.5 text-right">
                                                    <span className={a.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}>
                                                        {a.winRate.toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td className={`py-2.5 text-right font-bold ${a.profit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                                    {a.profit >= 0 ? '+' : ''}${a.profit.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
