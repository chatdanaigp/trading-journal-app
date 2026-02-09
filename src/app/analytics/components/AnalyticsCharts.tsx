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
            <div className="grid grid-cols-1 gap-8 mb-8">
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
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Advanced Equity Curve */}
            <Card className="col-span-1 lg:col-span-2 relative border-0 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-[#ccf381]/20 transition-colors duration-500" />

                <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                        Portfolio Growth
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 h-[400px] pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.equityCurve} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfitAnalytics" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ccf381" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ccf381" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                            <XAxis dataKey="date" stroke="#555" fontSize={12} tickLine={false} axisLine={false} minTickGap={50} />
                            <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#ccf381' }}
                                formatter={(val: number) => [`$${val.toFixed(2)}`, 'Equity']}
                            />
                            <Area type="monotone" dataKey="profit" stroke="#ccf381" strokeWidth={3} fillOpacity={1} fill="url(#colorProfitAnalytics)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Asset Performance (Bar Chart) */}
            <Card className="relative border-0 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-[#ccf381]/20 transition-colors duration-500" />

                <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
                        Asset Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 h-[300px] pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.assetPerformance} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                            <YAxis dataKey="symbol" type="category" stroke="#fff" fontSize={12} tickLine={false} axisLine={false} width={60} />
                            <Tooltip
                                cursor={{ fill: '#252525' }}
                                contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            />
                            <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.assetPerformance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#ccf381' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Win Rate Distribution (Pie Chart) */}
            <Card className="relative border-0 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-[#ccf381]/20 transition-colors duration-500" />

                <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
                        Win/Loss Ratio
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 h-[300px] flex items-center justify-center pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.winRateDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.winRateDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-12">
                        <span className="text-3xl font-bold text-white">{data.stats.winRate.toFixed(1)}%</span>
                        <span className="text-xs text-gray-500">Win Rate</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
