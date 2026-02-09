'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Trade = {
    id: string
    created_at: string
    profit: number | null
}

export function EquityChart({ trades }: { trades: Trade[] }) {
    // Sort trades by date (oldest first)
    const sortedTrades = [...trades].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    let cumulativeProfit = 0
    const data = sortedTrades.map((trade, index) => {
        cumulativeProfit += (trade.profit || 0)
        return {
            name: index + 1, // Trade #1, #2, etc.
            date: new Date(trade.created_at).toLocaleDateString(),
            profit: cumulativeProfit
        }
    })

    // Add initial point (0,0) if no trades, or prepending start
    if (data.length > 0) {
        data.unshift({ name: 0, date: 'Start', profit: 0 })
    } else {
        // Placeholder data for empty state
        data.push({ name: 0, date: 'Start', profit: 0 })
    }

    return (
        <Card className="relative border-0 shadow-2xl col-span-1 lg:col-span-2 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#050505] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />

            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccf381]/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none opacity-30"></div>
            <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-2">
                    Equity Curve
                    <span className="text-xs font-normal text-gray-500 bg-[#252525] px-2 py-0.5 rounded-full border border-white/5">Profit over time</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ccf381" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#ccf381" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ccf381" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value === 0 ? '' : `#${value}`}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                                axisLine={false}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#ccf381', fontWeight: 'bold' }}
                                labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Equity']}
                                labelFormatter={(label) => `Trade #${label}`}
                                cursor={{ stroke: '#ccf381', strokeWidth: 1, strokeDasharray: '5 5' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                stroke="#ccf381"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorProfit)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
